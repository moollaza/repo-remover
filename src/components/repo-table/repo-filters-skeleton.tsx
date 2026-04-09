export default function RepoFiltersSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2"
      data-testid="repo-filters-skeleton"
    >
      {/* Per page selector skeleton */}
      <div className="w-full md:w-20">
        <div className="h-10 w-full rounded-lg bg-default-200 animate-pulse" />
      </div>

      {/* Repo type selector skeleton */}
      <div className="w-full md:w-44">
        <div className="h-10 w-full rounded-lg bg-default-200 animate-pulse" />
      </div>

      {/* Search input skeleton */}
      <div className="w-full md:flex-1">
        <div className="h-10 w-full rounded-lg bg-default-200 animate-pulse" />
      </div>

      {/* Action buttons skeleton */}
      <div className="w-full md:w-auto md:flex-shrink-0">
        <div className="h-10 w-48 rounded-lg bg-default-200 animate-pulse" />
      </div>
    </div>
  );
}
