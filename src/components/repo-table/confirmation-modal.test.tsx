import { type Repository } from "@octokit/graphql-schema";
import { fireEvent, render, screen } from "@/utils/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GitHubContext, GitHubContextType } from "@/contexts/github-context";
import { createMockRepo } from "@/mocks/static-fixtures";

import ConfirmationModal from "./confirmation-modal";

const mockRepos: Repository[] = [
  createMockRepo({ id: "1", name: "repo1" }),
  createMockRepo({ id: "2", name: "repo2" }),
];

const mockProps = {
  action: "archive" as const,
  isOpen: true,
  login: "testuser",
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  repos: mockRepos,
};

const mockContextValue: GitHubContextType = {
  error: null,
  hasPartialData: false,
  isAuthenticated: true,
  isError: false,
  isInitialized: true,
  isLoading: false,
  login: "testuser",
  logout: vi.fn(),
  mutate: vi.fn(),
  pat: "fake-token",
  progress: null,
  refetchData: vi.fn(),
  repos: mockRepos,
  setLogin: vi.fn(),
  setPat: vi.fn(),
  user: null,
};

describe("ConfirmationModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders confirmation screen initially", () => {
    render(
      <GitHubContext.Provider value={mockContextValue}>
        <ConfirmationModal {...mockProps} />
      </GitHubContext.Provider>,
    );

    expect(screen.getByText(/Confirm Archival/)).toBeInTheDocument();
    expect(screen.getByText(/repo1/)).toBeInTheDocument();
    expect(screen.getByText(/repo2/)).toBeInTheDocument();
    expect(screen.getByTestId("confirmation-modal-input")).toBeInTheDocument();
  });

  it("enables confirm button when username matches login", () => {
    render(
      <GitHubContext.Provider value={mockContextValue}>
        <ConfirmationModal {...mockProps} />
      </GitHubContext.Provider>,
    );

    const usernameInput = screen.getByTestId("confirmation-modal-input");
    const confirmButton = screen.getByTestId("confirmation-modal-confirm");

    // Initially disabled
    expect(confirmButton).toBeDisabled();

    // Enter incorrect username
    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    expect(confirmButton).toBeDisabled();

    // Enter correct username
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    expect(confirmButton).not.toBeDisabled();
  });
});
