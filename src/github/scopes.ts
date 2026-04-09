import { debug } from "@/utils/debug";

import { type ThrottledOctokitType } from "./client";
import { type ScopeCheckResult } from "./types";

const REQUIRED_SCOPES = ["repo", "delete_repo", "read:org"] as const;

const SCOPE_SATISFIED_BY: Record<string, string[]> = {
  delete_repo: ["delete_repo"],
  "read:org": ["read:org", "write:org", "admin:org"],
  repo: ["repo"],
};

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  delete_repo: "you won't be able to delete repositories",
  "read:org": "organization repositories won't be visible",
  repo: "private repositories won't be visible",
};

/**
 * Checks what OAuth scopes the token has been granted by inspecting
 * the X-OAuth-Scopes response header from a lightweight REST call.
 * Returns empty arrays for fine-grained tokens (which don't use OAuth scopes).
 */
export async function checkTokenScopes(
  octokit: ThrottledOctokitType,
): Promise<ScopeCheckResult> {
  try {
    const response = await octokit.request("GET /rate_limit");
    const scopeHeader = response.headers["x-oauth-scopes"];

    if (scopeHeader == null) {
      return { grantedScopes: [], missingScopes: [] };
    }

    if (!scopeHeader.trim()) {
      return { grantedScopes: [], missingScopes: [...REQUIRED_SCOPES] };
    }

    const grantedScopes = scopeHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const missingScopes = REQUIRED_SCOPES.filter((required) => {
      const satisfiedBy = SCOPE_SATISFIED_BY[required] ?? [required];
      return !satisfiedBy.some((scope) => grantedScopes.includes(scope));
    });

    return { grantedScopes, missingScopes };
  } catch {
    debug.warn("Could not check token scopes");
    return { grantedScopes: [], missingScopes: [] };
  }
}

function buildScopeWarnings(missingScopes: string[]): string[] {
  return missingScopes
    .map((scope) => {
      const desc = SCOPE_DESCRIPTIONS[scope];
      return desc ? `Missing ${scope} scope — ${desc}.` : null;
    })
    .filter((w): w is string => w !== null);
}

export function combineWarnings(
  scopeResult: ScopeCheckResult,
  permissionError: null | string,
  scopeLimitedOrgs: string[],
): string | undefined {
  const warnings: string[] = [];

  warnings.push(...buildScopeWarnings(scopeResult.missingScopes));

  if (!scopeResult.missingScopes.includes("read:org")) {
    if (permissionError) {
      warnings.push(permissionError);
    } else if (scopeLimitedOrgs.length > 0) {
      warnings.push(
        `Token lacks required scopes to access repos in: ${scopeLimitedOrgs.join(", ")}.`,
      );
    }
  }

  return warnings.length > 0 ? warnings.join("\n\n") : undefined;
}
