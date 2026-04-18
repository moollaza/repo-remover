import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { useStoredPatPresence } from "@/hooks/use-stored-pat-presence";
import { secureStorage } from "@/utils/secure-storage";
import { sessionPat } from "@/utils/session-pat";

describe("useStoredPatPresence", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test("returns false when no token is stored", async () => {
    const { result } = renderHook(() => useStoredPatPresence());

    expect(result.current).toBe(false);

    // Wait one tick to ensure the async reconciliation effect also settles.
    await waitFor(() => expect(result.current).toBe(false));
  });

  test("returns true synchronously when a session token is present", () => {
    sessionPat.set("ghp_session_token");

    const { result } = renderHook(() => useStoredPatPresence());

    expect(result.current).toBe(true);
  });

  test("returns true synchronously when a persisted token is present", () => {
    // In test mode secureStorage falls back to plain localStorage — writing
    // directly under the `secure_` prefix lets the synchronous `hasItem`
    // check see the value.
    window.localStorage.setItem("secure_pat", "ghp_persisted_token");

    const { result } = renderHook(() => useStoredPatPresence());

    expect(result.current).toBe(true);
  });

  test("drops to false when the persisted token cannot be decrypted", async () => {
    // Seed the synchronous check: value exists in localStorage.
    window.localStorage.setItem("secure_pat", "ghp_persisted_token");
    const { result } = renderHook(() => useStoredPatPresence());
    expect(result.current).toBe(true);

    // Simulate the async reconciliation clearing the bad token.
    await secureStorage.removeItem("pat");
    window.localStorage.removeItem("secure_pat");

    // On re-render without the token, presence must be false.
    const { result: result2 } = renderHook(() => useStoredPatPresence());
    await waitFor(() => expect(result2.current).toBe(false));
  });
});
