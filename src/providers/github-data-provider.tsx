import { type Repository, type User } from "@octokit/graphql-schema";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useSWR from "swr";

import { GitHubContext, GitHubContextType } from "@/contexts/github-context";
import { analytics } from "@/utils/analytics";
import { debug } from "@/utils/debug";
import { fetchGitHubDataWithProgress } from "@/github/fetcher";
import { type LoadingProgress } from "@/github/types";
import { secureStorage } from "@/utils/secure-storage";

const IS_DEV = import.meta.env.DEV;

// Interface for SWR fetcher function
export interface GitHubFetcherResult {
  error: Error | null;
  permissionWarning?: string;
  repos: null | Repository[];
  samlProtectedOrgs?: string[];
  user: null | User;
}

type GitHubFetcherKey = [string, string];

/**
 * Props for the GitHubDataProvider component.
 */
interface GitHubProviderProps {
  children: React.ReactNode;
}

/**
 * A comprehensive GitHub provider that handles both authentication and data fetching.
 * This provider manages:
 * 1. Authentication state (login, PAT)
 * 2. Data fetching with SWR for caching and revalidation
 * 3. Local storage persistence
 * 4. Actions for login, logout, and data refetching
 */
export const GitHubDataProvider: React.FC<GitHubProviderProps> = ({
  children,
}) => {
  // Authentication state
  const [login, setLoginState] = useState<null | string>(null);
  const [pat, setPatState] = useState<null | string>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState<LoadingProgress | null>(null);
  // Progressive data from onProgress callbacks — shown while SWR fetch is in flight.
  // We intentionally do NOT call SWR's mutate() during the fetch because it corrupts
  // SWR's internal cache state and causes the final fetcher result (with permissionWarning,
  // samlProtectedOrgs) to be silently discarded.
  const [progressiveRepos, setProgressiveRepos] = useState<null | Repository[]>(
    null,
  );
  const [progressiveUser, setProgressiveUser] = useState<null | User>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Load from secure storage on mount
  useLayoutEffect(() => {
    async function loadStoredData() {
      try {
        const storedLogin = await secureStorage.getItem("login");
        const storedPat = await secureStorage.getItem("pat");

        if (storedLogin && typeof storedLogin === "string")
          setLoginState(storedLogin);
        if (storedPat && typeof storedPat === "string") setPatState(storedPat);

        // The marketing-side PAT form writes the token to secureStorage and
        // sets this flag when the user did NOT tick "Remember my token". We
        // honour it here by removing the persisted token as soon as it has
        // been loaded into memory — preserving the ephemeral semantics
        // without requiring the form to share React state with this
        // provider.
        if (
          typeof window !== "undefined" &&
          window.sessionStorage?.getItem("pat_ephemeral") === "1"
        ) {
          window.sessionStorage.removeItem("pat_ephemeral");
          secureStorage.removeItem("pat");
          secureStorage.removeItem("login");
        }
      } catch (error) {
        debug.warn("Error accessing secure storage:", error);
      } finally {
        setIsInitialized(true);
      }
    }

    void loadStoredData();
  }, []);

  // Derived authentication state
  const isAuthenticated = Boolean(isInitialized && Boolean(pat));

  // Stable SWR key: only depends on PAT (not login, which loads async and would cause refetch)
  // Login is passed to the fetcher separately via closure
  const { data, error, isValidating, mutate } = useSWR<
    GitHubFetcherResult,
    Error,
    GitHubFetcherKey | null
  >(
    pat ? (["repos", pat] as GitHubFetcherKey) : null,
    // Use the progress-aware fetcher — login comes from closure, not the SWR key
    async ([, pat]): Promise<GitHubFetcherResult> => {
      const result = await fetchGitHubDataWithProgress(
        [login ?? "", pat],
        (progressUpdate) => {
          setProgress(progressUpdate);
          // Store progressive data in React state for immediate rendering.
          // Do NOT call mutate() here — it corrupts SWR cache and drops
          // the final fetch result (permissionWarning, samlProtectedOrgs).
          setProgressiveRepos(progressUpdate.repos);
          setProgressiveUser(progressUpdate.user as null | User);
        },
      );

      // Cast the result to match GitHubFetcherResult type
      return {
        ...result,
        user: result.user as null | User,
      };
    },
    {
      dedupingInterval: 60000, // 1 minute
      onError: (err: Error) => {
        debug.error("GitHub API error:", err);
        // Clear progress on error
        setProgress(null);
        // If error is authentication related, consider clearing credentials
        if (err.message.includes("401") || err.message.includes("auth")) {
          debug.warn("Authentication error detected, consider logging out");
        }
      },
      onSuccess: (data: GitHubFetcherResult) => {
        // Clear progressive state — SWR data is now authoritative
        setProgressiveRepos(null);
        setProgressiveUser(null);
        // Set the login from the API response if it wasn't provided
        if (data.user?.login && !login) {
          setLogin(data.user.login);
        }
        // Track token validation (once-per-session handled by analytics registry)
        if (pat) {
          analytics.trackTokenValidated();
        }
        // Clear progress when complete
        setProgress(null);
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Derived data state - handle partial data cases
  // isLoading = true until we have ANY visible data (SWR or progressive).
  // isRefreshing = background revalidation while content is already visible.
  const hasVisibleData = !!data || !!progressiveRepos;
  const isLoading = isAuthenticated && !hasVisibleData && !error;
  const isRefreshing = isAuthenticated && hasVisibleData && isValidating;

  // We have an error state if there's an SWR error OR if data.error exists but we have no partial data
  const isError = Boolean(error ?? (data?.error && !data.repos && !data.user));

  // Handle data loading and errors - use partial data if available.
  // Fall back to progressive state during loading for immediate rendering.
  const repos = data?.repos ?? progressiveRepos;
  const user = data?.user ?? progressiveUser;

  // Derive login from API user data if state is null (storage may fail to load it)
  const effectiveLogin = login ?? (user?.login as null | string) ?? null;

  // Track if we have partial data with an error
  const hasPartialData = Boolean(data?.error && (data.repos ?? data.user));

  // Actions with localStorage persistence
  const setLogin = useCallback((newLogin: string) => {
    if (!newLogin || typeof newLogin !== "string") {
      debug.error("Invalid login format");
      return;
    }

    setLoginState(newLogin);
    if (typeof window !== "undefined") {
      secureStorage.setItem("login", newLogin).catch((error) => {
        debug.warn("Failed to save login to secure storage:", error);
      });
    }
  }, []);

  const setPat = useCallback((newPat: string, remember = true) => {
    if (!newPat || typeof newPat !== "string") {
      debug.error("Invalid Personal Access Token format");
      return;
    }

    setPatState(newPat);
    if (remember && typeof window !== "undefined") {
      secureStorage.setItem("pat", newPat).catch((error) => {
        debug.warn("Failed to save PAT to secure storage:", error);
      });
    } else if (!remember && typeof window !== "undefined") {
      // Clear any previously stored token
      secureStorage.removeItem("pat");
      secureStorage.removeItem("login");
    }
  }, []);

  const logout = useCallback(() => {
    setLoginState(null);
    setPatState(null);
    setProgressiveRepos(null);
    setProgressiveUser(null);
    if (typeof window !== "undefined") {
      try {
        secureStorage.removeItem("login");
        secureStorage.removeItem("pat");
      } catch (error) {
        debug.warn("Failed to clear secure storage during logout:", error);
      }
    }
  }, []);

  // Rate-limited data refetching
  const refetchData = useCallback(() => {
    const now = Date.now();
    // Implement a simple rate limiting (5 second cooldown)
    if (now - lastFetchTimeRef.current > 5000) {
      lastFetchTimeRef.current = now;
      void mutate();
    } else {
      debug.warn("Rate limiting refetch attempts");
    }
  }, [mutate]);

  // Log in development mode
  // Use useEffect for logging to avoid excessive console output
  useEffect(() => {
    if (IS_DEV) {
      debug.log("GitHub Provider state updated:", {
        hasLogin: !!login,
        hasPartialData,
        hasRepos: repos?.length ?? 0,
        isAuthenticated,
        isError,
        isInitialized,
      });
    }
  }, [hasPartialData, isAuthenticated, isError, isInitialized, login, repos]);

  // Context value
  const value: GitHubContextType = {
    // Include the actual error for consumers to inspect if needed
    error: data?.error ?? error ?? null,
    hasPartialData,
    isAuthenticated,
    isError,
    isInitialized,
    isLoading,
    isRefreshing,
    login: effectiveLogin,
    logout,
    mutate,
    pat,
    permissionWarning: data?.permissionWarning,
    progress,
    refetchData,
    samlProtectedOrgs: data?.samlProtectedOrgs ?? [],
    repos,
    setLogin,
    setPat,
    user,
  };

  return (
    <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>
  );
};
