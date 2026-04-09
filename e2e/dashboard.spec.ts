import { DashboardPage } from "@e2e/pages/dashboard";
import { mockArchiveRepo, mockDeleteRepo } from "@e2e/utils/github-api-mocks";
import { expect, test } from "@playwright/test";

import { MOCK_REPOS } from "@/mocks/static-fixtures";

test.describe("Dashboard Page", () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    // Setup mocks for Octokit and GitHub API
    await dashboard.setupMocks();
    await dashboard.goto();
  });

  test("should have correct initial state", async () => {
    // Check that navigation is visible
    await expect(dashboard.navbar).toBeVisible();
    await expect(dashboard.navbar.getByText("Repo Remover")).toBeVisible();
    await expect(dashboard.navbar.getByText("Test User")).toBeVisible();

    // Check for the page header
    await expect(
      dashboard.page.getByText("Repository Management"),
    ).toBeVisible();

    // Check if the repository table is visible
    await expect(dashboard.table).toBeVisible();

    // Check if the search input is visible and empty
    await expect(dashboard.searchInput).toBeVisible();
    await expect(dashboard.searchInput).toHaveValue("");

    // Check that repo type filter is visible
    await expect(dashboard.typeFilter).toBeVisible();

    // Check that repo action button is visible and disabled
    await expect(dashboard.archiveButton).toBeVisible();
    await expect(dashboard.archiveButton).toBeDisabled();
    await expect(dashboard.deleteButton).not.toBeVisible();

    // Check if the select all checkbox is visible and unchecked
    await expect(dashboard.selectAllCheckbox).toBeVisible();
    await expect(dashboard.selectAllCheckbox).not.toBeChecked();

    // Check that the "Name" header is visible and sortable and not sorted
    const nameHeader = dashboard.page.getByRole("columnheader", {
      name: "Repository",
    });
    await expect(nameHeader).toBeVisible();
    await expect(nameHeader).toHaveAttribute("data-sortable", "true");

    // Check that "Last Updated" header is visible and sortable and sorted descending
    const lastUpdatedHeader = dashboard.page.getByRole("columnheader", {
      name: "Last updated",
    });
    await expect(lastUpdatedHeader).toBeVisible();
    await expect(lastUpdatedHeader).toHaveAttribute("data-sortable", "true");
    await expect(lastUpdatedHeader).toHaveAttribute("aria-sort", "descending");

    // Check if the repository rows are visible
    await expect(dashboard.tableRows.first()).toBeVisible();

    // Check if the pagination controls are visible
    await expect(dashboard.pagination).toBeVisible();
  });

  test("should display no repositories message when no repos are available", async () => {
    // Mock the API response to return no repositories
    await dashboard.mockEmptyReposResponse();
    await dashboard.goto();
    await expect(dashboard.table).toBeVisible();
    await expect(
      dashboard.table.getByText("No repos to display"),
    ).toBeVisible();
    await expect(dashboard.pagination).not.toBeVisible();
  });

  test("should display administerable repositories on first page", async () => {
    // We should have 5 repos per page
    await expect(dashboard.tableRows).toHaveCount(5);

    // Check repos 1-5 are displayed (all have viewerCanAdminister: true)
    for (let i = 0; i < 5; i++) {
      const template = MOCK_REPOS[i];
      await dashboard.expectRepoNameVisible(template.name);
    }

    // Verify repos 6 and 8 are NOT visible since viewerCanAdminister is false
    await dashboard.expectRepoNotVisible(MOCK_REPOS[5].name); // repo-6
    await dashboard.expectRepoNotVisible(MOCK_REPOS[7].name); // repo-8
  });

  test("should display correct tags for each repository", async () => {
    // Check appropriate tags for each visible repository on first page
    for (let i = 0; i < 5; i++) {
      const template = MOCK_REPOS[i];

      if (template.isPrivate) {
        await dashboard.expectRepoHasTag(template.name, "Private");
      }

      if (template.isFork) {
        await dashboard.expectRepoHasTag(template.name, "Fork");
      }

      if (template.isArchived) {
        await dashboard.expectRepoHasTag(template.name, "Archived");
      }

      if (template.isInOrganization) {
        await dashboard.expectRepoHasTag(template.name, "Org");
      }

      // Verify owner information when it's not the current user
      if (template.ownerType !== "current-user") {
        await dashboard.expectRepoHasOwner(template.name);
      }
    }
  });

  test("should properly paginate repositories", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Get all repo rows on first page;
    await expect(dashboard.tableRows).toHaveCount(5);

    // Test pagination - go to page 2 using our new helper method
    await dashboard.goToNextPage();

    // Check that we're on page 2 using our new helper method
    await dashboard.expectCurrentPage(2);

    // The administerable repositories on page 2 should be repo-7, repo-9, and repo-10
    // (skipping repo-6 and repo-8 which have viewerCanAdminister: false)
    await dashboard.expectRepoNameVisible(MOCK_REPOS[6].name); // repo-7
    await dashboard.expectRepoNameVisible(MOCK_REPOS[8].name); // repo-9
    await dashboard.expectRepoNameVisible(MOCK_REPOS[9].name); // repo-10

    // Verify repos from page 1 are not visible on page 2
    await dashboard.expectRepoNotVisible(MOCK_REPOS[0].name); // repo-1

    // Test going back to page 1
    await dashboard.goToPrevPage();
    await dashboard.expectCurrentPage(1);

    // Check first page repos are visible again
    await dashboard.expectRepoNameVisible(MOCK_REPOS[0].name); // repo-1
    await dashboard.expectRepoNotVisible(MOCK_REPOS[6].name); // repo-7
  });

  test("should filter repositories", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Search functionality
    await dashboard.searchFor("repo-1");
    await dashboard.expectRepoVisible("repo-1");
    await dashboard.expectRepoNotVisible("repo-2");

    // Clear search
    await dashboard.clearSearch();

    // Filter by type
    await dashboard.filterByType("Private");
    await dashboard.expectRepoNotVisible("repo-2");
  });

  test("should handle pagination", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Change items per page to 20 - all 11 administerable repos fit on one page
    await dashboard.paginationFilter.click();
    await dashboard.page.getByTestId("per-page-option-20").click();

    // With 11 repos on 20-per-page, pagination disappears (only shown when totalPages > 1)
    await expect(dashboard.pagination).not.toBeVisible();

    // All repos should be visible on the single page
    await dashboard.expectRepoVisible("repo-1");
  });

  test("should handle sorting", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Sort by name
    await dashboard.page
      .getByRole("columnheader", { name: "Repository" })
      .click();
    // Verify ascending sort
    await dashboard.expectRepoAtPosition(1, "repo-1");

    // Sort by name in reverse
    await dashboard.page
      .getByRole("columnheader", { name: "Repository" })
      .click();
    // Verify descending sort
    await dashboard.expectRepoAtPosition(1, "repo-template");

    // Sort by last updated
    const lastUpdatedHeader = dashboard.page.getByRole("columnheader", {
      name: "Last updated",
    });
    await lastUpdatedHeader.click();
    // Verify ascending sort by last updated (new column defaults to ascending)
    await dashboard.expectRepoAtPosition(1, "repo-mirror");

    // Sort by last updated in reverse
    await lastUpdatedHeader.click();
    // Verify ascending sort by last updated
    await dashboard.expectRepoAtPosition(1, "repo-1");
  });

  test("should focus search input with Cmd+K keyboard shortcut", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Verify search input is not focused initially
    await expect(dashboard.searchInput).not.toBeFocused();

    // Use Cmd+K (Mac) to focus search input
    await dashboard.page.keyboard.press("Meta+k");

    // Verify search input is now focused
    await expect(dashboard.searchInput).toBeFocused();
  });

  test("should focus search input with Ctrl+K keyboard shortcut", async () => {
    await dashboard.expectRepoVisible("repo-1");

    // Verify search input is not focused initially
    await expect(dashboard.searchInput).not.toBeFocused();

    // Use Ctrl+K (Windows/Linux) to focus search input
    await dashboard.page.keyboard.press("Control+k");

    // Verify search input is now focused
    await expect(dashboard.searchInput).toBeFocused();
  });

  test("should change action button when selecting different actions", async () => {
    // First select a repository so the action buttons are enabled
    await dashboard.selectRepository("repo-1");

    // By default, archive action should be selected
    await dashboard.expectRepoActionButton("archive");

    // When selecting delete action, the button should change
    await dashboard.selectDeleteAction();
    await dashboard.expectRepoActionButton("delete");

    // And we should be able to change back to archive
    await dashboard.selectArchiveAction();
    await dashboard.expectRepoActionButton("archive");
  });

  test("should select all repositories when select all is clicked", async () => {
    // Wait for ALL data (personal + org repos) to finish loading.
    // Progressive loading returns personal repos first; org repos arrive later.
    // If we select-all before org repos load, the selection set won't include them.
    await dashboard.waitForFullDataLoad();

    // Select all repositories
    await dashboard.selectAll();

    // Verify page 1 has 5 rows
    await expect(dashboard.tableRows).toHaveCount(5);

    // Archive button enabled means repos are selected
    await expect(dashboard.archiveButton).toBeEnabled();

    // Go to the next page - selection persists across pages
    await dashboard.goToNextPage();
    await dashboard.expectCurrentPage(2);
    await dashboard.expectRepoVisible("repo-7");
    await expect(dashboard.tableRows).toHaveCount(5);
    await expect(dashboard.archiveButton).toBeEnabled();

    // Uncheck all - archive button should disable again
    await dashboard.deselectAll();
    await expect(dashboard.archiveButton).toBeDisabled();

    // Go back to page 1
    await dashboard.goToPrevPage();
    await dashboard.expectCurrentPage(1);
    await dashboard.expectRepoVisible("repo-1");

    // Archive button still disabled
    await expect(dashboard.archiveButton).toBeDisabled();
  });

  /**
   * CONFIRMATION MODAL
   */

  test.describe("Confirmation Modal", () => {
    test.beforeEach(async () => {
      // Select a repository
      await dashboard.selectRepository("repo-1");
    });

    test("should show different modals for archive and delete actions", async () => {
      // Open archive confirmation modal
      await dashboard.archiveButton.click();
      await dashboard.expectModalInMode("confirmation");
      await dashboard.expectModalTitle(/Confirm Archival/i);
      await dashboard.expectRepoInConfirmationModal("repo-1");

      // Close the modal
      await dashboard.cancelConfirmation();

      // Select delete action and open delete confirmation modal
      await dashboard.selectDeleteAction();
      await dashboard.deleteButton.click();

      // Should have different title and messaging
      await dashboard.expectModalInMode("confirmation");
      await dashboard.expectModalTitle(/Confirm Deletion/i);
      await dashboard.expectRepoInConfirmationModal("repo-1");
      await dashboard.expectText(/I understand the consequences, delete/i);
    });

    test("renders confirmation dialog with repository list", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      await dashboard.expectModalTitle(/Confirm Archival/i);
      await dashboard.expectRepoInConfirmationModal("repo-1");
      await dashboard.expectConfirmButtonDisabled();
    });

    test("requires correct username for confirmation", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      // Enter incorrect username
      await dashboard.fillConfirmationInput("wronguser");
      await dashboard.expectConfirmButtonDisabled();

      await dashboard.clearConfirmationInput();

      // Enter correct username
      await dashboard.fillConfirmationInput("testuser");
      await dashboard.expectConfirmButtonEnabled();
    });

    test("shows progress during repository processing", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      // Mock slow processing
      await mockArchiveRepo(dashboard.page, "repo-1");

      // Confirm action
      await dashboard.confirmAction("testuser");

      // Check progress display
      await dashboard.expectModalInMode("progress");
      await expect(dashboard.progressModalHeader).toContainText(
        /Archiving Repositories/i,
      );
      await dashboard.expectProgressVisible(1);
    });

    test("handles successful repository processing", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      await mockArchiveRepo(dashboard.page, "repo-1");
      await dashboard.confirmAction("testuser");
      await dashboard.expectModalInMode("result");
      await expect(dashboard.resultModalHeader).toContainText(
        /Archival Complete/i,
      );
      await dashboard.expectSuccessMessage("archived");
    });

    test("handles repository processing errors", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      await mockArchiveRepo(dashboard.page, "repo-1", {
        error: "Processing failed",
        success: false,
      });
      await dashboard.confirmAction("testuser");
      await dashboard.expectModalInMode("result");
      await dashboard.page
        .getByText("1 error occurred while archiving the following repository:")
        .isVisible();

      await dashboard.page
        .getByText(
          'repo-1: Failed to archive repo-1:  {"message":"Processing failed"}',
        )
        .isVisible();
    });

    test("handles modal close", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      await dashboard.cancelConfirmation();
      await dashboard.expectModalNotVisible();
    });

    test("shows different text for delete action", async () => {
      // repo-1 already selected in beforeEach
      await dashboard.selectDeleteAction();
      await dashboard.deleteButton.click();
      await dashboard.expectModalInMode("confirmation");
      await dashboard.expectModalBody(/Are you sure you want to delete/i);
      await dashboard.expectText(/I understand the consequences, delete/i);
    });

    test("resets state when closed and reopened", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      // Fill username
      await dashboard.fillConfirmationInput("testuser");

      // Close and reopen modal
      await dashboard.cancelConfirmation();
      await dashboard.archiveButton.click();

      // Username should be reset
      await dashboard.expectConfirmationInputEmpty();
    });

    test("shows singular/plural text correctly", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      // Test with single repo
      await dashboard.expectModalBody(
        /Are you sure you want to archive the following 1 repository/i,
      );

      // Test with multiple repos (use repo-3 - not archived, so not disabled for archive action)
      await dashboard.cancelConfirmation();
      await dashboard.selectRepository("repo-3");
      await dashboard.archiveButton.click();
      await dashboard.expectModalBody(
        /Are you sure you want to archive the following 2 repositories/i,
      );
    });

    test("can close the result modal", async () => {
      // Open the archive modal for this test
      await dashboard.archiveButton.click();

      // Complete the archiving process
      await mockArchiveRepo(dashboard.page, "repo-1");
      await dashboard.confirmAction("testuser");

      // Check we're in result mode
      await dashboard.expectModalInMode("result");

      // Close the result modal
      await dashboard.closeModalResult();

      // Modal should be gone
      await dashboard.expectModalNotVisible();
    });

    test("should handle delete flow end-to-end", async () => {
      // Switch to delete action
      await dashboard.selectDeleteAction();

      // Open delete confirmation modal
      await dashboard.deleteButton.click();
      await dashboard.expectModalInMode("confirmation");
      await dashboard.expectModalTitle(/Confirm Deletion/i);
      await dashboard.expectRepoInConfirmationModal("repo-1");

      // Confirm button should mention "delete"
      await dashboard.expectText(/I understand the consequences, delete/i);

      // Mock the delete API call
      await mockDeleteRepo(dashboard.page, "repo-1");

      // Confirm the deletion
      await dashboard.confirmAction("testuser");

      // Should show progress
      await dashboard.expectModalInMode("progress");
      await expect(dashboard.progressModalHeader).toContainText(
        /Deleting Repositories/i,
      );

      // Should show result
      await dashboard.expectModalInMode("result");
      await expect(dashboard.resultModalHeader).toContainText(
        /Deletion Complete/i,
      );
      await dashboard.expectSuccessMessage("deleted");
    });

    test("should handle delete errors", async () => {
      await dashboard.selectDeleteAction();
      await dashboard.deleteButton.click();

      await mockDeleteRepo(dashboard.page, "repo-1", {
        error: "You do not have permission to delete this repository",
        success: false,
      });

      await dashboard.confirmAction("testuser");
      await dashboard.expectModalInMode("result");
      await expect(
        dashboard.page.getByText(/1 error occurred while deleting/i),
      ).toBeVisible();
    });
  });
});
