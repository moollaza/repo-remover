import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRepoPagination } from "./use-repo-pagination";

// Helper to create array of test items
function createItems(count: number): { id: string; name: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));
}

describe("useRepoPagination", () => {
  it("should initialize with default values", () => {
    const items = createItems(10);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.perPage).toBe(5); // First option from PER_PAGE_OPTIONS
    expect(result.current.totalPages).toBe(2); // 10 items / 5 per page = 2 pages
    expect(result.current.paginatedItems).toHaveLength(5); // First page has 5 items
  });

  it("should paginate items correctly", () => {
    const items = createItems(10);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // First page
    expect(result.current.paginatedItems[0].name).toBe("Item 0");
    expect(result.current.paginatedItems[4].name).toBe("Item 4");

    // Go to second page
    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.paginatedItems[0].name).toBe("Item 5");
    expect(result.current.paginatedItems[4].name).toBe("Item 9");
  });

  it("should change items per page", () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Initially 5 per page, 4 total pages
    expect(result.current.perPage).toBe(5);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.paginatedItems).toHaveLength(5);

    // Change to 10 per page
    act(() => {
      result.current.setPerPage(new Set(["10"]));
    });

    expect(result.current.perPage).toBe(10);
    expect(result.current.totalPages).toBe(2); // 20 items / 10 per page = 2 pages
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
  });

  it("should reset to page 1 when changing per page", () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Go to page 3
    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    // Change per page - should reset to page 1
    act(() => {
      result.current.setPerPage(new Set(["10"]));
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should handle resetPage function", () => {
    const items = createItems(10);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Go to page 2
    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);

    // Reset to page 1
    act(() => {
      result.current.resetPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should calculate total pages correctly", () => {
    // Test with exact multiple
    const items1 = createItems(10);
    const { result: result1 } = renderHook(() =>
      useRepoPagination({ items: items1 }),
    );
    expect(result1.current.totalPages).toBe(2); // 10 / 5 = 2

    // Test with remainder
    const items2 = createItems(11);
    const { result: result2 } = renderHook(() =>
      useRepoPagination({ items: items2 }),
    );
    expect(result2.current.totalPages).toBe(3); // 11 / 5 = 2.2 -> ceil = 3
  });

  it("should handle last page with fewer items", () => {
    const items = createItems(11);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Go to last page
    act(() => {
      result.current.setCurrentPage(3);
    });

    // Last page should have only 1 item
    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.paginatedItems[0].name).toBe("Item 10");
  });

  it("should handle empty items array", () => {
    const { result } = renderHook(() => useRepoPagination({ items: [] }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.paginatedItems).toHaveLength(0);
  });

  it("should handle single item", () => {
    const items = createItems(1);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.paginatedItems[0].name).toBe("Item 0");
  });

  it("should auto-reset page when items are filtered and current page becomes invalid", () => {
    let items = createItems(20); // 4 pages with 5 per page
    const { rerender, result } = renderHook(
      ({ items }) => useRepoPagination({ items }),
      {
        initialProps: { items },
      },
    );

    // Go to page 4
    act(() => {
      result.current.setCurrentPage(4);
    });

    expect(result.current.currentPage).toBe(4);

    // Filter items to only 5 items (1 page)
    items = createItems(5);
    rerender({ items });

    // Should auto-reset to page 1 since page 4 no longer exists
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("should handle large datasets", () => {
    const items = createItems(1000);
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Change to 100 per page
    act(() => {
      result.current.setPerPage(new Set(["100"]));
    });

    expect(result.current.totalPages).toBe(10); // 1000 / 100 = 10 pages
    expect(result.current.paginatedItems).toHaveLength(100);

    // Go to last page
    act(() => {
      result.current.setCurrentPage(10);
    });

    expect(result.current.paginatedItems[0].name).toBe("Item 900");
    expect(result.current.paginatedItems[99].name).toBe("Item 999");
  });

  it("should handle different perPage options", () => {
    const items = createItems(100);
    const { result } = renderHook(() => useRepoPagination({ items }));

    const perPageOptions = [
      { expectedPages: 20, value: 5 },
      { expectedPages: 10, value: 10 },
      { expectedPages: 5, value: 20 },
      { expectedPages: 2, value: 50 },
      { expectedPages: 1, value: 100 },
    ];

    perPageOptions.forEach(({ expectedPages, value }) => {
      act(() => {
        result.current.setPerPage(new Set([value.toString()]));
      });

      expect(result.current.perPage).toBe(value);
      expect(result.current.totalPages).toBe(expectedPages);
      expect(result.current.currentPage).toBe(1); // Should reset each time
    });
  });

  it("should maintain correct boundaries between pages", () => {
    const items = createItems(15); // 3 pages with 5 per page
    const { result } = renderHook(() => useRepoPagination({ items }));

    // Page 1: items 0-4
    expect(result.current.paginatedItems[0].id).toBe("item-0");
    expect(result.current.paginatedItems[4].id).toBe("item-4");

    // Page 2: items 5-9
    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.paginatedItems[0].id).toBe("item-5");
    expect(result.current.paginatedItems[4].id).toBe("item-9");

    // Page 3: items 10-14
    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.paginatedItems[0].id).toBe("item-10");
    expect(result.current.paginatedItems[4].id).toBe("item-14");
  });

  it("should not resurface stale page when items expand after clamping", () => {
    let items = createItems(20); // 4 pages with 5 per page
    const { rerender, result } = renderHook(
      ({ items }) => useRepoPagination({ items }),
      { initialProps: { items } },
    );

    // Navigate to page 4
    act(() => {
      result.current.setCurrentPage(4);
    });
    expect(result.current.currentPage).toBe(4);

    // Filter down to 5 items (1 page) — should clamp to page 1
    items = createItems(5);
    rerender({ items });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(5);

    // Expand back to 20 items — should stay on page 1, not jump to 4
    items = createItems(20);
    rerender({ items });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(5);
    expect(result.current.paginatedItems[0].name).toBe("Item 0");
  });

  it("should never return currentPage > totalPages", () => {
    let items = createItems(20); // 4 pages
    const { rerender, result } = renderHook(
      ({ items }) => useRepoPagination({ items }),
      { initialProps: { items } },
    );

    // Navigate to page 4
    act(() => {
      result.current.setCurrentPage(4);
    });

    // Shrink to 2 items (1 page) — returned currentPage must be 1, not 4
    items = createItems(2);
    rerender({ items });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    // paginatedItems must show page 1 content, not be empty
    expect(result.current.paginatedItems).toHaveLength(2);
    expect(result.current.paginatedItems[0].name).toBe("Item 0");
  });

  it("should ignore setPerPage with empty Set (produces NaN)", () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.perPage).toBe(5);
    expect(result.current.totalPages).toBe(4);

    // Empty Set: Array.from(new Set())[0] is undefined, Number(undefined) is NaN
    act(() => {
      result.current.setPerPage(new Set([]));
    });

    // perPage should remain unchanged — NaN must not be accepted
    expect(result.current.perPage).toBe(5);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.paginatedItems).toHaveLength(5);
  });

  it('should ignore setPerPage with "all" string (HeroUI sentinel)', () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.perPage).toBe(5);

    // HeroUI emits "all" as a Selection value — Number("a") is NaN
    act(() => {
      result.current.setPerPage("all" as unknown as Set<string>);
    });

    // perPage should remain unchanged
    expect(result.current.perPage).toBe(5);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.paginatedItems).toHaveLength(5);
  });

  it("should ignore setPerPage with non-numeric string value", () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.perPage).toBe(5);

    // A Set with a non-numeric string
    act(() => {
      result.current.setPerPage(new Set(["abc"]));
    });

    // perPage should remain unchanged
    expect(result.current.perPage).toBe(5);
    expect(result.current.totalPages).toBe(4);
  });

  it("should ignore setPerPage with zero or negative value", () => {
    const items = createItems(20);
    const { result } = renderHook(() => useRepoPagination({ items }));

    expect(result.current.perPage).toBe(5);

    act(() => {
      result.current.setPerPage(new Set(["0"]));
    });
    expect(result.current.perPage).toBe(5);

    act(() => {
      result.current.setPerPage(new Set(["-5"]));
    });
    expect(result.current.perPage).toBe(5);
  });

  it("should handle items array changing", () => {
    let items = createItems(10);
    const { rerender, result } = renderHook(
      ({ items }) => useRepoPagination({ items }),
      {
        initialProps: { items },
      },
    );

    expect(result.current.totalPages).toBe(2);
    expect(result.current.paginatedItems).toHaveLength(5);

    // Change to more items
    items = createItems(25);
    rerender({ items });

    expect(result.current.totalPages).toBe(5);
    expect(result.current.paginatedItems).toHaveLength(5);
  });
});
