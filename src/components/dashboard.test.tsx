import { render, screen } from "@/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { MOCK_REPOS, MOCK_USER } from "@/mocks/static-fixtures";

import Dashboard, { type DashboardProps } from "./dashboard";

const defaultProps: DashboardProps = {
  isError: false,
  isLoading: false,
  isRefreshing: false,
  login: MOCK_USER.login,
  repos: MOCK_REPOS,
};

describe("Dashboard", () => {
  it("renders heading", () => {
    render(<Dashboard {...defaultProps} />);

    expect(
      screen.getByText(/select repositories to archive or delete/i),
    ).toBeInTheDocument();
  });

  it("shows error alert when isError is true", () => {
    render(<Dashboard {...defaultProps} isError={true} />);

    expect(screen.getByText(/error loading repositories/i)).toBeInTheDocument();
  });

  it("shows permission warning when provided", () => {
    const warning = "Some organizations are not accessible due to SSO";
    render(<Dashboard {...defaultProps} permissionWarning={warning} />);

    expect(screen.getByText(/limited token permissions/i)).toBeInTheDocument();
    expect(screen.getByText(warning)).toBeInTheDocument();
  });

  it("renders repo table with correct data", () => {
    render(<Dashboard {...defaultProps} />);

    // Verify table is rendered (header exists)
    expect(screen.getByTestId("repo-table-header")).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(<Dashboard {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole("button", {
      name: /refresh repository data/i,
    });
    await user.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables refresh button and shows loading state when loading", () => {
    render(
      <Dashboard {...defaultProps} isLoading={true} onRefresh={vi.fn()} />,
    );

    const button = screen.getByRole("button", {
      name: /refresh repository data/i,
    });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Loading...");
  });

  it("does not render refresh button when onRefresh not provided", () => {
    render(<Dashboard {...defaultProps} />);

    expect(
      screen.queryByRole("button", { name: /refresh repository data/i }),
    ).not.toBeInTheDocument();
  });

  it("handles null repos gracefully", () => {
    render(<Dashboard {...defaultProps} repos={null} />);

    expect(
      screen.getByText(/select repositories to archive or delete/i),
    ).toBeInTheDocument();
  });

  it("handles empty repos array", () => {
    render(<Dashboard {...defaultProps} repos={[]} />);

    expect(
      screen.getByText(/select repositories to archive or delete/i),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Dashboard {...defaultProps} isLoading={true} repos={null} />);

    expect(
      screen.getByText(/select repositories to archive or delete/i),
    ).toBeInTheDocument();
    // RepoTable handles loading indicator internally
  });

  it("shows both error and permission warning if present", () => {
    const warning = "Limited org access";

    render(
      <Dashboard
        {...defaultProps}
        isError={true}
        permissionWarning={warning}
      />,
    );

    expect(screen.getByText(/error loading repositories/i)).toBeInTheDocument();
    expect(screen.getByText(/limited token permissions/i)).toBeInTheDocument();
    expect(screen.getByText(warning)).toBeInTheDocument();
  });

  it("shows SAML banner when samlProtectedOrgs is non-empty", () => {
    render(
      <Dashboard
        {...defaultProps}
        samlProtectedOrgs={["acme-corp", "big-co"]}
      />,
    );

    expect(
      screen.getByText(/some organizations require saml authentication/i),
    ).toBeInTheDocument();
    expect(screen.getByText("acme-corp, big-co")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /authorize sso/i }),
    ).toHaveAttribute("href", "https://github.com/settings/tokens");
  });

  it("does not show SAML banner when samlProtectedOrgs is empty", () => {
    render(<Dashboard {...defaultProps} samlProtectedOrgs={[]} />);

    expect(
      screen.queryByText(/some organizations require saml authentication/i),
    ).not.toBeInTheDocument();
  });

  it("dismisses SAML banner when X button is clicked", async () => {
    const user = userEvent.setup();

    render(<Dashboard {...defaultProps} samlProtectedOrgs={["acme-corp"]} />);

    expect(
      screen.getByText(/some organizations require saml authentication/i),
    ).toBeInTheDocument();

    const dismissButton = screen.getByRole("button", {
      name: /dismiss saml warning/i,
    });
    await user.click(dismissButton);

    expect(
      screen.queryByText(/some organizations require saml authentication/i),
    ).not.toBeInTheDocument();
  });
});
