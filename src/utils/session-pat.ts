/**
 * Session-only PAT storage for users who opt out of "Remember my token".
 *
 * Lives in `sessionStorage` so it survives in-tab navigation (matching the
 * pre-refactor tab-lifetime semantics of the root-level GitHub data provider)
 * but dies when the tab closes. Encryption would add no real protection here:
 * the value sits in memory anyway and `secureStorage`'s key is derived from a
 * same-origin browser fingerprint, so any JS that could read one could read
 * the other.
 */

const SESSION_PAT_KEY = "session_pat";

export const sessionPat = {
  get(): null | string {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(SESSION_PAT_KEY);
    } catch {
      return null;
    }
  },

  has(): boolean {
    return sessionPat.get() !== null;
  },

  remove(): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(SESSION_PAT_KEY);
    } catch {
      // sessionStorage can throw in private-mode Safari; swallow.
    }
  },

  set(value: string): void {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SESSION_PAT_KEY, value);
  },
};
