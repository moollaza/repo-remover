import { DashboardHeader } from "@/components/dashboard-header";
import Footer from "@/components/footer";
import { GitHubDataProvider } from "@/providers/github-data-provider";
import { Dashboard } from "@/routes/dashboard";

/**
 * Dashboard route shell. Mounts `GitHubDataProvider` only for `/dashboard`
 * (and descendants) so the marketing home route never pulls in Octokit.
 */
export function DashboardShell() {
  return (
    <GitHubDataProvider>
      <div className="min-h-full">
        <DashboardHeader />
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Dashboard />
          </div>
        </main>
        <Footer />
      </div>
    </GitHubDataProvider>
  );
}
