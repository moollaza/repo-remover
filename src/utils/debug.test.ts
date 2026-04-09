import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debug } from "./debug";

describe("debug.sanitize", () => {
  it("sanitizes GitHub PAT tokens in strings", () => {
    expect(debug.sanitize("token ghp_abc123XYZ")).toBe("token [REDACTED]");
    expect(debug.sanitize("github_pat_abc123_xyz")).toBe("[REDACTED]");
    expect(debug.sanitize("Bearer ghp_abc123")).toBe("Bearer [REDACTED]");
  });

  it("sanitizes sensitive keys in objects", () => {
    const result = debug.sanitize({ name: "test", token: "ghp_secret" });
    expect(result).toEqual({ name: "test", token: "[REDACTED]" });
  });

  it("preserves Error message and name after sanitization", () => {
    const err = new Error("Something failed with ghp_abc123");
    const result = debug.sanitize(err) as Record<string, unknown>;

    expect(result).toHaveProperty("name", "Error");
    expect(result).toHaveProperty("message");
    // The token in the message should be redacted
    expect(result.message).toBe("Something failed with [REDACTED]");
  });

  it("handles Error subclasses", () => {
    const err = new TypeError("bad type ghp_abc123");
    const result = debug.sanitize(err) as Record<string, unknown>;

    expect(result).toHaveProperty("name", "TypeError");
    expect(result).toHaveProperty("message", "bad type [REDACTED]");
  });

  it("returns primitives unchanged", () => {
    expect(debug.sanitize(42)).toBe(42);
    expect(debug.sanitize(null)).toBe(null);
    expect(debug.sanitize(undefined)).toBe(undefined);
    expect(debug.sanitize(true)).toBe(true);
  });

  it("sanitizes arrays recursively", () => {
    const result = debug.sanitize(["ghp_abc123", "safe"]);
    expect(result).toEqual(["[REDACTED]", "safe"]);
  });

  it("sanitizes nested objects recursively", () => {
    const result = debug.sanitize({
      outer: { apiKey: "secret", data: "ghp_abc123" },
    });
    expect(result).toEqual({
      outer: { apiKey: "[REDACTED]", data: "[REDACTED]" },
    });
  });

  it("does not redact innocuous keys that happen to contain 'key' substring", () => {
    const result = debug.sanitize({
      hotkey: "ctrl+c",
      jockey: "rider",
      keyboard: "qwerty",
      monkey: "banana",
    });
    expect(result).toEqual({
      hotkey: "ctrl+c",
      jockey: "rider",
      keyboard: "qwerty",
      monkey: "banana",
    });
  });

  it("redacts actual sensitive key-related fields", () => {
    const result = debug.sanitize({
      access_key: "access-456",
      accessKey: "access-123",
      api_key: "my-key",
      apiKey: "my-api-key",
      key: "secret-value",
      private_key: "priv-012",
      privateKey: "priv-789",
    });
    expect(result).toEqual({
      access_key: "[REDACTED]",
      accessKey: "[REDACTED]",
      api_key: "[REDACTED]",
      apiKey: "[REDACTED]",
      key: "[REDACTED]",
      private_key: "[REDACTED]",
      privateKey: "[REDACTED]",
    });
  });

  it("handles circular references without stack overflow", () => {
    const obj: Record<string, unknown> = { name: "test" };
    obj.self = obj;
    const result = debug.sanitize(obj) as Record<string, unknown>;
    expect(result).toEqual({ name: "test", self: "[Circular]" });
  });

  it("handles deeply nested circular references", () => {
    const a: Record<string, unknown> = { id: "a" };
    const b: Record<string, unknown> = { id: "b", parent: a };
    a.child = b;
    const result = debug.sanitize(a) as Record<string, unknown>;
    expect(result).toEqual({
      child: { id: "b", parent: "[Circular]" },
      id: "a",
    });
  });

  it("handles arrays with circular references", () => {
    const arr: unknown[] = [1, 2];
    arr.push(arr);
    const result = debug.sanitize(arr) as unknown[];
    expect(result).toEqual([1, 2, "[Circular]"]);
  });
});

