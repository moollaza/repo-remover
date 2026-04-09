import { useContext } from "react";

import { GitHubContext } from "@/contexts/github-context";

/**
 * Hook to use the GitHub context.
 * Throws if used outside GitHubDataProvider.
 *
 * @example
 * const { isAuthenticated, isError, isLoading, login, logout, pat, refetchData, repos, setLogin, setPat, user } = useGitHubData();
 *
 * @see {@link GitHubContext}
 * @see {@link GitHubDataProvider}
 */
export function useGitHubData() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error("useGitHubData must be used within GitHubDataProvider");
  }
  return context;
}
