import { type Repository } from "@octokit/graphql-schema";
import { useCallback, useMemo, useState } from "react";

import { type Selection } from "@/hooks/use-repo-filters";

export interface UseRepoSelectionProps {
  disabledKeys: Set<string>;
  filteredRepos: Repository[];
  isRepoDisabled: (repo: Repository) => boolean;
  paginatedRepos: Repository[];
}

export interface UseRepoSelectionReturn {
  allSelectableSelected: boolean;
  handleRowSelect: (repoId: string) => void;
  handleSelectAll: () => void;
  selectableRepos: Repository[];
  selectedRepoKeys: Selection;
  selectedRepos: Repository[];
  setSelectedRepoKeys: React.Dispatch<React.SetStateAction<Selection>>;
}

/**
 * Custom hook for managing repository selection state.
 *
 * Handles:
 * - Individual row selection/deselection
 * - Select all / deselect all across all filtered repos
 * - Disabled key awareness (skips locked/archived repos)
 * - Resolving selected keys to Repository objects
 */
export function useRepoSelection({
  disabledKeys,
  filteredRepos,
  isRepoDisabled,
  paginatedRepos,
}: UseRepoSelectionProps): UseRepoSelectionReturn {
  const [selectedRepoKeys, setSelectedRepoKeys] = useState<Selection>(
    new Set(),
  );

  const selectedRepos = useMemo(() => {
    if (selectedRepoKeys === "all") {
      return filteredRepos;
    }
    return filteredRepos.filter((repo) => selectedRepoKeys.has(repo.id));
  }, [filteredRepos, selectedRepoKeys]);

  const selectableRepos = useMemo(
    () => paginatedRepos.filter((r) => !disabledKeys.has(r.id)),
    [paginatedRepos, disabledKeys],
  );

  const allSelectableSelected = useMemo(() => {
    if (selectedRepoKeys === "all") return true;
    if (selectableRepos.length === 0) return false;
    return selectableRepos.every((r) => selectedRepoKeys.has(r.id));
  }, [selectedRepoKeys, selectableRepos]);

  const handleSelectAll = useCallback(() => {
    if (allSelectableSelected) {
      setSelectedRepoKeys(new Set());
    } else {
      const allIds = new Set(
        filteredRepos.filter((r) => !isRepoDisabled(r)).map((r) => r.id),
      );
      setSelectedRepoKeys(allIds);
    }
  }, [allSelectableSelected, filteredRepos, isRepoDisabled]);

  const handleRowSelect = useCallback(
    (repoId: string) => {
      if (disabledKeys.has(repoId)) return;

      setSelectedRepoKeys((prev) => {
        const prevSet =
          prev === "all"
            ? new Set(filteredRepos.map((r) => r.id))
            : new Set(prev);
        if (prevSet.has(repoId)) {
          prevSet.delete(repoId);
        } else {
          prevSet.add(repoId);
        }
        return prevSet;
      });
    },
    [disabledKeys, filteredRepos],
  );

  return {
    allSelectableSelected,
    handleRowSelect,
    handleSelectAll,
    selectableRepos,
    selectedRepoKeys,
    selectedRepos,
    setSelectedRepoKeys,
  };
}
