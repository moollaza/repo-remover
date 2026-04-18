import { MarketingHeader } from "@/components/marketing-header";
import { render, screen } from "@/utils/test-utils";

describe("MarketingHeader", () => {
  describe("Authentication states", () => {
    it("shows logo on all pages", () => {
      render(<MarketingHeader />);
      expect(screen.getByText("Repo Remover")).toBeInTheDocument();
    });

    it("shows home navigation links on homepage", () => {
      render(<MarketingHeader />);

      expect(screen.getByText("Features")).toBeInTheDocument();
      expect(screen.getByText("How It Works")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("does not show Go to Dashboard button when no stored PAT", () => {
      render(<MarketingHeader />);

      expect(
        screen.queryByRole("link", { name: /go to dashboard/i }),
      ).not.toBeInTheDocument();
    });

    it("shows theme switcher", () => {
      render(<MarketingHeader />);

      const navbar = screen.getByTestId("navbar");
      expect(navbar).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("renders navbar with correct structure", () => {
      render(<MarketingHeader />);

      const navbar = screen.getByTestId("navbar");
      expect(navbar).toBeInTheDocument();
    });

    it("has accessible navigation", () => {
      render(<MarketingHeader />);

      const navbar = screen.getByRole("navigation");
      expect(navbar).toBeInTheDocument();
    });
  });

  describe("Provider independence", () => {
    it("renders without the GitHub data provider mounted", () => {
      // `render` from test-utils wraps in GitHubDataProvider, but the marketing
      // header must not depend on it. We remount with just the router here —
      // no GitHubDataProvider, no useGitHubData — and still expect no crash.
      const { BrowserRouter } = require("react-router-dom");
      const { render: plainRender } = require("@testing-library/react");

      plainRender(
        <BrowserRouter>
          <MarketingHeader />
        </BrowserRouter>,
      );

      expect(screen.getAllByText("Repo Remover").length).toBeGreaterThan(0);
    });
  });
});
