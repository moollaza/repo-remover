import { expect, test } from "@playwright/test";

import {
  mockGraphQLRepos,
  mockLocalStorage,
  mockOctokitInit,
} from "./utils/github-api-mocks";

// Basic theme tests (switcher icons, toggle, persistence) are in theme-basic.spec.ts
// against "/" which needs no auth. These tests cover dashboard-specific theme behavior.

test.describe("Theme Functionality", () => {
  test("dark theme has proper contrast and visibility", async ({ page }) => {
    // Set up auth to access dashboard content
    await mockLocalStorage(page);
    await mockOctokitInit(page);
    await mockGraphQLRepos(page);
    await page.goto("/dashboard");
    await page.waitForSelector('[data-testid="repo-table-header"]', {
      state: "visible",
    });

    // Switch to dark theme
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });
    await themeSwitcher.click();

    // Wait for dark theme to be applied
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Check main content areas have proper dark theme colors using testid
    const titleText = page.getByTestId("repo-table-header");
    await expect(titleText).toBeVisible();

    const textColor = await titleText.evaluate(
      (el) => window.getComputedStyle(el).color,
    );

    // Text should be light colored in dark theme (not pure black)
    expect(textColor).not.toBe("rgb(0, 0, 0)"); // Should not be black text

    // Check body background is dark
    const body = page.locator("body");
    const bodyBg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Dark theme should not have white background
    expect(bodyBg).not.toBe("rgb(255, 255, 255)");
  });

  test("keyboard shortcuts work in both themes", async ({ page }) => {
    // Set up auth to access dashboard content
    await mockLocalStorage(page);
    await mockOctokitInit(page);
    await mockGraphQLRepos(page);
    await page.goto("/dashboard");

    // Wait for data to load and search input to be available
    await page.waitForSelector('[data-testid="repo-search-input"]', {
      state: "visible",
    });

    // Test in light theme first
    const searchInput = page.getByTestId("repo-search-input");
    await expect(searchInput).toBeVisible();

    // Verify search input is not focused initially
    await expect(searchInput).not.toBeFocused();

    // Use Cmd+K to focus search input
    await page.keyboard.press("Meta+k");
    await expect(searchInput).toBeFocused();

    // Clear focus
    await page.keyboard.press("Escape");

    // Switch to dark theme
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });
    await themeSwitcher.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Test keyboard shortcut still works in dark theme
    await expect(searchInput).not.toBeFocused();
    await page.keyboard.press("Meta+k");
    await expect(searchInput).toBeFocused();
  });
});
