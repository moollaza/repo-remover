import { afterEach, describe, expect, test } from "vitest";

import { sessionPat } from "./session-pat";

describe("sessionPat", () => {
  afterEach(() => {
    sessionPat.remove();
  });

  test("set + get + has round-trip", () => {
    expect(sessionPat.has()).toBe(false);
    expect(sessionPat.get()).toBeNull();

    sessionPat.set("ghp_test_token");

    expect(sessionPat.has()).toBe(true);
    expect(sessionPat.get()).toBe("ghp_test_token");
  });

  test("remove clears the value", () => {
    sessionPat.set("ghp_test_token");
    sessionPat.remove();

    expect(sessionPat.has()).toBe(false);
    expect(sessionPat.get()).toBeNull();
  });

  test("writes to sessionStorage under session_pat key", () => {
    sessionPat.set("ghp_test_token");
    expect(window.sessionStorage.getItem("session_pat")).toBe("ghp_test_token");
  });
});