describe("debug.error", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation((() => undefined) as typeof console.error);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("logs Error objects with preserved message", () => {
    const err = new Error("request failed ghp_abc123");
    debug.error("oops", err);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[ERROR] oops",
      expect.objectContaining({
        message: "request failed [REDACTED]",
        name: "Error",
      }),
    );
  });
});

describe("production mode suppression", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let groupSpy: ReturnType<typeof vi.spyOn>;
  let groupCollapsedSpy: ReturnType<typeof vi.spyOn>;
  let groupEndSpy: ReturnType<typeof vi.spyOn>;
  let tableSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi
      .spyOn(console, "log")
      .mockImplementation((() => undefined) as typeof console.log);
    warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation((() => undefined) as typeof console.warn);
    errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((() => undefined) as typeof console.error);
    groupSpy = vi
      .spyOn(console, "group")
      .mockImplementation((() => undefined) as typeof console.group);
    groupCollapsedSpy = vi
      .spyOn(console, "groupCollapsed")
      .mockImplementation((() => undefined) as typeof console.groupCollapsed);
    groupEndSpy = vi
      .spyOn(console, "groupEnd")
      .mockImplementation((() => undefined) as typeof console.groupEnd);
    tableSpy = vi
      .spyOn(console, "table")
      .mockImplementation((() => undefined) as typeof console.table);
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    groupSpy.mockRestore();
    groupCollapsedSpy.mockRestore();
    groupEndSpy.mockRestore();
    tableSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("log, warn, group, groupEnd, table are suppressed in production", async () => {
    vi.resetModules();
    vi.stubEnv("DEV", false);

    const { debug: prodDebug } = await import("./debug");

    prodDebug.log("should not appear");
    prodDebug.warn("should not appear");
    prodDebug.group("should not appear");
    prodDebug.group("should not appear", true);
    prodDebug.groupEnd();
    prodDebug.table([{ a: 1 }]);

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(groupSpy).not.toHaveBeenCalled();
    expect(groupCollapsedSpy).not.toHaveBeenCalled();
    expect(groupEndSpy).not.toHaveBeenCalled();
    expect(tableSpy).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
  });

  it("error always fires regardless of isDevelopment", async () => {
    vi.resetModules();
    vi.stubEnv("DEV", false);

    const { debug: prodDebug } = await import("./debug");

    prodDebug.error("critical failure");

    expect(errorSpy).toHaveBeenCalledWith("[ERROR] critical failure");

    vi.unstubAllEnvs();
  });

  it("error sanitizes data even in production", async () => {
    vi.resetModules();
    vi.stubEnv("DEV", false);

    const { debug: prodDebug } = await import("./debug");

    prodDebug.error("leak", "ghp_secrettoken123");

    expect(errorSpy).toHaveBeenCalledWith("[ERROR] leak", "[REDACTED]");

    vi.unstubAllEnvs();
  });

  it("log and warn fire in development mode", () => {
    // In test environment, import.meta.env.DEV is true
    debug.log("dev message");
    debug.warn("dev warning");

    expect(logSpy).toHaveBeenCalledWith("[DEBUG] dev message");
    expect(warnSpy).toHaveBeenCalledWith("[WARN] dev warning");
  });

  it("group and groupCollapsed fire in development mode", () => {
    debug.group("open group");
    debug.group("collapsed group", true);
    debug.groupEnd();

    expect(groupSpy).toHaveBeenCalledWith("[DEBUG] open group");
    expect(groupCollapsedSpy).toHaveBeenCalledWith("[DEBUG] collapsed group");
    expect(groupEndSpy).toHaveBeenCalledTimes(1);
  });

  it("table fires in development mode", () => {
    debug.table([{ x: 1 }]);
    expect(tableSpy).toHaveBeenCalled();
  });
});
