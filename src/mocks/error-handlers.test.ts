import { describe, expect, it } from "vitest";

import {
  graphqlForbiddenHandler,
  graphqlNetworkErrorHandler,
  graphqlRateLimitHandler,
  graphqlServerErrorHandler,
  graphqlUnauthorizedHandler,
  restForbiddenHandler,
  restServerErrorHandler,
  restUnauthorizedHandler,
} from "@/mocks/handlers";
import { server } from "@/mocks/server";
import {
  getValidPersonalAccessToken,
  MOCK_REPOS,
} from "@/mocks/static-fixtures";
import { createThrottledOctokit } from "@/github/client";
import { fetchGitHubDataWithProgress } from "@/github/fetcher";
import { archiveRepo, deleteRepo } from "@/github/mutations";

const VALID_PAT = getValidPersonalAccessToken();
const noopProgress = () => {};

// Note: fetchGitHubDataWithProgress catches errors internally via fetchRepositories and converts
// null repos to [] via ?? []. So when GraphQL errors occur, result.error is set and
// result.repos is [] (empty), not null.

describe("GraphQL error scenario handlers", () => {
  describe("graphqlUnauthorizedHandler (401)", () => {
    it("causes fetchGitHubDataWithProgress to return an error with no repos", async () => {
      server.use(graphqlUnauthorizedHandler());

      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        noopProgress,
      );

      expect(result.error).not.toBeNull();
      expect(result.repos).toEqual([]);
    });
  });

  describe("graphqlForbiddenHandler (403 scope error)", () => {
    it("causes fetchGitHubDataWithProgress to return an error on all-query override", async () => {
      server.use(graphqlForbiddenHandler());

      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        noopProgress,
      );

      expect(result.error).not.toBeNull();
    });
  });

  describe("graphqlRateLimitHandler (429)", () => {
    it("causes fetchGitHubDataWithProgress to return an error with no repos", async () => {
      server.use(graphqlRateLimitHandler("30"));

      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        noopProgress,
      );

      expect(result.error).not.toBeNull();
      expect(result.repos).toEqual([]);
    });
  });

  describe("graphqlServerErrorHandler (500)", () => {
    it("causes fetchGitHubDataWithProgress to return an error with no repos", async () => {
      server.use(graphqlServerErrorHandler());

      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        noopProgress,
      );

      expect(result.error).not.toBeNull();
      expect(result.repos).toEqual([]);
    });
  });

  describe("graphqlNetworkErrorHandler (network failure)", () => {
    it("causes fetchGitHubDataWithProgress to return an error with no repos", async () => {
      server.use(graphqlNetworkErrorHandler());

      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        noopProgress,
      );

      expect(result.error).not.toBeNull();
      expect(result.repos).toEqual([]);
    });
  });
});

describe("REST error scenario handlers", () => {
  const mockRepo = MOCK_REPOS[0];

  describe("restUnauthorizedHandler (401)", () => {
    it("causes archiveRepo to throw", async () => {
      server.use(...restUnauthorizedHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(archiveRepo(octokit, mockRepo)).rejects.toThrow();
    });

    it("causes deleteRepo to throw", async () => {
      server.use(...restUnauthorizedHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(deleteRepo(octokit, mockRepo)).rejects.toThrow();
    });
  });

  describe("restForbiddenHandler (403)", () => {
    it("causes archiveRepo to throw", async () => {
      server.use(...restForbiddenHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(archiveRepo(octokit, mockRepo)).rejects.toThrow();
    });

    it("causes deleteRepo to throw", async () => {
      server.use(...restForbiddenHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(deleteRepo(octokit, mockRepo)).rejects.toThrow();
    });
  });

  describe("restServerErrorHandler (500)", () => {
    it("causes archiveRepo to throw", async () => {
      server.use(...restServerErrorHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(archiveRepo(octokit, mockRepo)).rejects.toThrow();
    });

    it("causes deleteRepo to throw", async () => {
      server.use(...restServerErrorHandler());
      const octokit = createThrottledOctokit(VALID_PAT);

      await expect(deleteRepo(octokit, mockRepo)).rejects.toThrow();
    });
  });
});

describe("getOrgRepositories handler org isolation", () => {
  it("returns only repos owned by the queried org", async () => {
    const octokit = createThrottledOctokit(VALID_PAT);
    const testorgReposInFixtures = MOCK_REPOS.filter(
      (r) => r.owner.login === "testorg",
    );

    // Query for testorg — should return testorg-owned repos
    const response = await octokit.graphql<{
      organization: {
        login: string;
        repositories: { nodes: { id: string; owner: { login: string } }[] };
      };
    }>(
      `query getOrgRepositories($org: String!) {
        organization(login: $org) {
          login
          repositories(first: 100) { nodes { id name owner { login } } pageInfo { hasNextPage endCursor } }
        }
      }`,
      { org: "testorg" },
    );

    expect(response.organization.login).toBe("testorg");
    expect(response.organization.repositories.nodes).toHaveLength(
      testorgReposInFixtures.length,
    );
    for (const repo of response.organization.repositories.nodes) {
      expect(repo.owner.login).toBe("testorg");
    }
  });

  it("returns empty repos for org with no repos in fixtures", async () => {
    const octokit = createThrottledOctokit(VALID_PAT);

    // anotherorg exists in MOCK_ORGANIZATIONS but has no repos
    const response = await octokit.graphql<{
      organization: {
        login: string;
        repositories: { nodes: { id: string }[] };
      };
    }>(
      `query getOrgRepositories($org: String!) {
        organization(login: $org) {
          login
          repositories(first: 100) { nodes { id } pageInfo { hasNextPage endCursor } }
        }
      }`,
      { org: "anotherorg" },
    );

    expect(response.organization.login).toBe("anotherorg");
    expect(response.organization.repositories.nodes).toHaveLength(0);
  });

  it("returns NOT_FOUND error for unknown orgs", async () => {
    const octokit = createThrottledOctokit(VALID_PAT);

    await expect(
      octokit.graphql(
        `query getOrgRepositories($org: String!) {
          organization(login: $org) { login }
        }`,
        { org: "nonexistent-org" },
      ),
    ).rejects.toThrow(/nonexistent-org/);
  });
});
