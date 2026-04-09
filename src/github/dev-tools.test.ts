import { type Octokit } from "@octokit/rest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateRepos } from "./dev-tools";

describe("generateRepos", () => {
  const mockCreateForAuthenticatedUser = vi
    .fn()
    .mockResolvedValue({ data: {} });
  let mockOctokit: Partial<Octokit>;
  let mockSetLoading: (loading: boolean) => void;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          createForAuthenticatedUser: mockCreateForAuthenticatedUser,
        },
      },
    } as unknown as Octokit;

    mockSetLoading = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("should generate the specified number of repositories", async () => {
    const promise = generateRepos(mockOctokit as Octokit, mockSetLoading, 3);

    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(500);
    }

    await promise;

    expect(mockCreateForAuthenticatedUser).toHaveBeenCalledTimes(3);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });

  it("should handle errors when creating repositories", async () => {
    const error = new Error("API rate limit exceeded");
    mockCreateForAuthenticatedUser.mockRejectedValueOnce(error);

    await expect(
      generateRepos(mockOctokit as Octokit, mockSetLoading, 1),
    ).rejects.toThrow("Failed to create repositories: API rate limit exceeded");

    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });
});
