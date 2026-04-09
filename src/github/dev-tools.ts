/**
 * Dev-only utilities for testing. Not used in production.
 * Creates test repositories via the GitHub API for manual QA.
 */
import { type Octokit } from "@octokit/rest";

import { debug } from "@/utils/debug";

const REPO_TEMPLATES = [
  {
    description: "A test project for demos",
    homepage: "https://example.com",
    name: "test-project-1",
    private: false,
  },
  {
    description: "Sample application for testing",
    homepage: "https://demo.com",
    name: "sample-app-2",
    private: true,
  },
  {
    description: "Demo repository",
    homepage: "https://test.com",
    name: "demo-repo-3",
    private: false,
  },
  {
    description: "Test library project",
    homepage: "https://lib.com",
    name: "test-lib-4",
    private: true,
  },
  {
    description: "Example project",
    homepage: "https://sample.com",
    name: "example-5",
    private: false,
  },
];

export async function generateRepos(
  octokit: Octokit,
  setLoading: (loading: boolean) => void,
  numberOfRepos = 10,
): Promise<void> {
  debug.log("Generating test repos...");
  setLoading(true);

  try {
    for (let i = 0; i < numberOfRepos; i++) {
      debug.log(`Creating repo ${i + 1}...`);
      const template = REPO_TEMPLATES[i % REPO_TEMPLATES.length];
      await octokit.rest.repos.createForAuthenticatedUser({
        description: template.description,
        homepage: template.homepage,
        name: `${template.name}-${Date.now()}-${i}`,
        private: template.private,
      });
      // Delay between creates to avoid hitting rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    debug.error(errorMessage);
    throw new Error(`Failed to create repositories: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
}
