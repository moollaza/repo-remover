/**
 * Debug Utility
 *
 * Production-safe logging utility that:
 * - Only logs in development environments
 * - Sanitizes sensitive data (tokens, credentials)
 * - Provides consistent logging interface across the application
 */

import { SENSITIVE_PATTERNS } from "./sanitize-tokens";

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Log an error message
 * Note: Error logs are shown in all environments, but sanitized
 * @param message - The error message to log
 * @param data - Optional data to log with the error
 */
function error(message: string, ...data: unknown[]): void {
  console.error(`[ERROR] ${message}`, ...data.map(sanitize));
}

/**
 * Log a grouped console output (only in development)
 * @param label - The group label
 * @param collapsed - Whether the group should start collapsed
 */
function group(label: string, collapsed = false): void {
  if (!isDevelopment) return;

  if (collapsed) {
    console.groupCollapsed(`[DEBUG] ${label}`);
  } else {
    console.group(`[DEBUG] ${label}`);
  }
}

/**
 * End a grouped console output (only in development)
 */
function groupEnd(): void {
  if (!isDevelopment) return;

  console.groupEnd();
}

/**
 * Log a debug message (only in development)
 * @param message - The message to log
 * @param data - Optional data to log with the message
 */
function log(message: string, ...data: unknown[]): void {
  if (!isDevelopment) return;

  console.log(`[DEBUG] ${message}`, ...data.map(sanitize));
}

/**
 * Sanitize a value by redacting sensitive information
 * @param value - The value to sanitize (string, object, or other)
 * @returns Sanitized value safe for logging
 */
function sanitize(value: unknown): unknown {
  return sanitizeInner(value, new WeakSet<object>());
}

function sanitizeInner(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    return sanitized;
  }

  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeInner(item, seen));
    }

    if (value instanceof Error) {
      return {
        message: sanitizeInner(value.message, seen) as string,
        name: value.name,
      };
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Redact known sensitive keys entirely
      // Use case-sensitive endsWith("Key") for camelCase (apiKey, accessKey)
      // and case-insensitive for exact "key" and snake_case "_key" variants
      const lk = key.toLowerCase();
      if (
        lk.includes("token") ||
        lk.includes("password") ||
        lk.includes("secret") ||
        lk === "key" ||
        key.endsWith("Key") ||
        lk.endsWith("_key")
      ) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeInner(val, seen);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Log a table (only in development)
 * @param data - The data to display as a table
 */
function table(data: unknown): void {
  if (!isDevelopment) return;
  try {
    console.table(sanitize(data));
  } catch {
    // Fallback for environments where console.table fails (e.g. jsdom)

    console.log(sanitize(data));
  }
}

/**
 * Log a warning message (only in development)
 * @param message - The warning message to log
 * @param data - Optional data to log with the warning
 */
function warn(message: string, ...data: unknown[]): void {
  if (!isDevelopment) return;

  console.warn(`[WARN] ${message}`, ...data.map(sanitize));
}

/**
 * Debug utility object with all logging methods
 */
export const debug = {
  error,
  group,
  groupEnd,
  log,
  sanitize,
  table,
  warn,
} as const;
