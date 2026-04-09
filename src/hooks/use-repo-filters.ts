import { type Repository } from "@octokit/graphql-schema";

/**
 * Local replacement for HeroUI's Selection type.
 * Represents either a Set of selected keys or the literal "all".
 */
export type Selection = Set<string> | "all";

/**
 * A Selection that is always a concrete Set (never "all").
 */
export type SelectionSet = Exclude<Selection, "all">;

export interface SortDescriptor {
  column?: string;
  direction?: "ascending" | "descending";
}
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { COLUMNS, REPO_TYPES } from "@/config/repo-config";

export interface UseRepoFiltersProps {
  /**
   * Current user's GitHub login for permission filtering
   */
  login: null | string;
  /**
   * Array of repositories to filter and sort
   */
  repos: RepositoryWithKey[];
}

export interface UseRepoFiltersReturn {
  /**
   * Filtered and sorted repositories
   */
  filteredRepos: RepositoryWithKey[];
  /**
   * Current search query for filtering by name/description
   */
  nameFilter: string;
  /**
   * Update the search query
   */
  setNameFilter: (query: string) => void;
  /**
   * Update the sort configuration
   */
  setSortDescriptor: Dispatch<SetStateAction<SortDescriptor>>;
  /**
   * Update the type filters and reset pagination
   */
  setTypeFilters: (keys: Selection) => void;
  /**
   * Current sort configuration
   */
  sortDescriptor: SortDescriptor;
  /**
   * Set of selected repository type filters
   */
  typeFilters: SelectionSet;
}

interface RepositoryWithKey extends Repository {
  key: string;
}

/**
 * Custom hook for filtering and sorting repositories.
 *
 * Handles:
 * - Search filtering by name and description
 * - Type filtering (private, fork, archived, etc.)
 * - Permission filtering (only show repos user can administer)
 * - Sorting by column (name, updatedAt)
 *
 * @example
 * ```tsx
 * const {
 *   filteredRepos,
 *   nameFilter,
 *   setNameFilter,
 *   typeFilters,
 *   setTypeFilters,
 *   sortDescriptor,
 *   setSortDescriptor
 * } = useRepoFilters({ repos: reposWithKeys, login: user.login });
 * ```
 */
export function useRepoFilters({
  login,
  repos,
}: UseRepoFiltersProps): UseRepoFiltersReturn {
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilters, setTypeFiltersState] = useState<SelectionSet>(
    new Set(REPO_TYPES.map((type) => type.key)),
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: COLUMNS.updatedAt.key,
    direction: "descending",
  });

  // Callback for type filter changes that can trigger pagination reset in parent
  const setTypeFilters = useCallback((keys: Selection) => {
    if (keys === "all") {
      setTypeFiltersState(new Set(REPO_TYPES.map((t) => t.key)));
    } else {
      setTypeFiltersState(keys);
    }
  }, []);

  // First filter repos by search query, selected types, and admin permissions
  const filteredByQueryAndType = useMemo(() => {
    if (!repos) return [];

    return repos.filter((repo) => {
      // Check if user can administer this repo (either they own it or have admin rights)
      const canAdminister =
        repo.owner.login === login || repo.viewerCanAdminister === true;

      // If user can't administer this repo, filter it out
      if (!canAdminister) return false;

      const matchesSearchQuery =
        repo.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        repo.description?.toLowerCase().includes(nameFilter.toLowerCase());

      // A "source" repo is one that is NOT a fork and NOT a mirror
      const isSource = !repo.isFork && !repo.isMirror;

      const matchesType =
        // If no types are selected, nothing matches
        typeFilters.size === 0
          ? false
          : REPO_TYPES.every((type) => {
              if (!typeFilters.has(type.key)) {
                // "isSource" is a derived property — hide source repos when unchecked
                if (type.key === "isSource") {
                  return !isSource;
                }
                // For real boolean properties, hide repos that have the property
                if (repo[type.key as keyof Repository]) {
                  return false;
                }
              }
              return true;
            });

      return matchesSearchQuery && matchesType;
    });
  }, [repos, nameFilter, typeFilters, login]);

  // Then sort the filtered repos
  const filteredRepos = useMemo(() => {
    return [...filteredByQueryAndType].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Repository] as string;
      const second = b[sortDescriptor.column as keyof Repository] as string;

      let cmp = 0;

      if (sortDescriptor.column === COLUMNS.name.key) {
        cmp = first.localeCompare(second);
      } else if (sortDescriptor.column === COLUMNS.updatedAt.key) {
        cmp = new Date(first).getTime() - new Date(second).getTime();
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredByQueryAndType, sortDescriptor]);

  return {
    filteredRepos,
    nameFilter,
    setNameFilter,
    setSortDescriptor,
    setTypeFilters,
    sortDescriptor,
    typeFilters,
  };
}
