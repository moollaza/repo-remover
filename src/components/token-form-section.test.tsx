import { userEvent } from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";

import TokenFormSection from "@/components/token-form-section";
import { useGitHubData } from "@/hooks/use-github-data";
import { render, screen, waitFor } from "@/utils/test-utils";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock useGitHubData hook
vi.mock("@/hooks/use-github-data", async () => {
  const actual = await vi.importActual("@/hooks/use-github-data");
  return {
    ...actual,
    useGitHubData: vi.fn(),
  };
});

const mockUseGitHubData = vi.mocked(useGitHubData);
const mockUseNavigate = vi.mocked(useNavigate);

function setupDefaultContext() {
  const mockSetPat = vi.fn();
  const mockNavigate = vi.fn();

  mockUseNavigate.mockReturnValue(mockNavigate);
  mockUseGitHubData.mockReturnValue({
    error: null,
    hasPartialData: false,
    isAuthenticated: false,
    isError: false,
    isInitialized: true,
    isLoading: false,
    login: null,
    logout: vi.fn(),
    mutate: vi.fn(),
    pat: null,
    progress: null,
    refetchData: vi.fn(),
    repos: null,
    setLogin: vi.fn(),
    setPat: mockSetPat,
    user: null,
  } as ReturnType<typeof useGitHubData>);

  return { mockNavigate, mockSetPat };
}

// Valid token recognized by MSW handlers
const VALID_TOKEN = "ghp_abcdefghijklmnopqrstuvwxyz1234567890";

describe("TokenFormSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the GitHubTokenForm", () => {
    setupDefaultContext();
    render(<TokenFormSection />);

    expect(screen.getByLabelText(/Personal Access Token/i)).toBeInTheDocument();
  });

  it("calls setPat and navigates to /dashboard on form submission", async () => {
    const { mockNavigate, mockSetPat } = setupDefaultContext();
    const user = userEvent.setup();

    render(<TokenFormSection />);

    const input = screen.getByLabelText(/Personal Access Token/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(input, VALID_TOKEN);

    // Wait for debounced validation to complete and button to become enabled
    await waitFor(() => expect(submitButton).not.toBeDisabled(), {
      timeout: 5000,
    });

    await user.click(submitButton);

    expect(mockSetPat).toHaveBeenCalledWith(VALID_TOKEN, true);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  }, 10000);

  it("keeps value state in sync via onValueChange", async () => {
    setupDefaultContext();
    const user = userEvent.setup();

    render(<TokenFormSection />);

    const input = screen.getByLabelText(/Personal Access Token/i);
    await user.type(input, "ghp_test");

    expect(input).toHaveValue("ghp_test");
  });

  it("pre-populates with dev token when VITE_GITHUB_DEV_TOKEN is set", () => {
    setupDefaultContext();

    const originalToken = import.meta.env.VITE_GITHUB_DEV_TOKEN;
    import.meta.env.VITE_GITHUB_DEV_TOKEN = "ghp_devtoken123";

    render(<TokenFormSection />);

    const input = screen.getByLabelText(/Personal Access Token/i);
    expect(input).toHaveValue("ghp_devtoken123");

    // Restore
    if (originalToken === undefined) {
      delete import.meta.env.VITE_GITHUB_DEV_TOKEN;
    } else {
      import.meta.env.VITE_GITHUB_DEV_TOKEN = originalToken;
    }
  });

  it("starts with empty input when no dev token is set", () => {
    setupDefaultContext();

    const originalToken = import.meta.env.VITE_GITHUB_DEV_TOKEN;
    delete import.meta.env.VITE_GITHUB_DEV_TOKEN;

    render(<TokenFormSection />);

    const input = screen.getByLabelText(/Personal Access Token/i);
    expect(input).toHaveValue("");

    // Restore
    if (originalToken !== undefined) {
      import.meta.env.VITE_GITHUB_DEV_TOKEN = originalToken;
    }
  });
});
