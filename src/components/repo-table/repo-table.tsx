import { type Repository } from "@octokit/graphql-schema";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPO_ACTIONS } from "@/config/repo-config";
import {
  type Selection,
  type SelectionSet,
  type SortDescriptor,
  useRepoFilters,
} from "@/hooks/use-repo-filters";
import { useRepoPagination } from "@/hooks/use-repo-pagination";
import { useRepoSelection } from "@/hooks/use-repo-selection";
import { debug } from "@/utils/debug";

import ConfirmationModal from "./confirmation-modal";
import RepoFilters from "./repo-filters";

interface RepositoryWithKey extends Repository {
  key: string;
}

/** Shared badge rendering for mobile and desktop repo rows */
function RepoBadges({
  repo,
  login,
  showOwner = false,
}: {
  login: null | string;
  repo: Repository;
  showOwner?: boolean;
}) {
  return (
    <>
      {showOwner && repo.owner.login !== login && (
        <Badge size="xs" variant="muted">
          {repo.owner.login}
        </Badge>
      )}
      {repo.isPrivate && (
        <Badge size="xs" variant="muted">
          Private
        </Badge>
      )}
      {!repo.isPrivate && !showOwner && (
        <Badge size="xs" variant="success">
          Public
        </Badge>
      )}
      {repo.isInOrganization && (
        <Badge size="xs" variant="muted">
          Org
        </Badge>
      )}
      {repo.isFork && (
        <Badge size="xs" variant="muted">
          Fork
        </Badge>
      )}
      {repo.isArchived && (
        <Badge size="xs" variant="warning">
          Archived
        </Badge>
      )}
    </>
  );
}

interface RepoTableProps {
  login: null | string;
  repos: null | Repository[];
}

