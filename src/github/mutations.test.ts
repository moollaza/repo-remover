import { type Repository } from "@octokit/graphql-schema";
import { Octokit } from "@octokit/rest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/analytics", () => ({
  analytics: {
    trackRepoArchived: vi.fn(),
    trackRepoDeleted: vi.fn(),
  },
}));

import { analytics } from "@/utils/analytics";

import { archiveRepo, deleteRepo, processRepo } from "./mutations";

describe("mutations", () => {
  const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
  const mockDelete = vi.fn().mockResolvedValue({ data: {} });
  let mockOctokit: Partial<Octokit>;
  const mockRepo = {
    name: "test-repo",
    owner: {
      login: "testuser",
    },
  } as Repository;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          delete: mockDelete,
          update: mockUpdate,
        },
      },
    } as unknown as Octokit;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("archiveRepo", () => {
    it("should call update with archived=true", async () => {
      await archiveRepo(mockOctokit as Octokit, mockRepo);

      expect(mockUpdate).toHaveBeenCalledWith({
        archived: true,
        owner: mockRepo.owner.login,
        repo: mockRepo.name,
      });
    });

    it("should propagate errors from the API", async () => {
      const error = new Error("Permission denied");
      mockUpdate.mockRejectedValueOnce(error);

      await expect(
        archiveRepo(mockOctokit as Octokit, mockRepo),
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("deleteRepo", () => {
    it("should call delete with correct parameters", async () => {
      await deleteRepo(mockOctokit as Octokit, mockRepo);

      expect(mockDelete).toHaveBeenCalledWith({
        owner: mockRepo.owner.login,
        repo: mockRepo.name,
      });
    });

    it("should propagate errors from the API", async () => {
      const error = new Error("Repository not found");
      mockDelete.mockRejectedValueOnce(error);

      await expect(
        deleteRepo(mockOctokit as Octokit, mockRepo),
      ).rejects.toThrow("Repository not found");
    });
  });

  describe("processRepo", () => {
    it("should call archiveRepo when action is 'archive'", async () => {
      await processRepo(mockOctokit as Octokit, mockRepo, "archive");

      expect(mockUpdate).toHaveBeenCalledWith({
        archived: true,
        owner: mockRepo.owner.login,
        repo: mockRepo.name,
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should call deleteRepo when action is 'delete'", async () => {
      await processRepo(mockOctokit as Octokit, mockRepo, "delete");

      expect(mockDelete).toHaveBeenCalledWith({
        owner: mockRepo.owner.login,
        repo: mockRepo.name,
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should call analytics.trackRepoArchived after successful archive", async () => {
      await processRepo(mockOctokit as Octokit, mockRepo, "archive");

      expect(analytics.trackRepoArchived).toHaveBeenCalledOnce();
      expect(analytics.trackRepoDeleted).not.toHaveBeenCalled();
    });

    it("should call analytics.trackRepoDeleted after successful delete", async () => {
      await processRepo(mockOctokit as Octokit, mockRepo, "delete");

      expect(analytics.trackRepoDeleted).toHaveBeenCalledOnce();
      expect(analytics.trackRepoArchived).not.toHaveBeenCalled();
    });

    it("should not call analytics when archive API throws", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Permission denied"));

      await expect(
        processRepo(mockOctokit as Octokit, mockRepo, "archive"),
      ).rejects.toThrow();

      expect(analytics.trackRepoArchived).not.toHaveBeenCalled();
      expect(analytics.trackRepoDeleted).not.toHaveBeenCalled();
    });

    it("should not call analytics when delete API throws", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Not found"));

      await expect(
        processRepo(mockOctokit as Octokit, mockRepo, "delete"),
      ).rejects.toThrow();

      expect(analytics.trackRepoDeleted).not.toHaveBeenCalled();
      expect(analytics.trackRepoArchived).not.toHaveBeenCalled();
    });
  });
});
