import { useEffect, useState } from "react";

import { secureStorage } from "@/utils/secure-storage";

/**
 * Lightweight check for whether a stored PAT exists. Used on marketing
 * surfaces (e.g. the landing-page header) that should react to the user's
 * auth state without loading the full GitHub data provider.
 *
 * - Fast path: `secureStorage.hasItem("pat")` returns synchronously from
 *   localStorage so the first render already reflects the correct state.
 * - Reconciliation: an async `getItem("pat")` verifies the stored blob can
 *   actually be decrypted with the current browser fingerprint. If decryption
 *   fails, `secureStorage.getItem` removes the key and we drop presence to
 *   false so stale/corrupt tokens don't show a phantom "Dashboard" CTA.
 */
export function useStoredPatPresence(): boolean {
  const [hasPat, setHasPat] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return secureStorage.hasItem("pat");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
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
