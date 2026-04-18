/**
 * Backwards-compat re-export. The marketing header (home, guides) is the
 * default because most shared paths want the no-auth version; the dashboard
 * route mounts `DashboardHeader` inside `GitHubDataProvider` directly.
 */
export { MarketingHeader as default } from "@/components/marketing-header";
