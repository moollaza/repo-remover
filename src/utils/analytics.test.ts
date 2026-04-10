import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fathom-client", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/utils/debug", () => ({
  debug: { log: vi.fn(), warn: vi.fn() },
}));

import { trackEvent } from "fathom-client";

import { debug } from "@/utils/debug";

import { analytics, resetSessionTracking, track } from "./analytics";

describe("track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionTracking();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("in development mode (default test env)", () => {
    it("logs dev message and does not call trackEvent", () => {
      track("dashboard.user.logout");

      expect(debug.log).toHaveBeenCalledWith(
        "[Analytics] Would track: dashboard.user.logout",
        "",
      );
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it("logs dev message with value when provided", () => {
      track("dashboard.action.archive_submit", 5);

      expect(debug.log).toHaveBeenCalledWith(
        "[Analytics] Would track: dashboard.action.archive_submit",
        "(value: 5)",
      );
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it("logs value=0 correctly (not falsy-skipped)", () => {
      track("dashboard.action.delete_submit", 0);

      expect(debug.log).toHaveBeenCalledWith(
        "[Analytics] Would track: dashboard.action.delete_submit",
        "(value: 0)",
      );
    });
  });

  describe("once-per-session tracking", () => {
    it("fires once-per-session events only once", () => {
      track("auth.token.validated");
      track("auth.token.validated");

      // First call logs the event, second logs skip message
      expect(debug.log).toHaveBeenCalledTimes(2);
      expect(debug.log).toHaveBeenNthCalledWith(
        1,
        "[Analytics] Would track: auth.token.validated",
        "",
      );
      expect(debug.log).toHaveBeenNthCalledWith(
        2,
        "[Analytics] Skipped (already fired): auth.token.validated",
      );
    });

    it("fires non-once events every time", () => {
      track("dashboard.user.logout");
      track("dashboard.user.logout");

      expect(debug.log).toHaveBeenCalledTimes(2);
      expect(debug.log).toHaveBeenNthCalledWith(
        1,
        "[Analytics] Would track: dashboard.user.logout",
        "",
      );
      expect(debug.log).toHaveBeenNthCalledWith(
        2,
        "[Analytics] Would track: dashboard.user.logout",
        "",
      );
    });

    it("resetSessionTracking allows once events to fire again", () => {
      track("auth.token.validated");
      resetSessionTracking();
      track("auth.token.validated");

      // Both should be "Would track" (no skip)
      expect(debug.log).toHaveBeenNthCalledWith(
        1,
        "[Analytics] Would track: auth.token.validated",
        "",
      );
      expect(debug.log).toHaveBeenNthCalledWith(
        2,
        "[Analytics] Would track: auth.token.validated",
        "",
      );
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      vi.resetModules();
      vi.stubEnv("PROD", true);
      vi.stubEnv("DEV", false);
    });

    it("calls trackEvent with event name only when no value", async () => {
      const { track: prodTrack } = await import("./analytics");
      prodTrack("dashboard.user.logout");

      expect(trackEvent).toHaveBeenCalledWith("dashboard.user.logout");
    });

    it("calls trackEvent with _value when value is provided", async () => {
      const { track: prodTrack } = await import("./analytics");
      prodTrack("dashboard.action.archive_submit", 10);

      expect(trackEvent).toHaveBeenCalledWith(
        "dashboard.action.archive_submit",
        { _value: 10 },
      );
    });

    it("calls trackEvent with _value when value is 0", async () => {
      const { track: prodTrack } = await import("./analytics");
      prodTrack("dashboard.action.delete_submit", 0);

      expect(trackEvent).toHaveBeenCalledWith(
        "dashboard.action.delete_submit",
        { _value: 0 },
      );
    });

    it("swallows trackEvent errors and logs via debug.warn", async () => {
      const error = new Error("Fathom blocked");
      vi.mocked(trackEvent).mockImplementation(() => {
        throw error;
      });

      const { track: prodTrack } = await import("./analytics");
      expect(() => prodTrack("dashboard.user.logout")).not.toThrow();

      expect(debug.warn).toHaveBeenCalledWith("Failed to track event:", error);
    });
  });
});

describe("analytics convenience methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionTracking();
  });

  it("trackArchiveSubmit passes correct event name and count", () => {
    analytics.trackArchiveSubmit(3);
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.action.archive_submit",
      "(value: 3)",
    );
  });

  it("trackDeleteSubmit passes correct event name and count", () => {
    analytics.trackDeleteSubmit(5);
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.action.delete_submit",
      "(value: 5)",
    );
  });

  it("trackCTAScrollClick passes correct event name", () => {
    analytics.trackCTAScrollClick();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: landing.cta.scroll_click",
      "",
    );
  });

  it("trackHeroCTAClick passes correct event name", () => {
    analytics.trackHeroCTAClick();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: landing.cta.hero_click",
      "",
    );
  });

  it("trackGeneratePATClick passes correct event name", () => {
    analytics.trackGeneratePATClick();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: landing.generate_pat.click",
      "",
    );
  });

  it("trackRepoArchived passes correct event name and value 1", () => {
    analytics.trackRepoArchived();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.repo.archived",
      "(value: 1)",
    );
  });

  it("trackRepoDeleted passes correct event name and value 1", () => {
    analytics.trackRepoDeleted();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.repo.deleted",
      "(value: 1)",
    );
  });

  it("trackTokenValidated passes correct event name", () => {
    analytics.trackTokenValidated();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: auth.token.validated",
      "",
    );
  });

  it("trackTokenFailed passes correct event name", () => {
    analytics.trackTokenFailed();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: auth.token.failed",
      "",
    );
  });

  it("trackBatchCompleted passes correct event name and count", () => {
    analytics.trackBatchCompleted(8);
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.batch.completed",
      "(value: 8)",
    );
  });

  it("trackBatchStopped passes correct event name and count", () => {
    analytics.trackBatchStopped(3);
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.batch.stopped",
      "(value: 3)",
    );
  });

  it("trackLogout passes correct event name", () => {
    analytics.trackLogout();
    expect(debug.log).toHaveBeenCalledWith(
      "[Analytics] Would track: dashboard.user.logout",
      "",
    );
  });
});
