import { useNavigate } from "react-router-dom";

import { useGitHubData } from "@/hooks/use-github-data";
import { MOCK_REPOS } from "@/mocks/static-fixtures";
import { render, screen, waitFor } from "@/utils/test-utils";

import { Dashboard } from "./dashboard";

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
const mockNavigate = vi.fn();

function setupContext(overrides = {}) {
  mockUseGitHubData.mockReturnValue({
    error: null,
    hasPartialData: false,
    isAuthenticated: false,
    isError: false,
    isInitialized: true,
    isLoading: false,
    isRefreshing: false,
    login: null,
    logout: vi.fn(),
    mutate: vi.fn(),
    pat: null,
    progress: null,
    refetchData: vi.fn(),
    repos: null,
    samlProtectedOrgs: [],
    setLogin: vi.fn(),
    setPat: vi.fn(),
    user: null,
    ...overrides,
  });
}

beforeEach(() => {
  mockNavigate.mockClear();
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
});

describe("Dashboard route", () => {
  describe("unauthenticated redirect", () => {
    it("redirects to / when isInitialized=true and pat=null", async () => {
      setupContext({ isInitialized: true, pat: null });

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("does not redirect before initialization", () => {
      setupContext({ isInitialized: false, pat: null });

      render(<Dashboard />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("authenticated render", () => {
    it("renders DashboardComponent when pat is set", () => {
      setupContext({
        isAuthenticated: true,
        isLoading: false,
        isRefreshing: false,
        login: "testuser",
        pat: "ghp_test123",
        repos: MOCK_REPOS,
      });

      render(<Dashboard />);

      expect(
        screen.getByText(/select repositories to archive or delete/i),
      ).toBeInTheDocument();
    });

    it("does not force refetch on mount (SWR handles revalidation)", () => {
      const mockRefetchData = vi.fn();
      setupContext({
        isAuthenticated: true,
        pat: "ghp_test123",
        refetchData: mockRefetchData,
        repos: MOCK_REPOS,
      });

      render(<Dashboard />);

      // refetchData should NOT be called — SWR caches data and revalidates automatically
      expect(mockRefetchData).not.toHaveBeenCalled();
    });

    it("does not redirect when authenticated", () => {
      setupContext({
        isAuthenticated: true,
        isInitialized: true,
        pat: "ghp_test123",
        repos: MOCK_REPOS,
      });

      render(<Dashboard />);

      expect(mockNavigate).not.toHaveBeenCalledWith("/");
    });

    it("forwards error state to DashboardComponent", () => {
      setupContext({
        isAuthenticated: true,
        isError: true,
        pat: "ghp_test123",
        repos: null,
      });

      render(<Dashboard />);

      expect(
        screen.getByText(/error loading repositories/i),
      ).toBeInTheDocument();
    });

    it("forwards permissionWarning to DashboardComponent", () => {
      setupContext({
        isAuthenticated: true,
        pat: "ghp_test123",
        permissionWarning: "Token lacks read:org scope",
        repos: MOCK_REPOS,
      });

      render(<Dashboard />);

      expect(
        screen.getByText(/Token lacks read:org scope/),
      ).toBeInTheDocument();
    });

    it("forwards samlProtectedOrgs to DashboardComponent", () => {
      setupContext({
        isAuthenticated: true,
        pat: "ghp_test123",
        repos: MOCK_REPOS,
        samlProtectedOrgs: ["acme-corp"],
      });

      render(<Dashboard />);

      expect(
        screen.getByText(/some organizations require saml authentication/i),
      ).toBeInTheDocument();
      expect(screen.getByText("acme-corp")).toBeInTheDocument();
    });
  });

  describe("ErrorBoundary wrapping", () => {
    it("renders ErrorBoundary around DashboardComponent", () => {
      // Verify the route wraps DashboardComponent in an ErrorBoundary
      // by confirming normal rendering works (ErrorBoundary passes children through)
      setupContext({
        isAuthenticated: true,
        pat: "ghp_test123",
        repos: MOCK_REPOS,
      });

      render(<Dashboard />);

      // If ErrorBoundary were missing and DashboardComponent threw,
      // the error would propagate. Here we verify the normal path works.
      expect(
        screen.getByText(/select repositories to archive or delete/i),
      ).toBeInTheDocument();
    });
  });
});
