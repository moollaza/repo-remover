import { type Repository } from "@octokit/graphql-schema";
import { RefreshCw, X } from "lucide-react";
import { useState } from "react";

import RepoTable from "@/components/repo-table/repo-table";
import RepoTableSkeleton from "@/components/repo-table/repo-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface DashboardProps {
  /** Whether an error occurred during data fetch */
  isError: boolean;
  /** Whether data is currently loading (first time, no cache) */
  isLoading: boolean;
  /** Whether data is refreshing in the background (cached data visible) */
  isRefreshing: boolean;
  /** Current user's login/username */
  login: null | string;
  /** Optional callback for refresh action */
  onRefresh?: () => void;
  /** Optional permission warning message */
  permissionWarning?: string;
  /** Current user's repositories */
  repos: null | Repository[];
  /** Org names that failed to load due to SAML SSO enforcement */
  samlProtectedOrgs?: string[];
}

/**
 * Dashboard - Presentational Component
 *
 * Pure presentational component with zero hooks/context/effects.
 * Container version: src/routes/dashboard.tsx
 */
export default function Dashboard({
  isError,
  isLoading,
  isRefreshing,
  login,
  onRefresh,
  permissionWarning,
  repos,
  samlProtectedOrgs,
}: DashboardProps) {
  const [isSamlBannerDismissed, setIsSamlBannerDismissed] = useState(false);

  const showSamlBanner =
    !isSamlBannerDismissed && samlProtectedOrgs && samlProtectedOrgs.length > 0;

  return (
    <section className="py-10 flex-grow">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1
            className="text-2xl font-semibold"
            data-testid="repo-table-header"
          >
            Repository Management
          </h1>
          <p className="text-default-500 mt-1">
            Select repositories to archive or delete permanently
          </p>
        </div>

        {onRefresh && (
          <Button
            aria-label="Refresh repository data"
            className="shrink-0 gap-2 px-4 py-2 border-divider cursor-pointer hover:bg-default-100 hover:border-default-300 active:scale-95 transition-all"
            disabled={isLoading || isRefreshing}
            onClick={onRefresh}
            variant="ghost"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
            />
            {isLoading || isRefreshing ? "Loading..." : "Refresh"}
          </Button>
        )}
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Error loading repositories. Please check your token and try again.
          </AlertDescription>
        </Alert>
      )}

      {permissionWarning && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Limited token permissions</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 text-sm list-disc list-inside space-y-1">
              {permissionWarning.split("\n\n").map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
            <a
              className="inline-block mt-3 text-sm font-medium underline hover:no-underline"
              href="https://github.com/settings/tokens"
              rel="noopener noreferrer"
              target="_blank"
            >
              Update token permissions on GitHub &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      {showSamlBanner && (
        <Alert variant="warning" className="mb-4 relative" role="status">
          <Button
            aria-label="Dismiss SAML warning"
            className="absolute top-3 right-3 p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            onClick={() => setIsSamlBannerDismissed(true)}
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertTitle>
            Some organizations require SAML authentication
          </AlertTitle>
          <AlertDescription>
            <p className="mt-1 text-sm">
              Repos from{" "}
              <span className="font-medium">
                {samlProtectedOrgs.join(", ")}
              </span>{" "}
              couldn&apos;t be loaded. Authorize your token in your org&apos;s
              SSO settings to access these repositories.
            </p>
            <a
              className="inline-block mt-3 text-sm font-medium underline hover:no-underline"
              href="https://github.com/settings/tokens"
              rel="noopener noreferrer"
              target="_blank"
            >
              Authorize SSO for your token on GitHub &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Show skeleton only on first load; show table (even during refresh) once we have data */}
      {repos === null ? (
        <RepoTableSkeleton rows={10} />
      ) : (
        <RepoTable login={login} repos={repos} />
      )}
    </section>
  );
}
