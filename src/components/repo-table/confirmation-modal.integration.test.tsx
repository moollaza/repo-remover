import { type Repository } from "@octokit/graphql-schema";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GitHubContext,
  type GitHubContextType,
} from "@/contexts/github-context";
import { server } from "@/mocks/server";
import { createMockRepo } from "@/mocks/static-fixtures";

import ConfirmationModal from "./confirmation-modal";

// Track which repos were archived/deleted via MSW runtime overrides
let archivedRepos: string[] = [];
let deletedRepos: string[] = [];

const testRepos: Repository[] = [
  createMockRepo({ id: "r1", name: "repo-one" }),
  createMockRepo({ id: "r2", name: "repo-two" }),
];

const mockContext: GitHubContextType = {
  error: null,
  hasPartialData: false,
  isAuthenticated: true,
  isError: false,
  isInitialized: true,
  isLoading: false,
  login: "testuser",
  logout: vi.fn(),
  mutate: vi.fn(),
  pat: "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
  progress: null,
  refetchData: vi.fn(),
  repos: testRepos,
  setLogin: vi.fn(),
  setPat: vi.fn(),
  user: null,
};

const baseProps = {
  isOpen: true,
  login: "testuser",
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  repos: testRepos,
};

function renderModal(action: "archive" | "delete") {
  return render(
    <BrowserRouter>
      <GitHubContext.Provider value={mockContext}>
        <ConfirmationModal {...baseProps} action={action} />
      </GitHubContext.Provider>
    </BrowserRouter>,
  );
}

describe("ConfirmationModal Integration — Full Execution Flow", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    archivedRepos = [];
    deletedRepos = [];

    // Override global handlers with tracking versions
    server.use(
      http.patch("https://api.github.com/repos/:owner/:repo", ({ params }) => {
        archivedRepos.push(params.repo as string);
        return HttpResponse.json({ archived: true });
      }),
      http.delete("https://api.github.com/repos/:owner/:repo", ({ params }) => {
        deletedRepos.push(params.repo as string);
        return new HttpResponse(null, { status: 204 });
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("archive flow: confirmation → progress → result, calls API via MSW", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal("archive");

    // Confirmation mode
    expect(screen.getByText(/Confirm Archival/i)).toBeInTheDocument();
    expect(screen.getByText("repo-one")).toBeInTheDocument();
    expect(screen.getByText("repo-two")).toBeInTheDocument();

    // Type username and confirm
    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    expect(screen.getByTestId("confirmation-modal-confirm")).toBeEnabled();
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    // Should transition to progress mode
    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-progress"),
      ).toBeInTheDocument();
    });

    // Advance timers past all delays (1s per repo * 2 repos + 3s minimum = ~5s, use 10s to be safe)
    await vi.advanceTimersByTimeAsync(10_000);

    // Should transition to result mode
    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // Verify MSW intercepted exactly the expected REST calls — no extras
    expect(archivedRepos).toEqual(["repo-one", "repo-two"]);
    expect(deletedRepos).toHaveLength(0);

    // Result should show success
    expect(
      screen.getByText(/2 out of 2 repos archived successfully/i),
    ).toBeInTheDocument();
  });

  it("delete flow: confirmation → progress → result", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal("delete");

    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();

    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // Verify exactly the expected repos were deleted — no extras
    expect(deletedRepos).toEqual(["repo-one", "repo-two"]);
    expect(archivedRepos).toHaveLength(0);
  });

  it("handles partial failures — shows errors for failed repos", async () => {
    // Override: repo-one fails with 403, repo-two uses the default success handler
    server.use(
      http.patch("https://api.github.com/repos/:owner/repo-one", () => {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal("archive");

    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // 1 success, 1 failure
    expect(
      screen.getByText(/1 out of 2 repos archived successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 error occurred/i)).toBeInTheDocument();
  });

  it("stops batch early on 401 — does not attempt remaining repos", async () => {
    // 5 repos to make the early-stop obvious
    const manyRepos: Repository[] = Array.from({ length: 5 }, (_, i) =>
      createMockRepo({ id: `r${i + 1}`, name: `repo-${i + 1}` }),
    );

    let callCount = 0;
    server.use(
      http.patch("https://api.github.com/repos/:owner/:repo", () => {
        callCount++;
        // First repo succeeds, second returns 401 (expired token)
        if (callCount === 1) {
          return HttpResponse.json({ archived: true });
        }
        return HttpResponse.json(
          { message: "Bad credentials" },
          { status: 401 },
        );
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <BrowserRouter>
        <GitHubContext.Provider value={{ ...mockContext, repos: manyRepos }}>
          <ConfirmationModal
            {...baseProps}
            action="archive"
            repos={manyRepos}
          />
        </GitHubContext.Provider>
      </BrowserRouter>,
    );

    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    await vi.advanceTimersByTimeAsync(15_000);

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // Only 2 API calls made (1 success + 1 failure), not 5
    expect(callCount).toBe(2);
    // Result shows the 401 error
    expect(screen.getByText(/1 error/i)).toBeInTheDocument();
  });

  it("stop button halts batch — remaining repos are not processed", async () => {
    // 5 repos so we have time to click Stop mid-batch
    const manyRepos: Repository[] = Array.from({ length: 5 }, (_, i) =>
      createMockRepo({ id: `r${i + 1}`, name: `repo-${i + 1}` }),
    );

    const tracked: string[] = [];
    server.use(
      http.patch("https://api.github.com/repos/:owner/:repo", ({ params }) => {
        tracked.push(params.repo as string);
        return HttpResponse.json({ archived: true });
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <BrowserRouter>
        <GitHubContext.Provider value={{ ...mockContext, repos: manyRepos }}>
          <ConfirmationModal
            {...baseProps}
            action="archive"
            repos={manyRepos}
          />
        </GitHubContext.Provider>
      </BrowserRouter>,
    );

    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    // Wait for progress mode
    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-progress"),
      ).toBeInTheDocument();
    });

    // Advance past ~2 repos (each = API call + 1s delay)
    await vi.advanceTimersByTimeAsync(2_500);

    // Click the Stop button
    await user.click(screen.getByText("Stop"));

    // Advance remaining time so the loop finishes
    await vi.advanceTimersByTimeAsync(15_000);

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // Not all 5 repos were processed
    expect(tracked.length).toBeLessThan(5);
    expect(tracked.length).toBeGreaterThanOrEqual(1);
  });

  it("shows correct result when all repos fail", async () => {
    // Override: all repos fail with 403
    server.use(
      http.patch("https://api.github.com/repos/:owner/:repo", () => {
        return HttpResponse.json(
          { message: "Must have admin rights" },
          { status: 403 },
        );
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal("archive");

    const input = screen.getByTestId("confirmation-modal-input");
    await user.type(input, "testuser");
    await user.click(screen.getByTestId("confirmation-modal-confirm"));

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-result"),
      ).toBeInTheDocument();
    });

    // 0 successes, all failures
    expect(
      screen.getByText(/0 out of 2 repos archived successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 errors? occurred/i)).toBeInTheDocument();
  });
});
