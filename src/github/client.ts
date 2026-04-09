/**
 * Octokit client factory with rate-limit throttling and GraphQL pagination.
 */
import { paginateGraphQL } from "@octokit/plugin-paginate-graphql";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";

import { debug } from "@/utils/debug";

export const ThrottledOctokit = Octokit.plugin(throttling, paginateGraphQL);

export type ThrottledOctokitType = InstanceType<typeof ThrottledOctokit>;

/**
 * Validates a GitHub Personal Access Token format.
 * Supports fine-grained tokens (github_pat_) and classic tokens (ghp_, gho_, ghu_, ghs_, ghr_).
 * See: https://github.blog/changelog/2021-03-31-authentication-token-format-updates-are-generally-available/
 */
export function isValidGitHubToken(token: string): boolean {
  if (!token) return false;

  if (token.startsWith("github_pat_")) {
    const payload = token.slice(11);
    return (
      token.length >= 72 &&
      /^[a-zA-Z0-9_]+$/.test(payload) &&
      /[a-zA-Z0-9]/.test(payload)
    );
  }

  const standardPrefixes = ["ghp_", "gho_", "ghu_", "ghs_", "ghr_"];
  const matchedPrefix = standardPrefixes.find((prefix) =>
    token.startsWith(prefix),
  );

  if (!matchedPrefix) return false;
  if (token.length !== 40) return false;

  return /^[a-zA-Z0-9]+$/.test(token.slice(matchedPrefix.length));
}

/** Creates an Octokit instance with rate-limit throttling (retries once) and GraphQL pagination. */
export function createThrottledOctokit(
  token: string,
): InstanceType<typeof ThrottledOctokit> {
  return new ThrottledOctokit({
    auth: token,
    throttle: {
      onRateLimit: (_retryAfter, _options, _octokitInstance, retryCount) => {
        if (retryCount < 1) {
          debug.log("[Throttle] Rate limited - retrying once");
          return true;
        }
        debug.log("[Throttle] Rate limited - giving up");
        return false;
      },
      onSecondaryRateLimit: () => {
        debug.log("[Throttle] Secondary rate limit detected - not retrying");
        return false;
      },
    },
  });
}
