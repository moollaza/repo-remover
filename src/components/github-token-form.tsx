import { Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { isValidGitHubToken } from "@/github/client";
import { useTokenValidation } from "@/hooks/use-token-validation";

interface GitHubTokenFormProps {
  className?: string;
  onSubmit: (token: string, remember: boolean) => void;
  onValueChange: (value: string) => void;
  value: string;
}

export default function GitHubTokenForm({
  className,
  onSubmit,
  onValueChange,
  value,
}: GitHubTokenFormProps) {
  const [remember, setRemember] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const { error, isValid, isValidating, scopeWarnings, username } =
    useTokenValidation(value);

  const handleChange = (newValue: string) => {
    onValueChange(newValue);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value || !isValid) return;
    onSubmit(value, remember);
  }

  // Input state based on validation
  const showValidationError =
    Boolean(error) || (Boolean(value) && !isValidGitHubToken(value));
  const validationMessage =
    error ??
    (!isValidGitHubToken(value) && value
      ? "Invalid GitHub token format"
      : null);

  // Determine description based on state
  let inputDescription =
    "Token should start with 'ghp_' or other GitHub prefixes";

  if (isValidating) {
    inputDescription = "Validating token...";
  } else if (isValid && username) {
    inputDescription = `Token is valid. Welcome ${username}, click submit to continue!`;
  }

  // Border/ring color based on state
  const inputBorderClass = showValidationError
    ? "border-danger focus:ring-danger"
    : isValid && username
      ? "border-success focus:ring-success"
      : "border-default-300 focus:ring-primary";

  // Description text color based on state
  const descriptionColorClass =
    isValid && username ? "text-success" : "text-default-400";

  return (
    <form
      className={cn("flex flex-col gap-10", className)}
      data-testid="github-token-form"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Token input */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-foreground" htmlFor="personal-access-token">
            Please enter your Personal Access Token
          </Label>
          <div className="relative">
            <Input
              autoComplete="off"
              className={cn(
                "h-auto bg-default-100 py-2.5 pl-3 text-sm text-foreground",
                value ? "pr-16" : "pr-3",
                "placeholder:text-default-400",
                inputBorderClass,
              )}
              data-testid="github-token-input"
              id="personal-access-token"
              name="personal-access-token"
              onChange={(e) => {
                handleChange(e.target.value);
              }}
              required
              type={showToken ? "text" : "password"}
              value={value}
            />
            {/* Toggle visibility + Clear buttons */}
            {value && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <Button
                  aria-label={showToken ? "Hide token" : "Show token"}
                  className="text-default-400 hover:text-default-600 transition-colors p-1"
                  onClick={() => {
                    setShowToken((prev) => !prev);
                  }}
                  type="button"
                  variant="ghost"
                  size="icon"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  aria-label="Clear token"
                  className="text-default-400 hover:text-default-600 transition-colors p-1"
                  onClick={() => {
                    handleChange("");
                  }}
                  type="button"
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {/* Validation error */}
          {showValidationError && validationMessage && (
            <p className="text-xs text-danger">{validationMessage}</p>
          )}
          {/* Description */}
          <p className={cn("text-xs", descriptionColorClass)}>
            {inputDescription}
          </p>
        </div>

        {/* Scope warnings — shown when token is valid but missing recommended scopes */}
        {scopeWarnings.length > 0 && (
          <Alert variant="warning" data-testid="scope-warnings">
            <AlertTitle>Token is missing recommended scopes:</AlertTitle>
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

        <Label className="cursor-pointer flex items-center gap-2">
          <Checkbox
            checked={remember}
            data-testid="github-token-remember"
            onCheckedChange={(checked) => {
              setRemember(checked);
            }}
          />
          <span className="text-foreground">
            Remember me (token is stored locally, on your device)
          </span>
        </Label>
      </div>

      <Button
        className={cn(
          "w-full",
          !isValid || isValidating
            ? "bg-primary/50 text-white/70 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary/90",
        )}
        data-testid="github-token-submit"
        disabled={!isValid || isValidating}
        size="lg"
        type="submit"
      >
        {isValidating ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Validating...
          </span>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
