import { type Repository, type User } from "@octokit/graphql-schema";
import { createContext } from "react";
import { type KeyedMutator } from "swr";

import { type GitHubFetcherResult } from "@/providers/github-data-provider";
import { type LoadingProgress } from "@/github/types";

/**
 * Context type for GitHub data and authentication
 * Used to share the data and authentication state across the app
 * Use with the <GitHubDataProvider> component to provide the data and authentication state
 * Use with the <useGitHubData> hook to access the data and authentication state
 *
 * @example
 * <GitHubDataProvider>
 *   <GitHubContext.Provider value={contextValue}>
 *     <App />
 *   </GitHubContext.Provider>
 * </GitHubDataProvider>
 *
 * @see {@link GitHubDataProvider}
 * @see {@link useGitHubData}
 */
export interface GitHubContextType {
  /**
   * The error object if an error occurred during fetching.
   */
  error: Error | null;

  /**
   * Whether we have partial data despite an error.
   */
  hasPartialData: boolean;

  /**
   * Whether the user is authenticated.
   */
  isAuthenticated: boolean;

  /**
   * Whether there is an error with the authentication.
   */
  isError: boolean;

  /**
   * Whether the data is initialized.
   */
  isInitialized: boolean;

  /**
   * Whether data is loading for the first time (no cached data yet).
   */
  isLoading: boolean;

  /**
   * Whether data is being refreshed in the background (cached data is visible).
   */
  isRefreshing: boolean;

  /**
   * The login of the user.
   */
  login: null | string;

  /**
   * Logs out the user.
   */
  logout: () => void;

  /**
   * SWR mutate function to manually trigger revalidation
   */
  mutate: KeyedMutator<GitHubFetcherResult>;

  /**
   * The personal access token of the user.
   */
  pat: null | string;

  /**
   * Permission warning message if token lacks required scopes.
   */
  permissionWarning?: string;

  /**
   * Loading progress information for progressive rendering.
   */
  progress: LoadingProgress | null;

  /**
   * Refetches the data.
   */
  refetchData: () => void;

  /**
   * List of org names that failed to load due to SAML SSO enforcement.
   */
  samlProtectedOrgs: string[];

  /**
   * The repositories of the user.
   */
  repos: null | Repository[];

  /**
   * Sets the login of the user.
   */
  setLogin: (login: string) => void;

  /**
   * Sets the personal access token of the user.
   * @param pat The personal access token
   * @param remember Whether to persist the token in encrypted localStorage (default: true)
   */
  setPat: (pat: string, remember?: boolean) => void;

  /**
   * The user.
   */
  user: null | User;
}

/**
 * React context for GitHub data and authentication.
 * Initialized with undefined — useGitHubData() throws if used outside GitHubDataProvider.
 */
export const GitHubContext = createContext<GitHubContextType | undefined>(
  undefined,
);
