import { type ErrorEvent } from "@sentry/react";
import { describe, expect, it } from "vitest";

import { sentryBeforeSend } from "./utils/sentry-before-send";

const FAKE_GHP = "ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789";
const FAKE_PAT =
  "github_pat_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";

function createEvent(overrides: Omit<ErrorEvent, "type"> = {}): ErrorEvent {
  return { type: undefined, ...overrides };
}

describe("sentryBeforeSend", () => {
  it("returns the event (never drops it)", () => {
    const event = createEvent({ message: "hello" });
    expect(sentryBeforeSend(event)).toBe(event);
  });

  it("deletes user.ip_address", () => {
    const event = createEvent({
      user: { id: "u1", ip_address: "1.2.3.4" },
    });
    const result = sentryBeforeSend(event);
    expect(result.user?.ip_address).toBeUndefined();
    expect(result.user?.id).toBe("u1");
  });

  it("deletes sensitive request headers", () => {
    const event = createEvent({
      request: {
        headers: {
          Authorization: "Bearer secret",
          "Content-Type": "application/json",
          Cookie: "session=abc",
          "X-Auth-Token": "xyz",
        },
      },
    });
    const result = sentryBeforeSend(event);
    expect(result.request?.headers?.Authorization).toBeUndefined();
    expect(result.request?.headers?.Cookie).toBeUndefined();
    expect(result.request?.headers?.["X-Auth-Token"]).toBeUndefined();
    expect(result.request?.headers?.["Content-Type"]).toBe("application/json");
  });

  it("scrubs token from event.message", () => {
    const event = createEvent({
      message: `Error with token ${FAKE_GHP} in request`,
    });
    const result = sentryBeforeSend(event);
    expect(result.message).not.toContain(FAKE_GHP);
    expect(result.message).toContain("[REDACTED]");
  });

  it("scrubs token from exception values", () => {
    const event = createEvent({
      exception: {
        values: [
          {
            type: "Error",
            value: `Auth failed: ${FAKE_PAT}`,
          },
        ],
      },
    });
    const result = sentryBeforeSend(event);
    expect(result.exception?.values?.[0]?.value).not.toContain(FAKE_PAT);
    expect(result.exception?.values?.[0]?.value).toContain("[REDACTED]");
  });

  it("scrubs tokens from stacktrace frame vars", () => {
    const event = createEvent({
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  filename: "app.js",
                  vars: {
                    count: 42,
                    safe: "no-token-here",
                    token: FAKE_GHP,
                  },
                },
              ],
            },
            type: "Error",
            value: "crash",
          },
        ],
      },
    });
    const result = sentryBeforeSend(event);
    const vars = result.exception?.values?.[0]?.stacktrace?.frames?.[0]?.vars;
    expect(vars?.token).not.toContain(FAKE_GHP);
    expect(vars?.token).toContain("[REDACTED]");
    expect(vars?.count).toBe(42);
    expect(vars?.safe).toBe("no-token-here");
  });

  it("scrubs token from breadcrumb messages", () => {
    const event = createEvent({
      breadcrumbs: [
        { category: "http", message: `Fetching with ${FAKE_GHP}` },
        { category: "ui", message: "Safe breadcrumb" },
      ],
    });
    const result = sentryBeforeSend(event);
    expect(result.breadcrumbs?.[0]?.message).not.toContain(FAKE_GHP);
    expect(result.breadcrumbs?.[0]?.message).toContain("[REDACTED]");
    expect(result.breadcrumbs?.[1]?.message).toBe("Safe breadcrumb");
  });

  it("scrubs tokens from breadcrumb data values", () => {
    const event = createEvent({
      breadcrumbs: [
        {
          category: "http",
          data: {
            auth: `Bearer ${FAKE_GHP}`,
            status: 200,
            url: "https://api.github.com/user",
          },
        },
      ],
    });
    const result = sentryBeforeSend(event);
    const data = result.breadcrumbs?.[0]?.data;
    expect(data?.auth).not.toContain(FAKE_GHP);
    expect(data?.auth).toContain("[REDACTED]");
    expect(data?.url).toBe("https://api.github.com/user");
    expect(data?.status).toBe(200);
  });

  it("handles event with no optional fields", () => {
    const event = createEvent();
    const result = sentryBeforeSend(event);
    expect(result).toEqual({ type: undefined });
  });

  it("handles event with empty exception values array", () => {
    const event = createEvent({ exception: { values: [] } });
    const result = sentryBeforeSend(event);
    expect(result.exception?.values).toEqual([]);
  });

  it("handles event with empty breadcrumbs array", () => {
    const event = createEvent({ breadcrumbs: [] });
    const result = sentryBeforeSend(event);
    expect(result.breadcrumbs).toEqual([]);
  });

  it("scrubs tokens from event.tags", () => {
    const event = createEvent({
      tags: {
        environment: "production",
        auth: `token: ${FAKE_GHP}`,
        version: "1.0.0",
      },
    });
    const result = sentryBeforeSend(event);
    expect(result.tags?.auth).not.toContain(FAKE_GHP);
    expect(result.tags?.auth).toContain("[REDACTED]");
    expect(result.tags?.environment).toBe("production");
    expect(result.tags?.version).toBe("1.0.0");
  });

  it("scrubs tokens from event.extra (flat values)", () => {
    const event = createEvent({
      extra: {
        apiToken: FAKE_PAT,
        count: 5,
        safe: "no-secrets",
      },
    });
    const result = sentryBeforeSend(event);
    expect(result.extra?.apiToken).not.toContain(FAKE_PAT);
    expect(result.extra?.apiToken).toContain("[REDACTED]");
    expect(result.extra?.count).toBe(5);
    expect(result.extra?.safe).toBe("no-secrets");
  });

  it("scrubs tokens from event.extra (nested objects)", () => {
    const event = createEvent({
      extra: {
        request: {
          headers: { authorization: `Bearer ${FAKE_GHP}` },
          url: "https://api.github.com/user",
        },
      },
    });
    const result = sentryBeforeSend(event);
    const request = result.extra?.request as Record<string, unknown>;
    const headers = request.headers as Record<string, unknown>;
    expect(headers.authorization).not.toContain(FAKE_GHP);
    expect(headers.authorization).toContain("[REDACTED]");
    expect(request.url).toBe("https://api.github.com/user");
  });

  it("scrubs tokens from event.contexts", () => {
    const event = createEvent({
      contexts: {
        app: { app_name: "repo-remover", token: FAKE_GHP },
        browser: { name: "Chrome", version: "120" },
      },
    });
    const result = sentryBeforeSend(event);
    const app = result.contexts?.app as Record<string, unknown>;
    expect(app.token).not.toContain(FAKE_GHP);
    expect(app.token).toContain("[REDACTED]");
    expect(app.app_name).toBe("repo-remover");
    const browser = result.contexts?.browser as Record<string, unknown>;
    expect(browser.name).toBe("Chrome");
    expect(browser.version).toBe("120");
  });

  it("scrubs tokens from deeply nested contexts", () => {
    const event = createEvent({
      contexts: {
        custom: {
          level1: {
            level2: `secret ${FAKE_PAT} here`,
          },
        },
      },
    });
    const result = sentryBeforeSend(event);
    const custom = result.contexts?.custom as Record<string, unknown>;
    const level1 = custom.level1 as Record<string, unknown>;
    expect(level1.level2).not.toContain(FAKE_PAT);
    expect(level1.level2).toContain("[REDACTED]");
  });

  it("preserves non-string values in extra and contexts", () => {
    const event = createEvent({
      extra: {
        arr: [1, 2, 3],
        flag: true,
        num: 42,
        nothing: null,
      },
      contexts: {
        metrics: { count: 10, enabled: true },
      },
    });
    const result = sentryBeforeSend(event);
    expect(result.extra?.arr).toEqual([1, 2, 3]);
    expect(result.extra?.flag).toBe(true);
    expect(result.extra?.num).toBe(42);
    expect(result.extra?.nothing).toBeNull();
    const metrics = result.contexts?.metrics as Record<string, unknown>;
    expect(metrics.count).toBe(10);
    expect(metrics.enabled).toBe(true);
  });
});
