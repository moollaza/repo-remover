import RepoFiltersSkeleton from "./repo-filters-skeleton";

interface RepoTableSkeletonProps {
  rows?: number;
}

export default function RepoTableSkeleton({
  rows = 10,
}: RepoTableSkeletonProps) {
  return (
    <div className="space-y-4" data-testid="repo-table-skeleton-container">
      {/* Filters skeleton */}
      <RepoFiltersSkeleton />

      {/* Table skeleton — matches 5-column desktop + card mobile layout */}
      <div className="border border-divider rounded-xl overflow-hidden bg-content1">
        <table
          aria-label="Loading repositories"
          className="w-full table-fixed text-sm"
        >
          <thead>
            <tr className="bg-default-100 border-b border-divider">
              {/* Checkbox */}
              <th className="w-12 px-3 py-3" scope="col">
                <div className="h-4 w-4 rounded bg-default-200 animate-pulse" />
              </th>
              {/* Repository */}
              <th className="px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider">
                Repository
              </th>
              {/* Owner — desktop only */}
              <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider">
                Owner
              </th>
              {/* Status — desktop only */}
              <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider">
                Status
              </th>
              {/* Last Updated */}
              <th className="px-3 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr
                className="border-b border-divider/50 last:border-b-0"
                key={i}
              >
                {/* Checkbox */}
                <td className="w-12 px-3 py-3">
                  <div className="h-4 w-4 rounded bg-default-200 animate-pulse" />
                </td>
                {/* Repository + mobile pills */}
                <td className="px-3 py-3">
                  <div className="h-4 w-40 rounded bg-default-200 animate-pulse mb-1.5" />
                  {/* Mobile-only pill skeletons */}
                  <div className="flex gap-1.5 mb-1.5 xl:hidden">
                    <div className="h-4 w-14 rounded-full bg-default-200 animate-pulse" />
                    <div className="h-4 w-16 rounded-full bg-default-200 animate-pulse" />
                  </div>
                  <div className="h-3 w-full rounded bg-default-200 animate-pulse" />
                </td>
                {/* Owner — desktop only */}
                <td className="hidden xl:table-cell px-3 py-3">
                  <div className="h-3 w-20 rounded bg-default-200 animate-pulse" />
                </td>
                {/* Status — desktop only */}
                <td className="hidden xl:table-cell px-3 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-4 w-14 rounded-full bg-default-200 animate-pulse" />
                  </div>
                </td>
                {/* Last Updated */}
                <td className="px-3 py-3">
                  <div className="h-3 w-20 rounded bg-default-200 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex w-full justify-center">
        <div className="h-10 w-64 rounded-lg bg-default-200 animate-pulse" />
      </div>
    </div>
  );
}
