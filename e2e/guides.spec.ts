import { expect, test } from "@playwright/test";

// Guide pages are static HTML generated at build time and served by
// `vite preview` on port 4173 (see playwright.config.ts).
const PREVIEW_URL = "http://localhost:4173";

test.describe("Guides", () => {
  test("index page lists guides with SEO primitives", async ({ page }) => {
    await page.goto(`${PREVIEW_URL}/guides/`);

    await expect(
      page.getByRole("heading", {
        name: "GitHub Repository Management Guides",
      }),
    ).toBeVisible();

    // Three distinct guide cards
    const cards = page.locator('main a[href^="/guides/"][href$="/"]');
    await expect(cards).toHaveCount(3);

    // BreadcrumbList JSON-LD present
    const jsonLdCount = await page
      .locator('script[type="application/ld+json"]')
      .count();
    expect(jsonLdCount).toBeGreaterThanOrEqual(1);

    // Canonical meta
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://reporemover.xyz/guides/",
    );
  });

  test("clicking a card navigates to the guide page", async ({ page }) => {
    await page.goto(`${PREVIEW_URL}/guides/`);

    await page.locator('main a[href^="/guides/"][href$="/"]').first().click();

    await expect(page).toHaveURL(/\/guides\/[^/]+\/$/);
    await expect(page.locator("article h1")).toBeVisible();
  });

  test("guide page emits Article + BreadcrumbList JSON-LD", async ({
    page,
  }) => {
    await page.goto(`${PREVIEW_URL}/guides/archive-vs-delete-github-repos/`);

    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(2);

    const payloads = await scripts.allInnerTexts();
    const schemas = payloads.map((p) => JSON.parse(p)["@type"]);
    expect(schemas).toContain("Article");
    expect(schemas).toContain("BreadcrumbList");

    // Per-page meta
    await expect(page).toHaveTitle(/Archive vs Delete.*Repo Remover/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /archive or delete/i,
    );
  });

  test("theme toggle flips the dark class and persists", async ({ page }) => {
    await page.goto(`${PREVIEW_URL}/guides/`);
    const html = page.locator("html");

    await expect(html).not.toHaveClass(/dark/);
    await page.locator("[data-theme-toggle]").click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Restore to avoid leaking state to other tests.
    await page.locator("[data-theme-toggle]").click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("hovering one prose link does not underline other prose links", async ({
    page,
  }) => {
    await page.goto(`${PREVIEW_URL}/guides/archive-vs-delete-github-repos/`);

    const proseLinks = page.locator("article a[href^='http']");
    const linkCount = await proseLinks.count();
    test.skip(linkCount < 2, "Guide lacks 2+ prose links to exercise hover");

    const first = proseLinks.nth(0);
    const second = proseLinks.nth(1);

    await first.hover();

    const firstDecoration = await first.evaluate(
      (el) => window.getComputedStyle(el).textDecorationLine,
    );
    const secondDecoration = await second.evaluate(
      (el) => window.getComputedStyle(el).textDecorationLine,
    );

    expect(firstDecoration).toContain("underline");
    expect(secondDecoration).not.toContain("underline");
  });
});
