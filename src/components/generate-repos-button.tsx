import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useGitHubData } from "@/hooks/use-github-data";
import { cn } from "@/lib/utils";
import { createThrottledOctokit } from "@/github/client";
import { generateRepos } from "@/github/dev-tools";

/**
 * This component generates random repositories for the user
 * This is only available in development mode, to test archiving and deleting repositories
 * @returns void
 */
export function GenerateReposButton() {
  // Get the mutate function and PAT from the GitHub context
  const { mutate, pat } = useGitHubData();

  // Create an Octokit instance with the PAT
  const octokit = pat ? createThrottledOctokit(pat) : null;
  const [isLoading, setIsLoading] = useState(false);

  const isE2E =
    typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).__E2E_PLAIN_STORAGE__ ===
      true;

  if (!import.meta.env.DEV || !octokit || isE2E) {
    return null;
  }

  return (
    <Button
      data-testid="generate-repos-button"
      className={cn(
        "border-[var(--brand-blue)] px-4 py-2 text-sm font-medium text-[var(--brand-blue)]",
        "hover:bg-[var(--brand-blue)] hover:text-white",
        isLoading && "opacity-70 cursor-not-allowed",
      )}
      disabled={isLoading}
      onClick={() => {
        void generateRepos(octokit, setIsLoading)
          .then(() => {
            // Mutate all GitHub data
            void mutate();
          })
          .catch(() => {
            setIsLoading(false);
          });
      }}
      variant="outline"
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Generating...
        </span>
      ) : (
        "Generate Random Repos"
      )}
    </Button>
  );
}
