import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fathom-client", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/utils/debug", () => ({
  debug: { log: vi.fn(), warn: vi.fn() },
}));

import { trackEvent } from "fathom-client";

import { debug } from "@/utils/debug";

import { analytics, track } from "./analytics";

describe("track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("in development mode (default test env)", () => {
    it("logs dev message and does not call trackEvent", () => {
      track("test_event");

      expect(debug.log).toHaveBeenCalledWith(
        "[DEV] Would track event: test_event",
        "",
      );
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it("logs dev message with value when provided", () => {
      track("test_event", 5);

      expect(debug.log).toHaveBeenCalledWith(
        "[DEV] Would track event: test_event",
        "(value: 5)",
      );
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it("logs value=0 correctly (not falsy-skipped)", () => {
      track("test_event", 0);

      expect(debug.log).toHaveBeenCalledWith(
        "[DEV] Would track event: test_event",
        "(value: 0)",
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
      prodTrack("test_event");

      expect(trackEvent).toHaveBeenCalledWith("test_event");
    });

    it("calls trackEvent with _value when value is provided", async () => {
      const { track: prodTrack } = await import("./analytics");
      prodTrack("test_event", 10);

      expect(trackEvent).toHaveBeenCalledWith("test_event", { _value: 10 });
    });

    it("calls trackEvent with _value when value is 0", async () => {
      const { track: prodTrack } = await import("./analytics");
      prodTrack("test_event", 0);

      expect(trackEvent).toHaveBeenCalledWith("test_event", { _value: 0 });
    });

    it("swallows trackEvent errors and logs via debug.warn", async () => {
      const error = new Error("Fathom blocked");
      vi.mocked(trackEvent).mockImplementation(() => {
        throw error;
      });

      const { track: prodTrack } = await import("./analytics");
      expect(() => prodTrack("test_event")).not.toThrow();

      expect(debug.warn).toHaveBeenCalledWith("Failed to track event:", error);
    });
  });
});

describe("analytics convenience methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackArchiveActionSubmitted passes correct event name and count", () => {
    analytics.trackArchiveActionSubmitted(3);
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: archive_action_submitted",
      "(value: 3)",
    );
  });

  it("trackDeleteActionSubmitted passes correct event name and count", () => {
    analytics.trackDeleteActionSubmitted(5);
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: delete_action_submitted",
      "(value: 5)",
    );
  });

  it("trackGetStartedClick passes correct event name", () => {
    analytics.trackGetStartedClick();
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: get_started_click",
      "",
    );
  });

  it("trackRepoArchived passes correct event name and value 1", () => {
    analytics.trackRepoArchived();
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: repo_archived",
      "(value: 1)",
    );
  });

  it("trackRepoDeleted passes correct event name and value 1", () => {
    analytics.trackRepoDeleted();
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: repo_deleted",
      "(value: 1)",
    );
  });

  it("trackTokenValidated passes correct event name", () => {
    analytics.trackTokenValidated();
    expect(debug.log).toHaveBeenCalledWith(
      "[DEV] Would track event: token_validated",
      "",
    );
  });
});
