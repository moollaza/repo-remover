import { renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { GitHubDataProvider } from "@/providers/github-data-provider";

import { useGitHubData } from "./use-github-data";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <GitHubDataProvider>{children}</GitHubDataProvider>
    </BrowserRouter>
  );
}

describe("useGitHubData", () => {
  it("throws when used outside GitHubDataProvider", () => {
    expect(() => {
      renderHook(() => useGitHubData());
    }).toThrow("useGitHubData must be used within GitHubDataProvider");
  });

  it("returns context value when used within GitHubDataProvider", () => {
    const { result } = renderHook(() => useGitHubData(), {
      wrapper: AllProviders,
    });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.repos).toBeNull();
    expect(result.current.pat).toBeNull();
  });

  it("exposes all GitHubContextType fields with correct initial values", () => {
    const { result } = renderHook(() => useGitHubData(), {
      wrapper: AllProviders,
    });

    const ctx = result.current;

    // Authentication state
    expect(ctx.isAuthenticated).toBe(false);
    expect(ctx.isInitialized).toBe(false);
    expect(ctx.pat).toBeNull();
    expect(ctx.login).toBeNull();

    // Data state
    expect(ctx.repos).toBeNull();
    expect(ctx.user).toBeNull();
    expect(ctx.error).toBeNull();
    expect(ctx.isLoading).toBe(false);
    expect(ctx.isError).toBe(false);
    expect(ctx.hasPartialData).toBe(false);
    expect(ctx.progress).toBeNull();
    expect(ctx.permissionWarning).toBeUndefined();

    // Actions are functions
    expect(typeof ctx.logout).toBe("function");
    expect(typeof ctx.mutate).toBe("function");
    expect(typeof ctx.refetchData).toBe("function");
    expect(typeof ctx.setLogin).toBe("function");
    expect(typeof ctx.setPat).toBe("function");
  });
});
