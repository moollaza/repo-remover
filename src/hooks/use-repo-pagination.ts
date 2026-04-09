import { useCallback, useEffect, useMemo, useState } from "react";

import { type Selection } from "@/hooks/use-repo-filters";

import { PER_PAGE_OPTIONS } from "@/config/repo-config";

export interface UseRepoPaginationProps<T> {
  /**
   * Array of items to paginate
   */
  items: T[];
}

export interface UseRepoPaginationReturn<T> {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  /**
   * Current page of items
   */
  paginatedItems: T[];
  /**
   * Number of items per page
   */
  perPage: number;
  /**
   * Reset pagination to page 1 (useful after filter changes)
   */
  resetPage: () => void;
  /**
   * Set the current page
   */
  setCurrentPage: (page: number) => void;
  /**
   * Update the items per page and reset to page 1
   */
  setPerPage: (keys: Selection) => void;
  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Custom hook for paginating items.
 *
 * Handles:
 * - Pagination calculations
 * - Items per page selection
 * - Page boundaries
 * - Automatic page reset when filters change
 *
 * @example
 * ```tsx
 * const {
 *   paginatedItems,
 *   currentPage,
 *   setCurrentPage,
 *   perPage,
 *   setPerPage,
 *   totalPages,
 *   resetPage
 * } = useRepoPagination({ items: filteredRepos });
 * ```
 */
export function useRepoPagination<T>({
  items,
}: UseRepoPaginationProps<T>): UseRepoPaginationReturn<T> {
  const [perPage, setPerPageState] = useState<number>(PER_PAGE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / perPage);

  // Clamp page inline so returned values are always consistent,
  // even before the useEffect below syncs the state
  const effectivePage =
    totalPages > 0 && currentPage > totalPages ? 1 : currentPage;

  // Sync state when page becomes invalid (after filter/item changes)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Get the current page of items
  const paginatedItems = useMemo(() => {
    const start = (effectivePage - 1) * perPage;
    const end = start + perPage;

    return items.slice(start, end);
  }, [items, effectivePage, perPage]);

  // Handle per page change with Selection type from HeroUI
  const setPerPage = useCallback((keys: Selection) => {
    const newPerPage = Number(Array.from(keys as Set<string>)[0]);
    if (!Number.isFinite(newPerPage) || newPerPage <= 0) return;
    setPerPageState(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Reset to first page (useful when filters change)
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: effectivePage,
    paginatedItems,
    perPage,
    resetPage,
    setCurrentPage,
    setPerPage,
    totalPages,
  };
}
