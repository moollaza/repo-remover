import { Eye, EyeOff, Info, Key, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { isValidGitHubToken } from "@/github/client";
import { useTokenValidation } from "@/hooks/use-token-validation";
import { debug } from "@/utils/debug";
import { secureStorage } from "@/utils/secure-storage";
import { sessionPat } from "@/utils/session-pat";

/**
 * Interactive PAT form. Lazy-loaded so `/` does not ship Octokit or
 * token-validation code on initial navigation.
 *
 * Persistence model (mirrors the pre-refactor provider semantics):
 * - Remember ON  → encrypted PAT in `localStorage` via `secureStorage`.
 *                  Survives tab close.
 * - Remember OFF → PAT in `sessionStorage` via `sessionPat`. Survives in-tab
 *                  navigation (so the user can still return to `/` and back
 *                  to `/dashboard`) but dies when the tab closes.
 *
 * The dashboard-scoped `GitHubDataProvider` reads both stores on mount.
 */
export function GetStartedForm() {
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persistError, setPersistError] = useState<null | string>(null);
  const navigate = useNavigate();
  const { error, isValid, isValidating, scopeWarnings } =
    useTokenValidation(token);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isValidating || isSubmitting) return;

    setIsSubmitting(true);
    setPersistError(null);
    try {
      if (remember) {
        // Clear any prior session-only token so the two stores don't drift.
        sessionPat.remove();
        await secureStorage.setItem("pat", token);
      } else {
        // Clear any prior persisted token for the same reason.
        secureStorage.removeItem("pat");
        secureStorage.removeItem("login");
        sessionPat.set(token);
      }
    } catch (err) {
      debug.warn("Failed to persist PAT:", err);
      setPersistError(
        "We couldn't save your token locally. Please try again, or check that browser storage is enabled.",
      );
      setIsSubmitting(false);
      return;
    }

    void navigate("/dashboard");
  }

  const canSubmit = isValid && !isValidating && !isSubmitting;
  const formatError =
    token.length > 5 && !isValidGitHubToken(token)
      ? "Invalid token format"
      : null;
  const displayError = error ?? formatError;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400" />
        <Input
          autoComplete="off"
          className={`h-auto pl-10 pr-12 py-3 bg-default-100 text-sm font-mono placeholder:text-default-400 ${
            displayError
              ? "border-danger"
              : isValid
                ? "border-emerald-600"
                : "border-divider"
          }`}
          data-testid="github-token-input"
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          type={showToken ? "text" : "password"}
          data-1p-ignore
          data-lpignore="true"
          value={token}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {token && (
            <Button
              aria-label={showToken ? "Hide token" : "Show token"}
              className="text-default-400 hover:text-default-600 transition-colors p-0.5"
              onClick={() => setShowToken((prev) => !prev)}
              variant="ghost"
              size="icon"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          {isValidating && (
            <LoaderCircle className="h-4 w-4 text-default-400 animate-spin" />
          )}
        </div>
      </div>

      {displayError && <p className="text-xs text-danger">{displayError}</p>}

      {persistError && (
        <p
          className="text-xs text-danger"
          data-testid="github-token-persist-error"
        >
          {persistError}
        </p>
      )}

      {isValid && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Token validated successfully
        </p>
      )}

      {scopeWarnings.length > 0 && (
        <Alert variant="warning" data-testid="scope-warnings">
          <AlertTitle>Missing recommended scopes:</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
              {scopeWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <a
              className="mt-2 inline-block text-xs font-medium underline hover:no-underline"
              href="https://github.com/settings/tokens"
              rel="noopener noreferrer"
              target="_blank"
            >
              Update token scopes on GitHub &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          checked={remember}
          data-testid="github-token-remember"
          id="remember-token"
          onCheckedChange={(checked) => setRemember(checked)}
        />
        <Label className="text-default-500" htmlFor="remember-token">
          Remember my token
        </Label>
        <Popover>
          <PopoverTrigger
            aria-label="Token storage info"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-default-400 hover:text-default-600 hover:bg-content2 transition-colors cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 text-xs text-default-500">
            Your token is encrypted locally before being saved to your browser.
            It is never sent to a server.
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className={`w-full h-12 text-base ${
          canSubmit
            ? "bg-[var(--brand-blue)] text-white hover:opacity-90 shadow-sm"
            : "bg-default-200 text-default-500 cursor-not-allowed"
        }`}
        data-testid="github-token-submit"
        disabled={!canSubmit}
        size="lg"
        type="submit"
      >
        {isValidating || isSubmitting
          ? "Validating..."
          : "Load My Repositories"}
      </Button>
    </form>
  );
}

// Default export so React.lazy() can import it directly.
export default GetStartedForm;
