import { RefreshCw as ArrowPathIcon } from "lucide-react";

interface RepoLoadingProgressProps {
  currentOrg?: string;
  orgsLoaded: number;
  orgsTotal: number;
  stage: "complete" | "orgs" | "personal";
}

/**
 * Compact inline loading indicator — renders as a single line
 * to avoid layout shift when placed inside the dashboard title area.
 */
export default function RepoLoadingProgress({
  orgsLoaded,
  orgsTotal,
  stage,
}: RepoLoadingProgressProps) {
  if (stage === "complete") {
    return null;
  }

  const totalSteps = 1 + orgsTotal;
  const currentStep = stage === "personal" ? 1 : 1 + orgsLoaded;
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const label =
    stage === "personal"
      ? "Loading repos..."
      : `Loading orgs (${orgsLoaded}/${orgsTotal})...`;

  return (
    <div className="flex items-center gap-2 text-sm text-default-500">
      <ArrowPathIcon className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
      <span>{label}</span>
      <div
        aria-label="Loading progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="w-24 h-1 bg-default-200 rounded-full overflow-hidden"
        role="progressbar"
      >
        <div
          className="h-full bg-[var(--brand-blue)] rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-default-400">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
