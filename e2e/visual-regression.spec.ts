import { argosScreenshot } from "@argos-ci/playwright";
import { expect, test } from "@playwright/test";

import { DashboardPage } from "./pages/dashboard";
import { HomePage } from "./pages/home";
import {
  mockBulkActions,
  mockGraphQLRepos,
  mockGraphQLReposEmpty,
  mockLocalStorage,
  mockOctokitInit,
} from "./utils/github-api-mocks";

/**
 * Visual regression tests using Argos CI.
 *
 * All content renders immediately (no animation gating) via `prefers-reduced-motion: reduce`:
 * 1. `scrollRevealProps()` in motion.ts detects reduced motion and uses `animate="visible"`
 *    instead of `whileInView`, so below-fold content is visible in full-page screenshots.
 * 2. framer-motion's `reducedMotion="user"` (MotionConfig in app.tsx) skips transitions.
 * 3. CSS rule in globals.css disables all CSS animations/transitions.
 */

/** Helper: switch page to dark theme */
async function enableDarkTheme(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await page.waitForTimeout(100);
}

test.describe("Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations — same path as a11y reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  // ─── Landing Page ────────────────────────────────────────────────────────────
  test.describe("Landing Page", () => {
    test("light theme", async ({ page }) => {
      const home = new HomePage(page);
      await home.setupMocks();
      await home.goto();
      await page.waitForLoadState("networkidle");

      await argosScreenshot(page, "landing-light", { fullPage: true });
    });

    test("dark theme", async ({ page }) => {
      const home = new HomePage(page);
      await home.setupMocks();
      await home.goto();
      await page.waitForLoadState("networkidle");

      await enableDarkTheme(page);
      await argosScreenshot(page, "landing-dark", { fullPage: true });
    });

    test("authenticated - shows Dashboard button", async ({ page }) => {
      // Set up auth so header shows "Go to Dashboard"
      await mockLocalStorage(page);
      await mockOctokitInit(page);
      await mockGraphQLRepos(page);

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Go to Dashboard")).toBeVisible();

      await argosScreenshot(page, "landing-authenticated", { fullPage: true });
    });
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  test.describe("Dashboard", () => {
    test("with repos - light", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      await argosScreenshot(page, "dashboard-light", { fullPage: true });
    });

    test("with repos - dark", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      await enableDarkTheme(page);
      await argosScreenshot(page, "dashboard-dark", { fullPage: true });
    });

    test("archive mode - archived repos disabled", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Default action is archive — archived repos (repo-2) should be grayed out
      await dashboard.expectRepoActionButton("archive");

      await argosScreenshot(page, "dashboard-archive-mode", { fullPage: true });
    });

    test("delete mode - archived repos selectable", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Switch to delete action — archived repos become selectable
      await dashboard.selectDeleteAction();

      await argosScreenshot(page, "dashboard-delete-mode", { fullPage: true });
    });

    test("skeleton loading state", async ({ page }) => {
      // Mock auth but delay GraphQL response indefinitely so skeleton stays visible
      await mockLocalStorage(page);
      await mockOctokitInit(page);
      await page.route("https://api.github.com/graphql", async () => {
        // Never fulfill — skeleton stays visible
      });

      await page.goto("/dashboard");
      await expect(
        page.getByTestId("repo-table-skeleton-container"),
      ).toBeVisible();

      await argosScreenshot(page, "dashboard-skeleton", { fullPage: true });
    });

    // NOTE: The dashboard error banner (isError) is difficult to trigger via API
    // mocking because fetchGitHubDataWithProgress catches errors internally and
    // returns { repos: [] } — SWR never gets an error state. The error banner is
    // covered by unit tests in dashboard.test.tsx instead.

    test("empty state - no matching repos", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await mockLocalStorage(page);
      await mockOctokitInit(page);
      await mockGraphQLReposEmpty(page);

      await dashboard.goto();
      await expect(page.getByText("No repos to display")).toBeVisible();

      await argosScreenshot(page, "dashboard-empty", { fullPage: true });
    });
  });

  // ─── Confirmation Modal ──────────────────────────────────────────────────────
  test.describe("Confirmation Modal", () => {
    test("archive confirmation", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Select a repo and open the archive confirmation modal
      await dashboard.selectRepository("repo-1");
      await dashboard.archiveButton.click();
      await expect(dashboard.confirmationModalHeader).toBeVisible();

      // Type username to enable the confirm button
      await dashboard.fillConfirmationInput("testuser");
      await dashboard.expectConfirmButtonEnabled();

      await argosScreenshot(page, "modal-confirm-archive", {
        element: page.getByTestId("confirmation-modal-confirmation"),
      });
    });

    test("delete confirmation", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Switch to delete and open modal
      await dashboard.selectDeleteAction();
      await dashboard.selectRepository("repo-1");
      await dashboard.deleteButton.click();
      await expect(dashboard.confirmationModalHeader).toBeVisible();

      await dashboard.fillConfirmationInput("testuser");
      await dashboard.expectConfirmButtonEnabled();

      await argosScreenshot(page, "modal-confirm-delete", {
        element: page.getByTestId("confirmation-modal-confirmation"),
      });
    });

    test("progress state", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();

      // Mock archive with a long delay so we can capture the progress state
      await page.route("**/repos/**", async (route) => {
        if (route.request().method() === "PATCH") {
          // Hold the request — never fulfill so progress bar stays visible
          return;
        }
        await route.continue();
      });

      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Select two repos and start archiving
      await dashboard.selectRepository("repo-1");
      await dashboard.selectRepository("repo-3");
      await dashboard.archiveButton.click();
      await dashboard.fillConfirmationInput("testuser");
      await dashboard.confirmationModalConfirm.evaluate((el) =>
        (el as HTMLElement).click(),
      );

      // Wait for progress modal to appear
      await expect(dashboard.progressModalHeader).toBeVisible();

      await argosScreenshot(page, "modal-progress", {
        element: page.getByTestId("confirmation-modal-progress"),
      });
    });

    test("success result", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await mockBulkActions(page);

      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      // Select a repo, archive it, confirm
      await dashboard.selectRepository("repo-1");
      await dashboard.archiveButton.click();
      await dashboard.fillConfirmationInput("testuser");
      await dashboard.confirmationModalConfirm.evaluate((el) =>
        (el as HTMLElement).click(),
      );

      // Wait for result modal
      await expect(dashboard.resultModalHeader).toBeVisible();

      await argosScreenshot(page, "modal-result-success", {
        element: page.getByTestId("confirmation-modal-result"),
      });
    });

    test("result with errors", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();

      // Mock archive to fail
      await mockBulkActions(page, {
        error: "Repository is read-only",
        success: false,
      });

      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      await dashboard.selectRepository("repo-1");
      await dashboard.archiveButton.click();
      await dashboard.fillConfirmationInput("testuser");
      await dashboard.confirmationModalConfirm.evaluate((el) =>
        (el as HTMLElement).click(),
      );

      await expect(dashboard.resultModalHeader).toBeVisible();

      await argosScreenshot(page, "modal-result-errors", {
        element: page.getByTestId("confirmation-modal-result"),
      });
    });

    test("delete confirmation - dark", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();

      await enableDarkTheme(page);

      await dashboard.selectDeleteAction();
      await dashboard.selectRepository("repo-1");
      await dashboard.deleteButton.click();
      await expect(dashboard.confirmationModalHeader).toBeVisible();

      await dashboard.fillConfirmationInput("testuser");

      await argosScreenshot(page, "modal-confirm-delete-dark", {
        element: page.getByTestId("confirmation-modal-confirmation"),
      });
    });
  });

  // ─── Guides ──────────────────────────────────────────────────────────────────
  // Guide pages are static HTML generated at build time and served by
  // `vite preview` on port 4173 (see playwright.config.ts and e2e/guides.spec.ts).
  test.describe("Guides", () => {
    const PREVIEW_URL = "http://localhost:4173";

    test("guides index", async ({ page }) => {
      await page.goto(`${PREVIEW_URL}/guides/`);
      await page.waitForLoadState("networkidle");
      await argosScreenshot(page, "guides-index", { fullPage: true });
    });

    test("guide: clean-up-your-github-profile", async ({ page }) => {
      await page.goto(`${PREVIEW_URL}/guides/clean-up-your-github-profile/`);
      await page.waitForLoadState("networkidle");
      await argosScreenshot(page, "guide-clean-up-your-github-profile", {
        fullPage: true,
      });
    });

    test("guide: archive-vs-delete-github-repos", async ({ page }) => {
      await page.goto(`${PREVIEW_URL}/guides/archive-vs-delete-github-repos/`);
      await page.waitForLoadState("networkidle");
      await argosScreenshot(page, "guide-archive-vs-delete-github-repos", {
        fullPage: true,
      });
    });

    test("guide: bulk-delete-github-repositories", async ({ page }) => {
      await page.goto(`${PREVIEW_URL}/guides/bulk-delete-github-repositories/`);
      await page.waitForLoadState("networkidle");
      await argosScreenshot(page, "guide-bulk-delete-github-repositories", {
        fullPage: true,
      });
    });
  });

  // ─── Mobile Viewport Screenshots ──────────────────────────────────────────────
  test.describe("Mobile Viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

    test("landing page - mobile", async ({ page }) => {
      const home = new HomePage(page);
      await home.setupMocks();
      await home.goto();
      await argosScreenshot(page, "landing-light-mobile", { fullPage: true });
    });

    test("dashboard - mobile", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();
      await argosScreenshot(page, "dashboard-light-mobile", {
        fullPage: true,
      });
    });

    test("dashboard dark - mobile", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();
      await enableDarkTheme(page);
      await argosScreenshot(page, "dashboard-dark-mobile", {
        fullPage: true,
      });
    });

    test("dashboard delete mode - mobile", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.setupMocks();
      await dashboard.goto();
      await dashboard.waitForFullDataLoad();
      await dashboard.selectDeleteAction();
      await argosScreenshot(page, "dashboard-delete-mode-mobile", {
        fullPage: true,
      });
    });
  });
});
