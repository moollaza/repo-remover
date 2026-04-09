import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardComponent from "@/components/dashboard";
import { ErrorBoundary } from "@/components/error-boundary";
import { useGitHubData } from "@/hooks/use-github-data";

/**
 * Dashboard - Container Component
 *
 * Handles data fetching, authentication, and routing.
 * Presentational component: src/components/dashboard.tsx
 */
export function Dashboard() {
  const {
    isError,
    isInitialized,
    isLoading,
    isRefreshing,
    login,
    pat,
    permissionWarning,
    refetchData,
    repos,
    samlProtectedOrgs,
  } = useGitHubData();

  const navigate = useNavigate();

  // Side effect: Redirect to home if not authenticated
  useEffect(() => {
    if (!isInitialized) return;

    if (!pat) {
      void navigate("/");
    }
    // Don't force refetch on mount — SWR caches data and will
    // revalidate automatically. Use the Refresh button for manual refresh.
  }, [pat, navigate, isInitialized]);

  // Render presentational component with all data
  return (
    <ErrorBoundary>
      <DashboardComponent
        isError={isError}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        login={login}
        onRefresh={refetchData}
        permissionWarning={permissionWarning}
        repos={repos}
        samlProtectedOrgs={samlProtectedOrgs}
      />
    </ErrorBoundary>
  );
}
