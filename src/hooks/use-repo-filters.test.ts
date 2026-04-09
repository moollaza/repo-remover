import { type Repository } from "@octokit/graphql-schema";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { COLUMNS } from "@/config/repo-config";

import { useRepoFilters } from "./use-repo-filters";

type MockRepoOverrides = {
  key?: string;
  owner?: { login: string; url: string };
} & Partial<Omit<Repository, "owner">>;

// Helper to create a mock repository
function createMockRepo(
  overrides: MockRepoOverrides = {},
): { key: string } & Repository {
  return {
    description: "A test repository",
    id: "repo-1",
    isArchived: false,
    isDisabled: false,
    isFork: false,
    isInOrganization: false,
    isMirror: false,
    isPrivate: false,
    isTemplate: false,
    key: "repo-1",
    name: "test-repo",
    owner: {
      login: "testuser",
      url: "https://github.com/testuser",
    },
    updatedAt: "2024-01-01T00:00:00Z",
    url: "https://github.com/testuser/test-repo",
    viewerCanAdminister: true,
    ...overrides,
  } as { key: string } & Repository;
}

describe("useRepoFilters", () => {
  it("should initialize with default values", () => {
    const repos = [createMockRepo()];
    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    expect(result.current.nameFilter).toBe("");
    expect(result.current.sortDescriptor.column).toBe(COLUMNS.updatedAt.key);
    expect(result.current.sortDescriptor.direction).toBe("descending");
    expect(result.current.filteredRepos).toHaveLength(1);
  });

  it("should filter repos by name", () => {
    const repos = [
      createMockRepo({ id: "1", key: "1", name: "matching-repo" }),
      createMockRepo({ id: "2", key: "2", name: "another-repo" }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setNameFilter("matching");
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("matching-repo");
  });

  it("should filter repos by description", () => {
    const repos = [
      createMockRepo({
        description: "typescript project",
        id: "1",
        key: "1",
        name: "repo-1",
      }),
      createMockRepo({
        description: "python project",
        id: "2",
        key: "2",
        name: "repo-2",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setNameFilter("typescript");
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].description).toBe(
      "typescript project",
    );
  });

  it("should be case-insensitive when filtering", () => {
    const repos = [
      createMockRepo({ id: "1", key: "1", name: "UniqueRepo" }),
      createMockRepo({ id: "2", key: "2", name: "another-repo" }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setNameFilter("UNIQUE");
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("UniqueRepo");
  });

  it("should filter repos by type (isPrivate)", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isPrivate: false,
        key: "1",
        name: "public-repo",
      }),
      createMockRepo({
        id: "2",
        isPrivate: true,
        key: "2",
        name: "private-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // Initially all types are selected, so both repos should be shown
    expect(result.current.filteredRepos).toHaveLength(2);

    // Deselect private repos (keep isSource so source repos still show)
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isFork",
          "isInOrganization",
          "isMirror",
          "isSource",
          "isTemplate",
        ]),
      );
    });

    // Now only public repo should be shown
    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("public-repo");
  });

  it("should filter repos by type (isArchived)", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isArchived: false,
        key: "1",
        name: "active-repo",
      }),
      createMockRepo({
        id: "2",
        isArchived: true,
        key: "2",
        name: "archived-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // Deselect archived repos (keep isSource so source repos still show)
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isDisabled",
          "isFork",
          "isInOrganization",
          "isMirror",
          "isPrivate",
          "isSource",
          "isTemplate",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("active-repo");
  });

  it("should only show repos user can administer", () => {
    const repos = [
      createMockRepo({
        id: "1",
        key: "1",
        name: "my-repo",
        owner: { login: "testuser", url: "https://github.com/testuser" },
        viewerCanAdminister: true,
      }),
      createMockRepo({
        id: "2",
        key: "2",
        name: "other-repo",
        owner: { login: "otheruser", url: "https://github.com/otheruser" },
        viewerCanAdminister: false,
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("my-repo");
  });

  it("should show repos where user has admin rights even if not owner", () => {
    const repos = [
      createMockRepo({
        id: "1",
        key: "1",
        name: "org-repo",
        owner: { login: "orgname", url: "https://github.com/orgname" },
        viewerCanAdminister: true,
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("org-repo");
  });

  it("should sort repos by name ascending", () => {
    const repos = [
      createMockRepo({ id: "1", key: "1", name: "zebra" }),
      createMockRepo({ id: "2", key: "2", name: "apple" }),
      createMockRepo({ id: "3", key: "3", name: "banana" }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setSortDescriptor({
        column: COLUMNS.name.key,
        direction: "ascending",
      });
    });

    expect(result.current.filteredRepos[0].name).toBe("apple");
    expect(result.current.filteredRepos[1].name).toBe("banana");
    expect(result.current.filteredRepos[2].name).toBe("zebra");
  });

  it("should sort repos by name descending", () => {
    const repos = [
      createMockRepo({ id: "1", key: "1", name: "zebra" }),
      createMockRepo({ id: "2", key: "2", name: "apple" }),
      createMockRepo({ id: "3", key: "3", name: "banana" }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setSortDescriptor({
        column: COLUMNS.name.key,
        direction: "descending",
      });
    });

    expect(result.current.filteredRepos[0].name).toBe("zebra");
    expect(result.current.filteredRepos[1].name).toBe("banana");
    expect(result.current.filteredRepos[2].name).toBe("apple");
  });

  it("should sort repos by updatedAt ascending", () => {
    const repos = [
      createMockRepo({
        id: "1",
        key: "1",
        name: "repo-1",
        updatedAt: "2024-03-01T00:00:00Z",
      }),
      createMockRepo({
        id: "2",
        key: "2",
        name: "repo-2",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
      createMockRepo({
        id: "3",
        key: "3",
        name: "repo-3",
        updatedAt: "2024-02-01T00:00:00Z",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setSortDescriptor({
        column: COLUMNS.updatedAt.key,
        direction: "ascending",
      });
    });

    expect(result.current.filteredRepos[0].name).toBe("repo-2"); // Jan
    expect(result.current.filteredRepos[1].name).toBe("repo-3"); // Feb
    expect(result.current.filteredRepos[2].name).toBe("repo-1"); // Mar
  });

  it("should sort repos by updatedAt descending", () => {
    const repos = [
      createMockRepo({
        id: "1",
        key: "1",
        name: "repo-1",
        updatedAt: "2024-03-01T00:00:00Z",
      }),
      createMockRepo({
        id: "2",
        key: "2",
        name: "repo-2",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
      createMockRepo({
        id: "3",
        key: "3",
        name: "repo-3",
        updatedAt: "2024-02-01T00:00:00Z",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setSortDescriptor({
        column: COLUMNS.updatedAt.key,
        direction: "descending",
      });
    });

    expect(result.current.filteredRepos[0].name).toBe("repo-1"); // Mar (most recent)
    expect(result.current.filteredRepos[1].name).toBe("repo-3"); // Feb
    expect(result.current.filteredRepos[2].name).toBe("repo-2"); // Jan
  });

  it("should combine filters (name + type + permission)", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isPrivate: true,
        key: "1",
        name: "my-private-repo",
        owner: { login: "testuser", url: "https://github.com/testuser" },
      }),
      createMockRepo({
        id: "2",
        isPrivate: false,
        key: "2",
        name: "my-public-repo",
        owner: { login: "testuser", url: "https://github.com/testuser" },
      }),
      createMockRepo({
        id: "3",
        isPrivate: true,
        key: "3",
        name: "other-private-repo",
        owner: { login: "otheruser", url: "https://github.com/otheruser" },
        viewerCanAdminister: false,
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // Filter by name "private"
    act(() => {
      result.current.setNameFilter("private");
    });

    // Should show only my-private-repo (other-private-repo is filtered out by permission)
    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("my-private-repo");
  });

  it("should return empty array when no repos match filters", () => {
    const repos = [createMockRepo({ id: "1", key: "1", name: "test-repo" })];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    act(() => {
      result.current.setNameFilter("nonexistent");
    });

    expect(result.current.filteredRepos).toHaveLength(0);
  });

  it("should hide non-admin repos when login is null", () => {
    const repos = [
      createMockRepo({
        id: "1",
        key: "1",
        name: "admin-repo",
        owner: { login: "someuser", url: "https://github.com/someuser" },
        viewerCanAdminister: true,
      }),
      createMockRepo({
        id: "2",
        key: "2",
        name: "non-admin-repo",
        owner: { login: "someuser", url: "https://github.com/someuser" },
        viewerCanAdminister: false,
      }),
    ];

    const { result } = renderHook(() => useRepoFilters({ login: null, repos }));

    // Only the repo with viewerCanAdminister: true should be visible
    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("admin-repo");
  });

  it("should handle empty repo list", () => {
    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos: [] }),
    );

    expect(result.current.filteredRepos).toHaveLength(0);
  });

  it("should not hide source repos when fork/mirror/template filters are deselected", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isFork: false,
        isMirror: false,
        isTemplate: false,
        key: "1",
        name: "source-repo",
      }),
      createMockRepo({
        id: "2",
        isFork: true,
        key: "2",
        name: "forked-repo",
      }),
      createMockRepo({
        id: "3",
        isMirror: true,
        key: "3",
        name: "mirror-repo",
      }),
      createMockRepo({
        id: "4",
        isTemplate: true,
        key: "4",
        name: "template-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // Initially all types selected — all repos visible
    expect(result.current.filteredRepos).toHaveLength(4);

    // Deselect isFork — source repo stays, fork is hidden
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isInOrganization",
          "isMirror",
          "isPrivate",
          "isSource",
          "isTemplate",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(3);
    expect(
      result.current.filteredRepos.find((r) => r.name === "source-repo"),
    ).toBeDefined();
    expect(
      result.current.filteredRepos.find((r) => r.name === "forked-repo"),
    ).toBeUndefined();

    // Deselect isFork AND isMirror — source repo stays, fork+mirror hidden
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isInOrganization",
          "isPrivate",
          "isSource",
          "isTemplate",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(2);
    expect(
      result.current.filteredRepos.find((r) => r.name === "source-repo"),
    ).toBeDefined();
    expect(
      result.current.filteredRepos.find((r) => r.name === "template-repo"),
    ).toBeDefined();

    // Deselect isFork, isMirror, AND isTemplate — only source repo remains
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isInOrganization",
          "isPrivate",
          "isSource",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("source-repo");
  });

  it("should not hide a fork when deselecting unrelated type filters", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isFork: true,
        isTemplate: false,
        key: "1",
        name: "forked-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // Deselect isTemplate — fork should still be visible (it's not a template)
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isFork",
          "isInOrganization",
          "isMirror",
          "isPrivate",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(1);
    expect(result.current.filteredRepos[0].name).toBe("forked-repo");
  });

  it("should hide source repos when isSource filter is unchecked", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isFork: false,
        isMirror: false,
        key: "1",
        name: "source-repo",
      }),
      createMockRepo({
        id: "2",
        isFork: true,
        key: "2",
        name: "forked-repo",
      }),
      createMockRepo({
        id: "3",
        isMirror: true,
        key: "3",
        name: "mirror-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // All visible initially
    expect(result.current.filteredRepos).toHaveLength(3);

    // Uncheck isSource — source repo should be hidden, fork and mirror stay
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isFork",
          "isInOrganization",
          "isMirror",
          "isPrivate",
          "isTemplate",
        ]),
      );
    });

    expect(result.current.filteredRepos).toHaveLength(2);
    expect(
      result.current.filteredRepos.find((r) => r.name === "source-repo"),
    ).toBeUndefined();
    expect(
      result.current.filteredRepos.find((r) => r.name === "forked-repo"),
    ).toBeDefined();
    expect(
      result.current.filteredRepos.find((r) => r.name === "mirror-repo"),
    ).toBeDefined();
  });

  it("should show no repos when all type filters are unchecked", () => {
    const repos = [
      createMockRepo({
        id: "1",
        isFork: false,
        isMirror: false,
        key: "1",
        name: "source-repo",
      }),
      createMockRepo({
        id: "2",
        isFork: true,
        key: "2",
        name: "forked-repo",
      }),
      createMockRepo({
        id: "3",
        isArchived: true,
        key: "3",
        name: "archived-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // All visible initially
    expect(result.current.filteredRepos).toHaveLength(3);

    // Uncheck ALL type filters
    act(() => {
      result.current.setTypeFilters(new Set([]));
    });

    // No repos should be visible
    expect(result.current.filteredRepos).toHaveLength(0);
  });

  it('should handle HeroUI "all" selection by selecting all type filters', () => {
    const repos = [
      createMockRepo({
        id: "1",
        isPrivate: true,
        key: "1",
        name: "private-repo",
      }),
      createMockRepo({
        id: "2",
        isPrivate: false,
        key: "2",
        name: "public-repo",
      }),
    ];

    const { result } = renderHook(() =>
      useRepoFilters({ login: "testuser", repos }),
    );

    // First deselect private to narrow the list (keep isSource so source repos still show)
    act(() => {
      result.current.setTypeFilters(
        new Set([
          "isArchived",
          "isDisabled",
          "isFork",
          "isInOrganization",
          "isMirror",
          "isSource",
          "isTemplate",
        ]),
      );
    });
    expect(result.current.filteredRepos).toHaveLength(1);

    // Now pass "all" as HeroUI does when user clicks "select all" — should not crash
    act(() => {
      result.current.setTypeFilters("all");
    });

    // All repos should be visible again
    expect(result.current.filteredRepos).toHaveLength(2);
  });
});
