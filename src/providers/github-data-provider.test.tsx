import "@testing-library/jest-dom";
import { type Repository, type User } from "@octokit/graphql-schema";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGitHubData } from "@/hooks/use-github-data";
import {
  getValidPersonalAccessToken,
  MOCK_REPOS,
  MOCK_USER,
} from "@/mocks/static-fixtures";
import { analytics } from "@/utils/analytics";
import { debug } from "@/utils/debug";
import { fetchGitHubDataWithProgress } from "@/github/fetcher";
import { secureStorage } from "@/utils/secure-storage";

import { GitHubDataProvider } from "./github-data-provider";

vi.mock("@/utils/analytics", () => ({
  analytics: {
    trackTokenValidated: vi.fn(),
  },
}));

vi.mock("@/utils/debug", () => ({
  debug: {
    error: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    log: vi.fn(),
    sanitize: vi.fn((v: unknown) => v),
    table: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@/github/fetcher", () => ({
  fetchGitHubDataWithProgress: vi.fn(),
}));

const mockFetch = vi.mocked(fetchGitHubDataWithProgress);

const validToken = getValidPersonalAccessToken();

/** Wrapper that isolates SWR cache per test */
function IsolatedProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <GitHubDataProvider>{children}</GitHubDataProvider>
    </SWRConfig>
  );
}

// Default mock: successful API response
function setupSuccessfulFetch() {
  mockFetch.mockResolvedValue({
    error: null,
    repos: MOCK_REPOS as Repository[],
    user: MOCK_USER as unknown as User,
  });
}

// Test cleanup
afterEach(() => {
  localStorage.clear();
  // Clear secure storage prefixed keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("secure_")) {
      localStorage.removeItem(key);
    }
  });
  vi.clearAllMocks();
});

