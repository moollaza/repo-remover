import { type Repository } from "@octokit/graphql-schema";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import {
  GitHubContext,
  type GitHubContextType,
} from "@/contexts/github-context";
import { createMockRepo } from "@/mocks/static-fixtures";

import RepoTable from "./repo-table";

const mockRepos: Repository[] = [
  createMockRepo({
    id: "repo-a",
    isArchived: false,
    name: "repo-alpha",
    viewerCanAdminister: true,
  }),
  createMockRepo({
    id: "repo-b",
    isArchived: false,
    name: "repo-beta",
    viewerCanAdminister: true,
  }),
  createMockRepo({
    id: "repo-c",
    isArchived: false,
    name: "repo-gamma",
    owner: { id: "org-1", login: "someorg", url: "https://github.com/someorg" },
    viewerCanAdminister: false,
  }),
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
  repos: mockRepos,
  setLogin: vi.fn(),
  setPat: vi.fn(),
  user: null,
};

function renderRepoTable() {
  return render(
    <BrowserRouter>
      <GitHubContext.Provider value={mockContext}>
        <RepoTable login="testuser" repos={mockRepos} />
      </GitHubContext.Provider>
    </BrowserRouter>,
  );
}

describe("RepoTable + ConfirmationModal Integration", () => {
  it("non-admin repos are not visible in the table", () => {
    renderRepoTable();

    expect(screen.getByText("repo-alpha")).toBeInTheDocument();
    expect(screen.getByText("repo-beta")).toBeInTheDocument();
    // repo-gamma has viewerCanAdminister: false and owner !== login, so filtered out
    expect(screen.queryByText("repo-gamma")).not.toBeInTheDocument();
  });

  it("selecting a repo and clicking archive opens modal with correct repo", async () => {
    const user = userEvent.setup();
    renderRepoTable();

    // HeroUI Table renders row checkboxes — click the row to select it
    const repoAlphaRow = screen
      .getByText("repo-alpha")
      .closest('[data-testid="repo-row"]');
    expect(repoAlphaRow).toBeInTheDocument();

    // Find the checkbox within the row
    const checkbox = within(repoAlphaRow as HTMLElement).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    await user.click(checkbox);

    // Click the archive button
    const archiveBtn = screen.getByTestId("repo-action-button-archive");
    await user.click(archiveBtn);

    // Modal should open showing repo-alpha in the confirmation list
    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-header"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Confirm Archival/i)).toBeInTheDocument();

    // The modal body should list repo-alpha
    const modalBody = screen.getByTestId("confirmation-modal-body");
    expect(modalBody).toHaveTextContent("repo-alpha");

    // repo-gamma should NOT appear in the modal (non-admin, filtered out)
    expect(modalBody).not.toHaveTextContent("repo-gamma");
  });

  it("confirm button is disabled until correct username is entered", async () => {
    const user = userEvent.setup();
    renderRepoTable();

    // Select repo-alpha via its row checkbox
    const repoAlphaRow = screen
      .getByText("repo-alpha")
      .closest('[data-testid="repo-row"]');
    const checkbox = within(repoAlphaRow as HTMLElement).getByRole("checkbox");
    await user.click(checkbox);

    // Open the modal
    await user.click(screen.getByTestId("repo-action-button-archive"));

    await waitFor(() => {
      expect(
        screen.getByTestId("confirmation-modal-confirm"),
      ).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId("confirmation-modal-confirm");
    const input = screen.getByTestId("confirmation-modal-input");

    // Initially disabled
    expect(confirmBtn).toBeDisabled();

    // Wrong username
    await user.type(input, "wronguser");
    expect(confirmBtn).toBeDisabled();

    // Clear and type correct username
    await user.clear(input);
    await user.type(input, "testuser");
    expect(confirmBtn).toBeEnabled();
  });
});
