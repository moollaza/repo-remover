import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Key,
  LoaderCircle,
  Search,
  SquareCheckBig,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { isValidGitHubToken } from "@/github/client";
import { useGitHubData } from "@/hooks/use-github-data";
import { useTokenValidation } from "@/hooks/use-token-validation";
import { analytics } from "@/utils/analytics";
import {
  fadeUp,
  scaleIn,
  scrollRevealProps,
  staggerContainer,
  staggerContainerWide,
} from "@/utils/motion";

const steps = [
  {
    cta: {
      href: "https://github.com/settings/tokens/new?scopes=repo,delete_repo,read:org&description=Repo+Remover",
      label: "Generate PAT on GitHub",
    },
    description:
      "Create a GitHub PAT with the permissions needed to manage your repositories.",
    icon: Key,
    number: "1",
    title: "Generate a Personal Access Token",
  },
  {
    description:
      "Paste your PAT into Repo Remover. It stays in your browser — we never see it, log it, or send it anywhere.",
    icon: Search,
    number: "2",
    title: "Paste Your Token & Load Repos",
  },
  {
    description:
      "Search, filter, and select what should be archived, or deleted. Confirm your choices and Repo Remover handles the rest.",
    icon: SquareCheckBig,
    number: "3",
    title: "Review and Clean Up",
  },
];

/**
 * Inline PAT form — matches Figma design (key icon + password input + full-width button).
 * Handles validation + auth without HeroUI components.
 */
function InlinePATForm() {
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const { setPat } = useGitHubData();
  const navigate = useNavigate();
  const { error, isValid, isValidating, scopeWarnings } =
    useTokenValidation(token);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isValidating) return;

    setPat(token, remember);
    void navigate("/dashboard");
  }

  const canSubmit = isValid && !isValidating;
  const formatError =
    token.length > 5 && !isValidGitHubToken(token)
      ? "Invalid token format"
      : null;
  const displayError = error ?? formatError;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        {isValidating ? "Validating..." : "Load My Repositories"}
      </Button>
    </form>
  );
}

export function GetStartedSection() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full px-6 sm:px-8 py-16 sm:py-20" id="get-started">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            variants={fadeUp}
          >
            Get Started in Under 2 Minutes
          </motion.h2>
          <motion.p
            className="text-lg text-default-500 max-w-2xl mx-auto text-balance"
            variants={fadeUp}
          >
            No installs, no sign-up, no server. Just a token in your browser and
            you're ready to go.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative"
          {...scrollRevealProps(staggerContainerWide, reduced)}
        >
          {/* Connecting line — desktop only */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-divider hidden sm:block" />

          <div className="space-y-8 sm:space-y-10">
            {steps.map((step, index) => (
              <motion.div
                className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-6 relative"
                key={index}
                variants={fadeUp}
              >
                <div className="shrink-0 relative z-10">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-background ${
                      index === 0
                        ? "bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
                        : "bg-default-100 text-default-500 border border-divider"
                    }`}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 sm:pt-1 sm:pb-2">
                  <h3 className="text-lg font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-default-500 mb-3">{step.description}</p>
                  {step.cta && (
                    <a
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                      href={step.cta.href}
                      onClick={() => analytics.trackGeneratePATClick()}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {step.cta.label}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* PAT form card */}
        <motion.div
          className="mt-16 max-w-xl mx-auto"
          {...scrollRevealProps(scaleIn, reduced)}
        >
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2 text-center">
                Ready to start?
              </h3>
              <p className="text-sm text-default-500 text-center mb-6">
                Paste your PAT below to load your repositories.
              </p>

              <InlinePATForm />

              <div className="flex justify-center mt-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-6 text-xs text-default-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    Stays in your browser
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    Never sent to a server
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    100% free
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
