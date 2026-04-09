import { DashboardPage } from "@e2e/pages/dashboard";
import { HomePage } from "@e2e/pages/home";
import { mockLocalStorage } from "@e2e/utils/github-api-mocks";
import { expect, test } from "@playwright/test";

import { MOCK_USER } from "@/mocks/static-fixtures";

test.describe("Layout Components", () => {
  test.describe("Header", () => {
    test.describe("Home Page", () => {
      test("renders correctly when logged out", async ({ page }) => {
        const home = new HomePage(page);
        await home.setupMocks();
        await home.goto();

        // Brand name should always be visible
        await home.expectBrandVisible();

        // Navigation links should be visible on home page
        await home.expectNavLinkVisible("Features");
        await home.expectNavLinkVisible("How It Works");
        await home.expectNavLinkVisible("Get Started");

        // Dashboard button should not be visible when not logged in
        await home.expectDashboardButtonNotVisible();

        // User profile should not be visible when not logged in
        await home.expectUserProfileNotVisible(MOCK_USER.name, MOCK_USER.login);
      });

      test("shows dashboard button when logged in", async ({ page }) => {
        const home = new HomePage(page);

        // Set up logged in state
        await mockLocalStorage(page);
        await home.setupMocks();
        await home.goto();

        // Dashboard button should be visible when logged in
        await home.expectDashboardButtonVisible();
      });
    });

    test.describe("Dashboard Page", () => {
      test("shows user profile and hides navigation links", async ({
        page,
      }) => {
        const dashboard = new DashboardPage(page);
        await dashboard.setupMocks();
        await dashboard.goto();

        // Brand name should be visible
        await dashboard.expectBrandVisible();

        // User profile should be visible
        await dashboard.expectUserProfileVisible(
          MOCK_USER.name,
          MOCK_USER.login,
        );

        // Navigation links should not be visible on dashboard
        await dashboard.expectNavLinkNotVisible("Features");
        await dashboard.expectNavLinkNotVisible("How It Works");
        await dashboard.expectNavLinkNotVisible("Get Started");
      });

      test("handles logout correctly", async ({ page }) => {
        const dashboard = new DashboardPage(page);
        await dashboard.setupMocks();
        await dashboard.goto();

        // Perform logout and verify redirect
        await dashboard.logout();
        await expect(page).toHaveURL("/");
      });
    });
  });

  test.describe("Footer", () => {
    test.describe("Home Page", () => {
      test("renders correctly", async ({ page }) => {
        const home = new HomePage(page);
        await home.goto();
        await home.verifyCommonFooterElements();
      });
    });

    test.describe("Dashboard Page", () => {
      test("renders correctly", async ({ page }) => {
        const dashboard = new DashboardPage(page);
        await dashboard.setupMocks();
        await dashboard.goto();
        await dashboard.verifyCommonFooterElements();
      });
    });
  });
});
