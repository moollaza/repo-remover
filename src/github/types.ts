/**
 * Shared types for the GitHub API module.
 */
import { type Repository } from "@octokit/graphql-schema";

/** Progressive loading state emitted during data fetching. */
export interface LoadingProgress {
  currentOrg?: string;
  orgsLoaded: number;
  orgsTotal: number;
  repos: Repository[];
  stage: "complete" | "orgs" | "personal";
  user: AppUser | null;
}

/**
 * Subset of GitHub user profile data used by the app.
 * Named `AppUser` to avoid shadowing `@octokit/graphql-schema`'s `User` type.
 */
export interface AppUser {
  avatarUrl: string;
  id: string;
  login: string;
  name: string;
  url: string;
}

/** Return value from fetchGitHubDataWithProgress. */
export interface FetchResult {
  error: Error | null;
  permissionWarning?: string;
  repos: null | Repository[];
  samlProtectedOrgs?: string[];
  user: AppUser | null;
}

/** Result of checking a classic PAT's OAuth scopes against required scopes. */
export interface ScopeCheckResult {
  grantedScopes: string[];
  missingScopes: string[];
}
