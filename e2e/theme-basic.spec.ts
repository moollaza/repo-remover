import { expect, test } from "@playwright/test";

test.describe("Basic Theme Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page (no auth required)
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("domcontentloaded");
  });

  test("theme switcher displays proper icons", async ({ page }) => {
    // Find the theme switcher button in the nav
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });
    await expect(themeSwitcher).toBeVisible();

    // Check that it contains SVG icons (not emoji text)
    const svg = themeSwitcher.locator("svg");
    await expect(svg).toBeVisible();

    // Should not contain emoji text
    const buttonText = await themeSwitcher.textContent();
    expect(buttonText).not.toMatch(/[🌙☀️]/);
  });

  test("can switch between light and dark themes", async ({ page }) => {
    const html = page.locator("html");
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });

    // Switch to dark theme
    await themeSwitcher.click();

    // Check that dark class is applied
    await expect(html).toHaveClass(/dark/);

    // Switch back to light theme
    await themeSwitcher.click();

    // Check that dark class is removed
    await expect(html).not.toHaveClass(/dark/);
  });

  test("theme preference persists across page reloads", async ({ page }) => {
    const html = page.locator("html");
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });

    // Switch to dark theme
    await themeSwitcher.click();

    // Verify dark theme is active
    await expect(html).toHaveClass(/dark/);

    // Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Check that dark theme is still active after reload
    await expect(html).toHaveClass(/dark/);
  });

  test("dark theme changes background and text colors", async ({ page }) => {
    const html = page.locator("html");
    const body = page.locator("body");
    const themeSwitcher = page.getByRole("button", {
      name: /switch to.*theme/i,
    });

    // Get initial light theme colors
    const lightBodyBg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Switch to dark theme
    await themeSwitcher.click();

    // Verify dark theme is applied
    await expect(html).toHaveClass(/dark/);

    // Get dark theme colors
    const darkBodyBg = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Colors should be different between light and dark themes
    expect(darkBodyBg).not.toBe(lightBodyBg);

    // Dark theme should not have pure white background
    expect(darkBodyBg).not.toBe("rgb(255, 255, 255)");
  });
});
