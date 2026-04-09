/**
 * Data fetching orchestration for GitHub repositories and organizations.
 *
 * Fetches in three stages with progressive callbacks:
 * 1. Personal repos + token scope check (parallel)
 * 2. Organization list
 * 3. Organization repos (all orgs in parallel)
 *
 * Gracefully handles SAML-protected and scope-limited orgs by skipping them
 * and surfacing warnings rather than failing the entire fetch.
 */
import { GraphqlResponseError } from "@octokit/graphql";
import { type Repository } from "@octokit/graphql-schema";

import { debug } from "@/utils/debug";

import { createThrottledOctokit, type ThrottledOctokitType } from "./client";
import {
  GET_CURRENT_USER,
  GET_ORG_REPOS,
  GET_ORGS,
  GET_REPOS,
  type CurrentUserResponse,
  type OrgRepositoriesResponse,
  type OrganizationsResponse,
  type UserRepositoriesResponse,
} from "./queries";
import { checkTokenScopes, combineWarnings } from "./scopes";
import { type AppUser, type FetchResult, type LoadingProgress } from "./types";

function toUser(data: {
  avatarUrl: string;
  id: string;
  login: string;
  name?: string;
}): AppUser {
  return {
    avatarUrl: data.avatarUrl,
    id: data.id,
    login: data.login,
    name: data.name ?? data.login,
    url: `https://github.com/${data.login}`,
  };
}

/**
 * Fetches GitHub data with progressive loading callbacks.
 */
export async function fetchGitHubDataWithProgress(
  params: [string, string],
  onProgress: (progress: LoadingProgress) => void,
): Promise<FetchResult> {
  const [login, pat] = params;

  if (!pat) {
    throw new Error("PAT is required");
  }

  const octokit = createThrottledOctokit(pat);
  const samlProtectedOrgs: string[] = [];
  const scopeLimitedOrgs: string[] = [];
  let userLogin = login;
  let userData: AppUser | null = null;

  try {
    if (!userLogin) {
      const userResponse =
        await octokit.graphql<CurrentUserResponse>(GET_CURRENT_USER);
      userLogin = userResponse.viewer.login;
    }

    const [userRepoResult, scopeResult] = await Promise.all([
      fetchRepositories(octokit, userLogin),
      checkTokenScopes(octokit),
    ]);
    userData = userRepoResult.userData;
    let allRepos: Repository[] = userRepoResult.repos ?? [];

    onProgress({
      orgsLoaded: 0,
      orgsTotal: 0,
      repos: allRepos,
      stage: "personal",
      user: userData,
    });

    let orgs: { login: string; url: string }[] = [];
    let permissionError: null | string = null;

    try {
      orgs = await fetchAllOrganizations(octokit, userLogin);
    } catch (error) {
      if (error instanceof Error) {
        permissionError =
          "Your token may lack the read:org scope needed to fetch organization repositories. " +
          "Update your token at https://github.com/settings/tokens";
        debug.warn("Organization access limited:", error.message);
      } else {
        throw error;
      }
    }

    if (orgs.length > 0) {
      let completedOrgs = 0;

      const orgReposPromises = orgs.map(async (org) => {
        const orgRepos = await fetchAllOrgRepos(
          octokit,
          org.login,
          samlProtectedOrgs,
          scopeLimitedOrgs,
        );

        completedOrgs++;
        // concat (not push) so each onProgress gets an immutable snapshot
        allRepos = allRepos.concat(orgRepos);

        onProgress({
          currentOrg: org.login,
          orgsLoaded: completedOrgs,
          orgsTotal: orgs.length,
          repos: allRepos,
          stage: "orgs",
          user: userData,
        });

        return orgRepos;
      });

      await Promise.all(orgReposPromises);
    }

    onProgress({
      orgsLoaded: orgs.length,
      orgsTotal: orgs.length,
      repos: allRepos,
      stage: "complete",
      user: userData,
    });

    const permissionWarning = combineWarnings(
      scopeResult,
      permissionError,
      scopeLimitedOrgs,
    );

    return {
      error: userRepoResult.error,
      repos: allRepos,
      user: userData,
      ...(permissionWarning && { permissionWarning }),
      ...(samlProtectedOrgs.length > 0 && { samlProtectedOrgs }),
    };
  } catch (error) {
    debug.error("Error fetching GitHub data:", error);
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching data"),
      repos: null,
      user: null,
    };
  }
}

