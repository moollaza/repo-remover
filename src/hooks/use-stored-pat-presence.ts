import { useEffect, useState } from "react";

import { secureStorage } from "@/utils/secure-storage";
import { sessionPat } from "@/utils/session-pat";

/**
 * Lightweight check for whether the user has a usable PAT available. Used on
 * marketing surfaces (e.g. the landing-page header) that must react to auth
 * state without loading the full GitHub data provider.
 *
 * Checks both stores that the PAT form writes to:
 *  - `sessionStorage` (session-only, when "Remember my token" is off)
 *  - `localStorage` via `secureStorage` (persistent, when "Remember" is on)
 *
 * - Fast path: synchronous presence check so the first render already has
 *   the correct state — no flicker for the common returning-user case.
 * - Reconciliation: an async `secureStorage.getItem("pat")` verifies the
 *   persisted blob can still be decrypted with the current browser
 *   fingerprint. If decryption fails, `getItem` clears the key and we
 *   recompute presence so a stale token does not show a phantom dashboard
 *   CTA.
 */
export function useStoredPatPresence(): boolean {
  const [hasPat, setHasPat] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionPat.has() || secureStorage.hasItem("pat");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (sessionPat.has()) {
        if (!cancelled) setHasPat(true);
        return;
      }
      try {
        const stored = await secureStorage.getItem("pat");
        if (cancelled) return;
        setHasPat(Boolean(stored));
      } catch {
        if (cancelled) return;
        setHasPat(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return hasPat;
}
