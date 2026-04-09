import { describe, expect, it } from "vitest";

import { sanitizeTokens, SENSITIVE_PATTERNS } from "./sanitize-tokens";

describe("sanitizeTokens", () => {
  describe("GitHub classic PATs (ghp_)", () => {
    it("redacts standard 36-char ghp_ tokens", () => {
      const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh";
      expect(sanitizeTokens(`Error with ${token}`)).toBe(
        "Error with [REDACTED]",
      );
    });

    it("redacts ghp_ tokens longer than 36 chars", () => {
      const token = "ghp_" + "a".repeat(50);
      expect(sanitizeTokens(`Token: ${token}`)).toBe("Token: [REDACTED]");
    });

    it("redacts ghp_ tokens shorter than 36 chars", () => {
      const token = "ghp_abc123";
      expect(sanitizeTokens(`Token: ${token}`)).toBe("Token: [REDACTED]");
    });
  });

  describe("GitHub fine-grained PATs (github_pat_)", () => {
    it("redacts github_pat_ tokens", () => {
      const token = "github_pat_11ABCDEF_abcdef1234567890abcdef1234567890";
      expect(sanitizeTokens(`Auth: ${token}`)).toBe("Auth: [REDACTED]");
    });

    it("redacts github_pat_ tokens with underscores in payload", () => {
      const token = "github_pat_AA_bb_CC";
      expect(sanitizeTokens(token)).toBe("[REDACTED]");
    });
  });

  describe("other GitHub token prefixes (gho_, ghr_, ghu_, ghs_)", () => {
    it("redacts gho_ (OAuth) tokens", () => {
      expect(sanitizeTokens("gho_abc123XYZ")).toBe("[REDACTED]");
    });

    it("redacts ghr_ (refresh) tokens", () => {
      expect(sanitizeTokens("ghr_abc123XYZ")).toBe("[REDACTED]");
    });

    it("redacts ghu_ (user-to-server) tokens", () => {
      expect(sanitizeTokens("ghu_abc123XYZ")).toBe("[REDACTED]");
    });

    it("redacts ghs_ (server-to-server) tokens", () => {
      expect(sanitizeTokens("ghs_abc123XYZ")).toBe("[REDACTED]");
    });
  });

  describe("Bearer tokens", () => {
    it("redacts Bearer tokens", () => {
      expect(sanitizeTokens("Authorization: Bearer sometoken123")).toBe(
        "Authorization: [REDACTED]",
      );
    });

    it("redacts Bearer with dots and dashes", () => {
      expect(sanitizeTokens("Bearer eyJ0eXAi.abc-def")).toBe("[REDACTED]");
    });
  });

  describe("generic token patterns", () => {
    it("redacts token: value patterns", () => {
      expect(sanitizeTokens("token: abc123")).toBe("[REDACTED]");
    });

    it("redacts token value patterns with space", () => {
      expect(sanitizeTokens("token abc123")).toBe("[REDACTED]");
    });
  });

  describe("case insensitivity", () => {
    it("redacts uppercase GHP_ tokens", () => {
      expect(sanitizeTokens("GHP_ABC123")).toBe("[REDACTED]");
    });

    it("redacts mixed-case BEARER tokens", () => {
      // Case-insensitive: BEARER matches the Bearer pattern fully
      expect(sanitizeTokens("BEARER abc123")).toBe("[REDACTED]");
    });
  });

  describe("custom replacement", () => {
    it("uses custom replacement string", () => {
      expect(sanitizeTokens("ghp_abc123", "[REDACTED_PAT]")).toBe(
        "[REDACTED_PAT]",
      );
    });
  });

  describe("edge cases", () => {
    it("leaves non-sensitive text unchanged", () => {
      expect(sanitizeTokens("normal log message")).toBe("normal log message");
    });

    it("handles empty string", () => {
      expect(sanitizeTokens("")).toBe("");
    });

    it("redacts multiple tokens in one string", () => {
      const text = "ghp_abc123 and github_pat_def456";
      const result = sanitizeTokens(text);
      expect(result).toBe("[REDACTED] and [REDACTED]");
    });
  });
});

describe("SENSITIVE_PATTERNS", () => {
  it("exports patterns array", () => {
    expect(SENSITIVE_PATTERNS).toBeInstanceOf(Array);
    expect(SENSITIVE_PATTERNS.length).toBeGreaterThan(0);
  });

  it("all patterns have global and case-insensitive flags", () => {
    for (const pattern of SENSITIVE_PATTERNS) {
      expect(pattern.flags).toContain("g");
      expect(pattern.flags).toContain("i");
    }
  });
});
