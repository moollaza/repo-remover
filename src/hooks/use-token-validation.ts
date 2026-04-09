import { RequestError } from "@octokit/request-error";
import { useEffect, useRef, useState } from "react";

import { analytics } from "@/utils/analytics";
import { createThrottledOctokit, isValidGitHubToken } from "@/github/client";
import { checkTokenScopes, SCOPE_DESCRIPTIONS } from "@/github/scopes";

export interface TokenValidationResult {
  error: null | string;
  isValid: boolean;
  isValidating: boolean;
  scopeWarnings: string[];
  username: null | string;
}

/**
 * Debounced token validation hook.
 * Validates format locally, then checks against GitHub API (auth + scopes) after 500ms.
 */
export function useTokenValidation(token: string): TokenValidationResult {
  const [error, setError] = useState<null | string>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [username, setUsername] = useState<null | string>(null);
  const [scopeWarnings, setScopeWarnings] = useState<string[]>([]);
  const lastValidatedTokenRef = useRef<null | string>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setIsValid(false);
      setUsername(null);
      setError(null);
      setScopeWarnings([]);
      lastValidatedTokenRef.current = null;
      return;
    }

    if (!isValidGitHubToken(token)) {
      setIsValid(false);
      setUsername(null);
      setScopeWarnings([]);
      return;
    }

    // Skip re-validation if we already validated this exact token
    if (token === lastValidatedTokenRef.current) {
      return;
    }

    setError(null);

    const timeoutId = setTimeout(() => {
      if (isMounted) setIsValidating(true);
      void (async () => {
        try {
          const octokit = createThrottledOctokit(token);
          const [{ data: userData }, scopeResult] = await Promise.all([
            octokit.rest.users.getAuthenticated(),
            checkTokenScopes(octokit),
          ]);

          if (isMounted) {
            setIsValid(true);
            setUsername(userData.login);
            lastValidatedTokenRef.current = token;

            const warnings = scopeResult.missingScopes
              .map((scope) => SCOPE_DESCRIPTIONS[scope])
              .filter(Boolean);
            setScopeWarnings(warnings);
          }
        } catch (err) {
          if (isMounted) {
            setIsValid(false);
            setUsername(null);
            setScopeWarnings([]);
            lastValidatedTokenRef.current = token;
            analytics.trackTokenFailed();

            const status = err instanceof RequestError ? err.status : undefined;

            if (status === 401) {
              setError("Invalid or expired token");
            } else if (status !== undefined && status >= 500) {
              setError("GitHub API is unavailable — please try again later");
            } else {
              setError(
                "GitHub API is unavailable — please check your connection",
              );
            }
          }
        } finally {
          if (isMounted) {
            setIsValidating(false);
          }
        }
      })();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [token]);

  return { error, isValid, isValidating, scopeWarnings, username };
}
