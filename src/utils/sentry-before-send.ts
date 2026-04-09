import { type ErrorEvent } from "@sentry/react";

import { sanitizeTokens } from "./sanitize-tokens";

/** Recursively scrub string values in a record. Non-string leaves are untouched. */
function scrubRecord(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      result[key] = sanitizeTokens(val);
    } else if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      result[key] = scrubRecord(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/** Scrub GitHub tokens and PII from Sentry events before transmission. */
export function sentryBeforeSend(event: ErrorEvent): ErrorEvent {
  if (event.user?.ip_address) {
    delete event.user.ip_address;
  }
  if (event.request?.headers) {
    delete event.request.headers.Authorization;
    delete event.request.headers.Cookie;
    delete event.request.headers["X-Auth-Token"];
  }
  if (event.message) {
    event.message = sanitizeTokens(event.message);
  }
  if (event.exception?.values) {
    event.exception.values.forEach((exception) => {
      if (exception.value) {
        exception.value = sanitizeTokens(exception.value);
      }
      if (exception.stacktrace?.frames) {
        exception.stacktrace.frames.forEach((frame) => {
          if (frame.vars) {
            Object.keys(frame.vars).forEach((key) => {
              if (typeof frame.vars![key] === "string") {
                frame.vars![key] = sanitizeTokens(frame.vars![key]);
              }
            });
          }
        });
      }
    });
  }
  if (event.breadcrumbs) {
    event.breadcrumbs.forEach((breadcrumb) => {
      if (breadcrumb.message) {
        breadcrumb.message = sanitizeTokens(breadcrumb.message);
      }
      if (breadcrumb.data) {
        Object.keys(breadcrumb.data).forEach((key) => {
          if (typeof breadcrumb.data![key] === "string") {
            breadcrumb.data![key] = sanitizeTokens(breadcrumb.data![key]);
          }
        });
      }
    });
  }
  if (event.tags) {
    event.tags = scrubRecord(event.tags as Record<string, unknown>) as Record<
      string,
      string
    >;
  }
  if (event.extra) {
    event.extra = scrubRecord(event.extra as Record<string, unknown>);
  }
  if (event.contexts) {
    event.contexts = scrubRecord(
      event.contexts as Record<string, unknown>,
    ) as ErrorEvent["contexts"];
  }
  return event;
}
