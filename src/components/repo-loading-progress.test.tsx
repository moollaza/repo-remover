import RepoLoadingProgress from "@/components/repo-loading-progress";
import { render, screen } from "@/utils/test-utils";

describe("RepoLoadingProgress", () => {
  it("renders personal repos stage", () => {
    render(
      <RepoLoadingProgress orgsLoaded={0} orgsTotal={5} stage="personal" />,
    );

    expect(screen.getByText(/Loading repos/i)).toBeInTheDocument();
    expect(screen.getByText("1/6")).toBeInTheDocument();
  });

  it("renders org repos stage", () => {
    render(
      <RepoLoadingProgress
        currentOrg="acme-corp"
        orgsLoaded={2}
        orgsTotal={5}
        stage="orgs"
      />,
    );

    expect(screen.getByText(/Loading orgs \(2\/5\)/i)).toBeInTheDocument();
    expect(screen.getByText("3/6")).toBeInTheDocument();
  });

  it("calculates progress percentage correctly", () => {
    render(<RepoLoadingProgress orgsLoaded={3} orgsTotal={5} stage="orgs" />);

    // 1 personal + 3 orgs complete out of 1 + 5 = 4/6 = 67%
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "67");
  });

  it("auto-dismisses when complete", () => {
    const { container } = render(
      <RepoLoadingProgress orgsLoaded={5} orgsTotal={5} stage="complete" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows spinning icon", () => {
    const { container } = render(
      <RepoLoadingProgress orgsLoaded={0} orgsTotal={5} stage="personal" />,
    );

    const icon = container.querySelector(".animate-spin");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-primary");
  });

  it("handles single org user", () => {
    render(
      <RepoLoadingProgress
        currentOrg="startup-inc"
        orgsLoaded={0}
        orgsTotal={1}
        stage="orgs"
      />,
    );

    expect(screen.getByText(/Loading orgs \(0\/1\)/i)).toBeInTheDocument();
  });

  it("shows correct step count for orgs stage", () => {
    render(
      <RepoLoadingProgress
        currentOrg="test-org"
        orgsLoaded={1}
        orgsTotal={3}
        stage="orgs"
      />,
    );

    // 1 personal + 1 org complete out of 1 + 3 = 2/4
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });
});
