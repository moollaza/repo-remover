// Fathom Analytics utilities for privacy-first event tracking
// Uses modern trackEvent API (2024+) instead of deprecated trackGoal
// Page views are handled automatically by FathomAnalytics component

import { trackEvent } from "fathom-client";

import { debug } from "@/utils/debug";

// Configuration constants
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Track user events using modern Fathom trackEvent API
 *
 * @param eventName - Descriptive event name (no special characters)
 * @param value - Optional value for counting (e.g., number of repos)
 */
export function track(eventName: string, value?: number): void {
  if (!IS_PRODUCTION) {
    debug.log(
      `[DEV] Would track event: ${eventName}`,
      value !== undefined ? `(value: ${value})` : "",
    );
    return;
  }

  try {
    if (value !== undefined) {
      trackEvent(eventName, { _value: value });
    } else {
      trackEvent(eventName);
    }
  } catch (error) {
    debug.warn("Failed to track event:", error);
  }
}

/**
 * Pre-defined event tracking functions for common user actions
 */
export const analytics = {
  /**
   * Track when user submits bulk archive action
   * @param repoCount - Number of repositories being archived
   */
  trackArchiveActionSubmitted: (repoCount: number) =>
    track("archive_action_submitted", repoCount),

  /**
   * Track when user submits bulk delete action
   * @param repoCount - Number of repositories being deleted
   */
  trackDeleteActionSubmitted: (repoCount: number) =>
    track("delete_action_submitted", repoCount),

  /**
   * Track when user clicks "Get Started" CTA buttons
   */
  trackGetStartedClick: () => track("get_started_click"),

  /**
   * Track individual repository archived (for total counting)
   */
  trackRepoArchived: () => track("repo_archived", 1),

  /**
   * Track individual repository deleted (for total counting)
   */
  trackRepoDeleted: () => track("repo_deleted", 1),

  /**
   * Track successful GitHub token validation
   */
  trackTokenValidated: () => track("token_validated"),
};