describe("GitHubDataProvider", () => {
  describe("Initial state", () => {
    it("provides empty initial state", () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: GitHubDataProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.login).toBeNull();
      expect(result.current.pat).toBeNull();
      expect(result.current.repos).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it("loads token from secure storage if available", async () => {
      // Setup secure storage before rendering
      await act(async () => {
        await secureStorage.setItem("pat", validToken);
        await secureStorage.setItem("login", "testuser");
      });

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: GitHubDataProvider,
      });

      // Initial state should reflect the token from secure storage
      await waitFor(() => {
        expect(result.current.pat).toBe(validToken);
        expect(result.current.login).toBe("testuser");
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe("Authentication", () => {
    it("sets token and login", async () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: GitHubDataProvider,
      });

      // Initial state
      expect(result.current.pat).toBeNull();
      expect(result.current.login).toBeNull();

      // Set token and login
      act(() => {
        result.current.setPat(validToken);
        result.current.setLogin("testuser");
      });

      // State should be updated
      await waitFor(() => {
        expect(result.current.pat).toBe(validToken);
        expect(result.current.login).toBe("testuser");
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Should be stored in secure storage
      await waitFor(async () => {
        expect(await secureStorage.getItem("pat")).toBe(validToken);
        expect(await secureStorage.getItem("login")).toBe("testuser");
      });
    });

    it("logs out correctly", async () => {
      // Setup initial authenticated state
      await secureStorage.setItem("pat", validToken);
      await secureStorage.setItem("login", "testuser");

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: GitHubDataProvider,
      });

      // Wait for initial state to be loaded
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout
      act(() => {
        result.current.logout();
      });

      // State should be reset
      await waitFor(() => {
        expect(result.current.pat).toBeNull();
        expect(result.current.login).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Should be removed from secure storage
      await waitFor(async () => {
        expect(await secureStorage.getItem("pat")).toBeNull();
        expect(await secureStorage.getItem("login")).toBeNull();
      });
    });
  });

  describe("setPat behavior", () => {
    it("rejects empty string and does not update state or storage", async () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Call setPat with empty string
      act(() => {
        result.current.setPat("");
      });

      // State should remain null
      expect(result.current.pat).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Storage should not have been written
      expect(await secureStorage.getItem("pat")).toBeNull();
    });

    it("persists token to secure storage by default (remember=true)", async () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Set a valid token (remember defaults to true)
      act(() => {
        result.current.setPat(validToken);
      });

      // State should update
      await waitFor(() => {
        expect(result.current.pat).toBe(validToken);
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Token should be persisted
      await waitFor(async () => {
        expect(await secureStorage.getItem("pat")).toBe(validToken);
      });
    });

    it("does not persist token when remember=false", async () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Pre-store a token to verify it gets cleared
      await secureStorage.setItem("pat", "old_token");

      act(() => {
        result.current.setPat(validToken, false);
      });

      await waitFor(() => {
        expect(result.current.pat).toBe(validToken);
      });

      // Token and login should be cleared from storage
      expect(await secureStorage.getItem("pat")).toBeNull();
    });

    it("does not clear previously stored login when setting a new token", async () => {
      // Pre-store a login
      await secureStorage.setItem("login", "previoususer");

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Wait for initialization to load the stored login
      await waitFor(() => {
        expect(result.current.login).toBe("previoususer");
      });

      // Set a new token without setting login
      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.pat).toBe(validToken);
      });

      // Login should still be intact in both state and storage
      expect(result.current.login).toBe("previoususer");
      expect(await secureStorage.getItem("login")).toBe("previoususer");
    });
  });

  describe("Data fetching", () => {
    it("validates authentication state changes properly", async () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: GitHubDataProvider,
      });

      // Initial state - not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.repos).toBeNull();
      expect(result.current.user).toBeNull();

      // Set valid credentials
      act(() => {
        result.current.setPat(validToken);
        result.current.setLogin("testuser");
      });

      // Should now be authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.pat).toBe(validToken);
        expect(result.current.login).toBe("testuser");
      });
    });
  });

  describe("Analytics", () => {
    it("tracks token_validated only after successful API response", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Set PAT — this triggers SWR fetch
      act(() => {
        result.current.setPat(validToken);
      });

      // Analytics should NOT fire immediately on setPat
      expect(analytics.trackTokenValidated).not.toHaveBeenCalled();

      // Wait for SWR to complete successfully (repos loaded = API success)
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      // Now analytics should have fired after successful API response
      expect(analytics.trackTokenValidated).toHaveBeenCalledTimes(1);
    });

    it("does not fire trackTokenValidated twice on SWR revalidation", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      expect(analytics.trackTokenValidated).toHaveBeenCalledTimes(1);

      // Trigger a refetch (simulates SWR revalidation)
      act(() => {
        result.current.refetchData();
      });

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      // Should still be called only once — ref guards against duplicates
      expect(analytics.trackTokenValidated).toHaveBeenCalledTimes(1);
    });
  });

  describe("permissionWarning context exposure", () => {
    it("exposes permissionWarning from fetchGitHubDataWithProgress", async () => {
      mockFetch.mockResolvedValue({
        error: null,
        permissionWarning: "token lacks read:org scope",
        repos: MOCK_REPOS as Repository[],
        user: MOCK_USER as unknown as User,
      });

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      expect(result.current.permissionWarning).toBe(
        "token lacks read:org scope",
      );
    });

    it("preserves permissionWarning even with progress callback mutations", async () => {
      // This test simulates the real scenario where progress callbacks
      // call mutate() during the fetch, which in SWR v2 overrides the
      // fetcher return value. The fix stores warnings in React state.
      mockFetch.mockImplementation(async (_params, onProgress) => {
        // Simulate progress callbacks (these trigger mutate in the provider)
        if (onProgress) {
          onProgress({
            orgsLoaded: 0,
            orgsTotal: 0,
            repos: MOCK_REPOS as Repository[],
            stage: "personal",
            user: MOCK_USER as unknown as User,
          });
          onProgress({
            orgsLoaded: 0,
            orgsTotal: 0,
            repos: MOCK_REPOS as Repository[],
            stage: "complete",
            user: MOCK_USER as unknown as User,
          });
        }
        return {
          error: null,
          permissionWarning:
            "Missing delete_repo scope — you won't be able to delete repositories.",
          repos: MOCK_REPOS as Repository[],
          samlProtectedOrgs: ["saml-org"],
          user: MOCK_USER as unknown as User,
        };
      });

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      // Warning should be present despite progress callback mutations
      expect(result.current.permissionWarning).toBe(
        "Missing delete_repo scope — you won't be able to delete repositories.",
      );
      expect(result.current.samlProtectedOrgs).toEqual(["saml-org"]);
    });

    it("permissionWarning is undefined when API returns no warning", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      expect(result.current.permissionWarning).toBeUndefined();
    });
  });

  describe("refetchData rate limiting", () => {
    it("first call triggers mutate", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Authenticate so SWR starts fetching
      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      // Clear mock to track only refetch calls
      mockFetch.mockClear();
      setupSuccessfulFetch();

      // First refetchData call should trigger mutate
      act(() => {
        result.current.refetchData();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it("second call within 5s is silently ignored", async () => {
      const now = 1000000;
      const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      mockFetch.mockClear();
      setupSuccessfulFetch();

      // First call at t=1000000 — allowed
      act(() => {
        result.current.refetchData();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      setupSuccessfulFetch();

      // Move time forward 2s (within 5s cooldown)
      dateNowSpy.mockReturnValue(now + 2000);

      // Second call — should be rate-limited
      act(() => {
        result.current.refetchData();
      });

      // Fetch should NOT have been called again
      expect(mockFetch).not.toHaveBeenCalled();

      dateNowSpy.mockRestore();
    });

    it("call after 5s cooldown triggers mutate again", async () => {
      const now = 2000000;
      const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      mockFetch.mockClear();
      setupSuccessfulFetch();

      // First call at t=2000000 — allowed
      act(() => {
        result.current.refetchData();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      setupSuccessfulFetch();

      // Move time past the 5-second cooldown
      dateNowSpy.mockReturnValue(now + 5001);

      // This call should be allowed
      act(() => {
        result.current.refetchData();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      dateNowSpy.mockRestore();
    });
  });

  describe("isLoading state machine", () => {
    it("isLoading=true when authenticated with no data yet", async () => {
      // Make fetch hang (never resolve) so data stays null
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFetch.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Set PAT to become authenticated
      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for isAuthenticated to become true
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // isLoading should be true: authenticated + no data + no error
      expect(result.current.isLoading).toBe(true);
      expect(result.current.repos).toBeNull();
    });

    it("isRefreshing=true when progress is active with existing data", async () => {
      // Capture the progress callback so we can control it
      let progressCallback:
        | ((progress: import("@/github/types").LoadingProgress) => void)
        | null = null;
      mockFetch.mockImplementation(async (_key, onProgress) => {
        progressCallback = onProgress as typeof progressCallback;
        // Call progress to simulate partial data arriving
        onProgress?.({
          currentOrg: "testorg",
          orgsLoaded: 0,
          orgsTotal: 1,
          repos: MOCK_REPOS as Repository[],
          stage: "orgs",
          user: MOCK_USER as unknown as User,
        });
        // Don't resolve yet — keep progress active
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise(() => {});
      });

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for progress to set partial data and SWR to be validating
      // React 19's automatic batching may synchronize these in a different
      // order, so assert all conditions together inside waitFor.
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isRefreshing).toBe(true);
        expect(result.current.progress).not.toBeNull();
      });
      expect(progressCallback).not.toBeNull();
    });

    it("isLoading=false once data arrives and progress is cleared", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for data to fully load (onSuccess clears progress)
      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
        expect(result.current.progress).toBeNull();
      });

      // isLoading should be false: data arrived, progress cleared
      expect(result.current.isLoading).toBe(false);
    });

    it("isLoading=false immediately after logout", async () => {
      setupSuccessfulFetch();

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Authenticate and wait for data
      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.repos).not.toBeNull();
      });

      // Logout
      act(() => {
        result.current.logout();
      });

      // isLoading should be false: not authenticated → isLoading can't be true
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("isLoading=false when not authenticated", () => {
      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      // Not authenticated, no data, no error → isLoading is still false
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("isLoading=false when there is an error", async () => {
      mockFetch.mockRejectedValue(new Error("GitHub API failure"));

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for error state
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // isLoading should be false because error is present
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("SWR onError 401/auth detection", () => {
    it("logs auth warning when error contains '401'", async () => {
      mockFetch.mockRejectedValue(new Error("Request failed with status 401"));

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should log the general error AND the auth-specific warning
      expect(debug.error).toHaveBeenCalledWith(
        "GitHub API error:",
        expect.any(Error),
      );
      expect(debug.warn).toHaveBeenCalledWith(
        "Authentication error detected, consider logging out",
      );
    });

    it("logs auth warning when error contains 'auth'", async () => {
      mockFetch.mockRejectedValue(new Error("authentication failed for user"));

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(debug.warn).toHaveBeenCalledWith(
        "Authentication error detected, consider logging out",
      );
    });

    it("does not log auth warning for non-auth errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network timeout"));

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should log the general error but NOT the auth warning
      expect(debug.error).toHaveBeenCalledWith(
        "GitHub API error:",
        expect.any(Error),
      );
      expect(debug.warn).not.toHaveBeenCalledWith(
        "Authentication error detected, consider logging out",
      );
    });

    it("clears progress on error", async () => {
      // First set up progress by having fetch call the progress callback before rejecting
      mockFetch.mockImplementation((_key, onProgress) => {
        onProgress?.({
          currentOrg: undefined,
          orgsLoaded: 0,
          orgsTotal: 0,
          repos: [],
          stage: "personal" as const,
          user: null,
        });
        return Promise.reject(new Error("Request failed with status 401"));
      });

      const { result } = renderHook(() => useGitHubData(), {
        wrapper: IsolatedProvider,
      });

      act(() => {
        result.current.setPat(validToken);
      });

      // Wait for error state — progress should be cleared by onError
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.progress).toBeNull();
    });
  });
});