/** Paginates through all organizations the user belongs to. */
async function fetchAllOrganizations(
  octokit: ThrottledOctokitType,
  userLogin: string,
): Promise<{ login: string; url: string }[]> {
  let orgs: { login: string; url: string }[] = [];
  let cursor: null | string = null;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawResponse: any = await octokit.graphql(GET_ORGS, {
        cursor,
        login: userLogin,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (rawResponse?.user?.organizations?.nodes) {
        const typedResponse = rawResponse as OrganizationsResponse;
        const nodes = typedResponse.user.organizations.nodes;
        orgs = orgs.concat(nodes);

        const pageInfo = typedResponse.user.organizations.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      } else {
        debug.warn("Unexpected organization response structure:", rawResponse);
        hasNextPage = false;
      }
    } catch (error) {
      debug.error("Error fetching organizations:", error);
      throw error;
    }
  }

  return orgs;
}

/**
 * Paginates through all repos for a single org.
 * On SAML or scope errors, records the org in the tracking arrays and returns partial results.
 */
async function fetchAllOrgRepos(
  octokit: ThrottledOctokitType,
  orgLogin: string,
  samlProtectedOrgs: string[],
  scopeLimitedOrgs: string[],
): Promise<Repository[]> {
  let repos: Repository[] = [];
  let cursor: null | string = null;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawResponse: any = await octokit.graphql(GET_ORG_REPOS, {
        cursor,
        org: orgLogin,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (rawResponse?.organization?.repositories?.nodes) {
        const typedResponse = rawResponse as OrgRepositoriesResponse;
        const nodes = typedResponse.organization.repositories.nodes;
        repos = repos.concat(nodes);

        const pageInfo = typedResponse.organization.repositories.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      } else {
        debug.warn(
          `Unexpected response structure for org ${orgLogin}:`,
          rawResponse,
        );
        hasNextPage = false;
      }
    } catch (error) {
      debug.error(`Error fetching repos for org ${orgLogin}:`, error);

      if (
        error instanceof Error &&
        error.message.includes(
          "Resource protected by organization SAML enforcement",
        )
      ) {
        debug.warn(`Skipping org ${orgLogin} due to SAML SSO enforcement`);
        samlProtectedOrgs.push(orgLogin);
      } else if (
        error instanceof Error &&
        error.message.includes("required scopes")
      ) {
        debug.warn(`Skipping org ${orgLogin} due to insufficient permissions`);
        scopeLimitedOrgs.push(orgLogin);
      }

      hasNextPage = false;
    }
  }

  return repos;
}

/** Fetches user repos with pagination. Returns partial data on GraphQL errors. */
async function fetchRepositories(
  octokit: ThrottledOctokitType,
  userLogin: string,
): Promise<{
  error: Error | null;
  repos: null | Repository[];
  userData: AppUser | null;
}> {
  try {
    const result = await paginateGraphQLQuery<UserRepositoriesResponse>(
      octokit,
      GET_REPOS,
      { login: userLogin },
    );

    const { user } = result;
    const userData = toUser(user);

    return {
      error: null,
      repos: user.repositories.nodes,
      userData,
    };
  } catch (error) {
    debug.error("Error fetching GitHub repositories:", error);

    if (error instanceof GraphqlResponseError) {
      debug.log("GraphQL error:", error.message);
      const partialRepos =
        (error.data as { user?: { repositories?: { nodes?: Repository[] } } })
          ?.user?.repositories?.nodes ?? null;

      let userData = null;
      const partialUser = (
        error.data as {
          user?: {
            avatarUrl: string;
            id: string;
            login: string;
            name?: string;
          };
        }
      )?.user;
      if (partialUser) {
        userData = toUser(partialUser);
      }

      return {
        error: error,
        repos: partialRepos,
        userData,
      };
    }

    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching repositories"),
      repos: null,
      userData: null,
    };
  }
}

/** Type-safe wrapper around Octokit's untyped graphql.paginate. */
async function paginateGraphQLQuery<T>(
  octokit: ThrottledOctokitType,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await octokit.graphql.paginate(query, variables);

  return result as T;
}
