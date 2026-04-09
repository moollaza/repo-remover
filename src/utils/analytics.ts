// Fathom Analytics — typed event registry with dot-notation naming
// Uses fathom-client trackEvent API. Page views handled by FathomAnalytics component.
// Naming convention: page.element.action (project-hub standard)

import { trackEvent } from "fathom-client";

import { debug } from "@/utils/debug";

// --- Event Registry ---

interface FathomEventConfig {
  readonly once?: boolean; // Default: false (fire every time)
  readonly description: string;
}

const FATHOM_EVENTS = {
  // Landing page
  "landing.cta.hero_click": {
    description: 'User clicked the hero "Start Cleaning Up" button',
    once: true,
  },
  "landing.cta.scroll_click": {
    description: "User clicked a CTA that scrolls to the token form",
    once: true,
  },
  "landing.generate_pat.click": {
    description: 'User clicked the "Generate PAT on GitHub" external link',
    once: true,
  },

  // Auth flow
  "auth.token.failed": {
    description:
      "GitHub PAT validation failed (invalid format or API rejection)",
  },
  "auth.token.validated": {
    description: "GitHub PAT validated successfully via API",
    once: true,
  },

  // Dashboard actions
  "dashboard.action.archive_submit": {
    description: "User confirmed bulk archive action",
  },
  "dashboard.action.delete_submit": {
    description: "User confirmed bulk delete action",
  },
  "dashboard.batch.completed": {
    description: "Batch operation completed (all repos processed)",
  },
  "dashboard.batch.stopped": {
    description: "User stopped a batch operation before completion",
  },
  "dashboard.repo.archived": {
    description: "Single repository archived successfully",
  },
  "dashboard.repo.deleted": {
    description: "Single repository deleted successfully",
  },
  "dashboard.user.logout": {
    description: "User clicked logout",
  },
} as const satisfies Record<string, FathomEventConfig>;

type FathomEventName = keyof typeof FATHOM_EVENTS;

// --- Once-per-session tracking ---

const firedThisSession = new Set<FathomEventName>();

// --- Core tracking function ---

const IS_PRODUCTION = import.meta.env.PROD;

function track(eventName: FathomEventName, value?: number): void {
  const config = FATHOM_EVENTS[eventName] as FathomEventConfig;
  const once = config.once ?? false;

  if (once && firedThisSession.has(eventName)) {
    debug.log(`[Analytics] Skipped (already fired): ${eventName}`);
    return;
  }

  if (!IS_PRODUCTION) {
    debug.log(
      `[Analytics] Would track: ${eventName}`,
      value !== undefined ? `(value: ${value})` : "",
    );
    if (once) firedThisSession.add(eventName);
    return;
  }

  try {
    if (value !== undefined) {
      trackEvent(eventName, { _value: value });
    } else {
      trackEvent(eventName);
    }
    if (once) firedThisSession.add(eventName);
  } catch (error) {
    debug.warn("Failed to track event:", error);
  }
}

// --- Legacy event bridge ---
// Also fire old snake_case names so Fathom keeps accumulating historical data.
// Remove once the old events are no longer needed for reporting.

function trackLegacy(legacyName: string, value?: number): void {
  if (!IS_PRODUCTION) return; // dev logging already handled by track()
  try {
    if (value !== undefined) {
      trackEvent(legacyName, { _value: value });
    } else {
      trackEvent(legacyName);
    }
  } catch {
    // Swallow — legacy tracking is best-effort
  }
}

// --- Convenience API ---

export const analytics = {
  trackArchiveSubmit: (repoCount: number) => {
    track("dashboard.action.archive_submit", repoCount);
    trackLegacy("archive_action_submitted", repoCount);
  },
  trackBatchCompleted: (successCount: number) =>
    track("dashboard.batch.completed", successCount),
  trackBatchStopped: (processedCount: number) =>
    track("dashboard.batch.stopped", processedCount),
  trackCTAScrollClick: () => {
    track("landing.cta.scroll_click");
    trackLegacy("get_started_click");
  },
  trackDeleteSubmit: (repoCount: number) => {
    track("dashboard.action.delete_submit", repoCount);
    trackLegacy("delete_action_submitted", repoCount);
  },
  trackGeneratePATClick: () => track("landing.generate_pat.click"),
  trackHeroCTAClick: () => track("landing.cta.hero_click"),
  trackLogout: () => track("dashboard.user.logout"),
  trackRepoArchived: () => {
    track("dashboard.repo.archived", 1);
    trackLegacy("repo_archived", 1);
  },
  trackRepoDeleted: () => {
    track("dashboard.repo.deleted", 1);
    trackLegacy("repo_deleted", 1);
  },
  trackTokenFailed: () => track("auth.token.failed"),
  trackTokenValidated: () => {
    track("auth.token.validated");
    trackLegacy("token_validated");
  },
};

// Exported for testing
export { FATHOM_EVENTS, track };
export type { FathomEventName };

export function resetSessionTracking(): void {
  firedThisSession.clear();
}
