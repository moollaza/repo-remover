/**
 * Shared token sanitization patterns and utility.
 *
 * Used by both Sentry (main.tsx) and the debug utility (debug.ts)
 * to ensure consistent redaction of GitHub tokens and credentials.
 */

/**
 * Patterns to detect and sanitize sensitive data.
 * All patterns use the `gi` flag for case-insensitive, global matching.
 */
export const SENSITIVE_PATTERNS: readonly RegExp[] = [
  /github_pat_[a-zA-Z0-9_]+/gi, // Fine-grained PATs
  /gh[porus]_[a-zA-Z0-9]+/gi, // Standard GitHub tokens (ghp_, gho_, ghr_, ghu_, ghs_)
  /Bearer\s+[a-zA-Z0-9_.-]+/gi, // Bearer tokens
  /token[:\s]+[a-zA-Z0-9_-]+/gi, // Generic token patterns
] as const;

/**
 * Sanitize a string by redacting all token-like patterns.
 * @param text - The text to sanitize
 * @param replacement - The replacement string (default: "[REDACTED]")
 * @returns Sanitized text with tokens replaced
 */
export function sanitizeTokens(
  text: string,
  replacement = "[REDACTED]",
): string {
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}