export default function RepoTable({
  login,
  repos,
}: RepoTableProps): JSX.Element {
  const [selectedRepoAction, setSelectedRepoAction] = useState<SelectionSet>(
    new Set([REPO_ACTIONS[0].key]),
  );

  // For the confirmation modal
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  // For debugging purposes — DEV only to avoid leaking repo metadata in production
  useEffect(() => {
    if (import.meta.env.DEV && repos?.length) {
      (window as unknown as { repos: typeof repos } & Window).repos = repos;
      debug.group("Repos", true);
      debug.table(repos);
      debug.groupEnd();
    }
  }, [repos]);

  // Add keys to the repos for React to track them
  const reposWithKeys: RepositoryWithKey[] = useMemo(() => {
    if (!repos) return [];

    return repos.map((repo) => ({
      ...repo,
      key: repo.id,
    }));
  }, [repos]);

  // Use custom hooks for filtering and pagination
  const {
    filteredRepos,
    nameFilter,
    setNameFilter,
    setSortDescriptor,
    setTypeFilters,
    sortDescriptor,
    typeFilters,
  } = useRepoFilters({ login, repos: reposWithKeys });

  const {
    currentPage,
    paginatedItems: paginatedRepos,
    perPage,
    resetPage,
    setCurrentPage,
    setPerPage,
    totalPages,
  } = useRepoPagination({ items: filteredRepos });

  const handleRepoTypesFilterChange = useCallback(
    (keys: Selection) => {
      setTypeFilters(keys);
      resetPage(); // Reset to page 1 when filters change
    },
    [setTypeFilters, resetPage],
  );

  const handlePerPageChange = useCallback(
    (keys: Selection) => {
      setPerPage(keys);
    },
    [setPerPage],
  );

  const handleRepoActionClick = () => {
    if (selectedRepoAction.has("delete")) {
      debug.log(
        "Deleting selected repos:",
        Array.from(selectedRepoKeys as Set<string>),
      );
    } else if (selectedRepoAction.has("archive")) {
      debug.log(
        "Archiving selected repos:",
        Array.from(selectedRepoKeys as Set<string>),
      );
    }

    // Open the confirmation modal
    onOpen();
  };

  const handleRepoActionChange = useCallback(
    (keys: Selection) => {
      setSelectedRepoAction(keys as SelectionSet);
    },
    [setSelectedRepoAction],
  );

  // Helper function to determine if a repo should be disabled for selection
  const isRepoDisabled = useCallback(
    (repo: Repository): boolean => {
      // Locked repos cannot be archived or deleted — they will 403/422
      if (repo.isLocked) return true;
      // If archive action is selected and repo is already archived, disable it
      return selectedRepoAction.has("archive") && repo.isArchived;
    },
    [selectedRepoAction],
  );

  // Get disabled repo keys for the table
  const disabledKeys = useMemo(() => {
    return new Set(
      paginatedRepos.filter(isRepoDisabled).map((repo) => repo.id),
    );
  }, [paginatedRepos, isRepoDisabled]);

  // Use custom hook for selection state
  const {
    allSelectableSelected,
    handleRowSelect,
    handleSelectAll,
    selectableRepos,
    selectedRepoKeys,
    selectedRepos,
  } = useRepoSelection({
    disabledKeys,
    filteredRepos,
    isRepoDisabled,
    paginatedRepos,
  });

  // --- Sort handler ---
  const handleSortChange = useCallback(
    (columnKey: string) => {
      setSortDescriptor((prev: SortDescriptor) => {
        if (prev.column === columnKey) {
          // Toggle direction
          return {
            column: columnKey,
            direction:
              prev.direction === "ascending" ? "descending" : "ascending",
          };
        }
        // New column: default to ascending
        return { column: columnKey, direction: "ascending" };
      });
    },
    [setSortDescriptor],
  );

  // --- Pagination ---
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="space-y-4" data-testid="repo-table-container">
      <RepoFilters
        onPerPageChange={handlePerPageChange}
        onRepoActionChange={handleRepoActionChange}
        onRepoActionClick={handleRepoActionClick}
        onRepoTypesFilterChange={handleRepoTypesFilterChange}
        onSearchChange={setNameFilter}
        perPage={perPage}
        repoTypesFilter={typeFilters}
        searchQuery={nameFilter}
        selectedRepoAction={selectedRepoAction}
        selectedRepoKeys={selectedRepoKeys}
      />

      {/* TABLE */}
      <div className="border border-divider rounded-xl bg-content1 overflow-hidden">
        <Table
          aria-label="GitHub repositories table"
          className="table-fixed"
          data-testid="repo-table"
        >
          <TableHeader>
            <TableRow className="bg-default-100 border-b border-divider">
              {/* Checkbox column */}
              <TableHead
                className="w-8 sm:w-12 px-1.5 sm:px-3 py-3"
                scope="col"
              >
                <Checkbox
                  aria-label="Select all"
                  checked={allSelectableSelected && selectableRepos.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                aria-sort={
                  sortDescriptor.column === "name"
                    ? sortDescriptor.direction
                    : "none"
                }
                className="px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider cursor-pointer select-none hover:bg-default-200 transition-colors"
                data-sortable="true"
                onClick={() => handleSortChange("name")}
                scope="col"
              >
                <span className="inline-flex items-center gap-1">
                  Repository
                  {sortDescriptor.column === "name" && (
                    <span className="text-default-400">
                      {sortDescriptor.direction === "ascending"
                        ? "\u25B2"
                        : "\u25BC"}
                    </span>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="hidden lg:table-cell px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider"
                scope="col"
              >
                Owner
              </TableHead>
              <TableHead
                className="hidden xl:table-cell px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider"
                scope="col"
              >
                Status
              </TableHead>
              <TableHead
                aria-sort={
                  sortDescriptor.column === "updatedAt"
                    ? sortDescriptor.direction
                    : "none"
                }
                className="w-24 sm:w-auto px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider cursor-pointer select-none hover:bg-default-200 transition-colors"
                data-sortable="true"
                onClick={() => handleSortChange("updatedAt")}
                scope="col"
              >
                <span className="inline-flex items-center gap-1">
                  <span className="sm:hidden">Updated</span>
                  <span className="hidden sm:inline">Last Updated</span>
                  {sortDescriptor.column === "updatedAt" && (
                    <span className="text-default-400">
                      {sortDescriptor.direction === "ascending"
                        ? "\u25B2"
                        : "\u25BC"}
                    </span>
                  )}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}
          <TableBody>
            {paginatedRepos.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-3 py-8 text-center text-default-500"
                  colSpan={5}
                >
                  No repos to display.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRepos.map((repo) => {
                const disabled = isRepoDisabled(repo);
                const isSelected =
                  selectedRepoKeys === "all" || selectedRepoKeys.has(repo.id);

                return (
                  <TableRow
                    className={`border-b border-divider/50 transition-colors ${
                      disabled
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-default-50"
                    } ${isSelected && !disabled ? "bg-primary/5" : ""}`}
                    data-testid="repo-row"
                    key={repo.id}
                  >
                    {/* Checkbox */}
                    <TableCell className="w-8 sm:w-12 px-1.5 sm:px-3 py-3">
                      <Checkbox
                        aria-label={repo.name}
                        checked={isSelected && !disabled}
                        disabled={disabled}
                        onCheckedChange={() => handleRowSelect(repo.id)}
                      />
                    </TableCell>

                    {/* Repository — name + description + MOBILE-ONLY pills */}
                    <TableCell className="px-3 py-3">
                      <div data-testid="repo-details">
                        <div className="mb-1" data-testid="repo-name">
                          <a
                            className="font-medium text-[var(--brand-link)] hover:underline"
                            href={repo.url as string}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {repo.name}
                          </a>
                        </div>

                        {/* Mobile-only: show pills inline (hidden on lg+) */}
                        <div
                          className="flex gap-1.5 mb-1.5 flex-wrap lg:hidden"
                          data-testid="repo-tags"
                        >
                          <RepoBadges login={login} repo={repo} showOwner />
                        </div>

                        {/* Description */}
                        <div
                          className="text-xs text-default-500"
                          data-testid="repo-description"
                        >
                          {repo.description ?? <i>No description</i>}
                        </div>
                      </div>
                    </TableCell>

                    {/* Owner — desktop only */}
                    <TableCell
                      className="hidden lg:table-cell px-3 py-3"
                      data-testid="repo-owner"
                    >
                      {repo.owner.login !== login ? (
                        <a
                          className="text-xs text-[var(--brand-link)] hover:underline"
                          href={repo.owner.url as string}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {repo.owner.login}
                        </a>
                      ) : (
                        <span className="text-xs text-default-400">
                          {repo.owner.login}
                        </span>
                      )}
                    </TableCell>

                    {/* Status — desktop only */}
                    <TableCell className="hidden xl:table-cell px-3 py-3">
                      <div
                        className="flex gap-1.5 flex-wrap"
                        data-testid="repo-tags"
                      >
                        <RepoBadges login={login} repo={repo} />
                      </div>
                    </TableCell>

                    {/* Last Updated */}
                    <TableCell
                      className="px-3 py-3 text-default-400 sm:whitespace-nowrap"
                      data-testid="repo-updated-at"
                      title={
                        repo.updatedAt
                          ? new Date(repo.updatedAt as string).toLocaleString(
                              navigator.language,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Unknown"
                      }
                    >
                      {repo.updatedAt
                        ? formatDistanceToNow(
                            new Date(repo.updatedAt as string),
                          )
                        : "Unknown"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION - Outside table border */}
      {totalPages > 1 && (
        <Pagination data-testid="table-pagination">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {pageNumbers.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* CONFIRMATION MODAL — login derived from first selected repo's owner if prop is null */}
      {repos && selectedRepos && (
        <ConfirmationModal
          action={Array.from(selectedRepoAction)[0] as "archive" | "delete"}
          data-testid="repo-confirmation-modal"
          isOpen={isOpen}
          login={login ?? selectedRepos[0]?.owner?.login ?? ""}
          onClose={onClose}
          repos={selectedRepos}
        />
      )}
    </div>
  );
}
