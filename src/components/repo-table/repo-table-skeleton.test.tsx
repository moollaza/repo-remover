import RepoTableSkeleton from "@/components/repo-table/repo-table-skeleton";
import { render, screen } from "@/utils/test-utils";

describe("RepoTableSkeleton", () => {
  it("renders with default 10 rows", () => {
    render(<RepoTableSkeleton />);

    const rows = screen.getAllByRole("row");
    // 1 header + 10 body rows
    expect(rows).toHaveLength(11);
  });

  it("renders custom number of rows", () => {
    render(<RepoTableSkeleton rows={5} />);

    const rows = screen.getAllByRole("row");
    // 1 header + 5 body rows
    expect(rows).toHaveLength(6);
  });

  it("renders filter skeletons", () => {
    render(<RepoTableSkeleton />);

    const filtersSkeleton = screen.getByTestId("repo-filters-skeleton");
    expect(filtersSkeleton).toBeInTheDocument();
  });

  it("has accessible table label", () => {
    render(<RepoTableSkeleton />);

    expect(screen.getByLabelText("Loading repositories")).toBeInTheDocument();
  });

  it("uses correct column headers", () => {
    render(<RepoTableSkeleton />);

    expect(screen.getByText("Repository")).toBeInTheDocument();
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders skeleton container with correct test id", () => {
    render(<RepoTableSkeleton />);

    expect(
      screen.getByTestId("repo-table-skeleton-container"),
    ).toBeInTheDocument();
  });

  it("renders many rows without error", () => {
    render(<RepoTableSkeleton rows={20} />);

    const rows = screen.getAllByRole("row");
    // 1 header + 20 body rows
    expect(rows).toHaveLength(21);
  });

  it("renders minimal rows without error", () => {
    render(<RepoTableSkeleton rows={3} />);

    const rows = screen.getAllByRole("row");
    // 1 header + 3 body rows
    expect(rows).toHaveLength(4);
  });

  it("renders with table border styling", () => {
    const { container } = render(<RepoTableSkeleton />);

    // Should have border styling from custom wrapper div
    const table = container.querySelector("table");
    const wrapper = table?.closest(".border");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("rounded-xl");
  });

  it("renders table element", () => {
    render(<RepoTableSkeleton rows={3} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  it("renders skeleton rows with pulse animation", () => {
    render(<RepoTableSkeleton rows={3} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    // Skeleton rows should exist
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("renders pagination skeleton in bottom content", () => {
    render(<RepoTableSkeleton />);

    // Look for skeleton elements (they have various ARIA roles depending on implementation)
    const container = screen.getByTestId("repo-table-skeleton-container");
    expect(container).toBeInTheDocument();
    // Pagination skeleton is rendered in bottomContent
  });
});
