/**
 * Repository mutation operations (archive, delete).
 * Re-throws original errors to preserve RequestError type for 401 early-stop detection.
 */
import { type Repository } from "@octokit/graphql-schema";
import { type Octokit } from "@octokit/rest";

import { analytics } from "@/utils/analytics";
import { debug } from "@/utils/debug";

export const archiveRepo = async (
  octokit: Octokit,
  repo: Repository,
): Promise<void> => {
  try {
    await octokit.rest.repos.update({
      archived: true,
      owner: repo.owner.login,
      repo: repo.name,
    });
  } catch (error) {
    debug.error((error as Error).message);
    throw error;
  }
};

export const deleteRepo = async (
  octokit: Octokit,
  repo: Repository,
): Promise<void> => {
  try {
    await octokit.rest.repos.delete({
      owner: repo.owner.login,
      repo: repo.name,
    });
  } catch (error) {
    debug.error((error as Error).message);
    throw error;
  }
};

/** Dispatches archive or delete for a single repo and tracks the analytics event. */
export const processRepo = async (
  octokit: Octokit,
  repo: Repository,
  action: "archive" | "delete",
): Promise<void> => {
  debug.log(`Processing ${action} for ${repo.name}...`);

  if (action === "archive") {
    await archiveRepo(octokit, repo);
    analytics.trackRepoArchived();
  } else {
    await deleteRepo(octokit, repo);
    analytics.trackRepoDeleted();
  }
};
