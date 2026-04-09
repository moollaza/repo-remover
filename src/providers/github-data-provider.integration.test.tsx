/**
 * Integration test: verifies permissionWarning flows through the FULL chain:
 * MSW → Octokit → fetchGitHubDataWithProgress → SWR → Provider → Context
 *
 * Does NOT mock fetchGitHubDataWithProgress — uses real MSW handlers.
 */
import "@testing-library/jest-dom";
import { type Repository, type User } from "@octokit/graphql-schema";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import React from "react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";

import { useGitHubData } from "@/hooks/use-github-data";
import { server } from "@/mocks/server";
import { getValidPersonalAccessToken } from "@/mocks/static-fixtures";

import { GitHubDataProvider } from "./github-data-provider";

// Only mock non-API dependencies
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

// Mock secure storage — returns null (no stored data)
vi.mock("@/utils/secure-storage", () => ({
  secureStorage: {
    getItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn(),
    setItem: vi.fn().mockResolvedValue(undefined),
  },
}));

const validToken = getValidPersonalAccessToken();

function IsolatedProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <GitHubDataProvider>{children}</GitHubDataProvider>
    </SWRConfig>
  );
}

describe("permissionWarning integration (real fetch, MSW)", () => {
  it("shows warning for classic PAT with no scopes", async () => {
    // Override: rate_limit returns empty scopes header (classic PAT, no scopes)
    server.use(
      http.get("https://api.github.com/rate_limit", () => {
        return HttpResponse.json(
          {
            rate: {
              limit: 5000,
              remaining: 4999,
              reset: Math.floor(Date.now() / 1000) + 3600,
              used: 1,
            },
            resources: {},
          },
          { headers: { "X-OAuth-Scopes": "" } },
        );
      }),
    );

    const { result } = renderHook(() => useGitHubData(), {
      wrapper: IsolatedProvider,
    });

    // Step 1: wait for initialization
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    // Step 2: authenticate
    act(() => {
      result.current.setPat(validToken);
    });

    // Step 3: verify authentication took effect
    expect(result.current.isAuthenticated).toBe(true);

    // Step 4: wait for repos to load (via progressive state or SWR data)
    await waitFor(
      () => {
        expect(result.current.repos).not.toBeNull();
      },
      { timeout: 15000 },
    );

    // Step 5: wait for loading to complete (SWR data should be set)
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isRefreshing).toBe(false);
      },
      { timeout: 15000 },
    );

    // Step 6: THE KEY ASSERTION
    expect(result.current.permissionWarning).toBeDefined();
    expect(result.current.permissionWarning).toContain("repo");
    expect(result.current.permissionWarning).toContain("delete_repo");
    expect(result.current.permissionWarning).toContain("read:org");
  }, 30000);

  it("no warning when all scopes are present", async () => {
    // Default MSW handlers return all scopes

    const { result } = renderHook(() => useGitHubData(), {
      wrapper: IsolatedProvider,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    act(() => {
      result.current.setPat(validToken);
    });

    await waitFor(
      () => {
        expect(result.current.repos).not.toBeNull();
      },
      { timeout: 15000 },
    );

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 15000 },
    );

    expect(result.current.permissionWarning).toBeUndefined();
  }, 30000);
});
