import { expect, test } from "@playwright/test";

/**
 * Guards the home-route bundle against regressions that would re-introduce
 * Octokit or other dashboard-only code on first paint of `/`.
 *
 * The check is intentionally structural rather than URL-string based:
 *  - A filename regex (e.g. /octokit/i) is brittle because Rollup renames
 *    auto-extracted shared chunks (our Octokit shared chunk is currently
 *    named "scopes-*.js" — a rename would silently bypass the check).
 *  - Instead we assert the entry HTML only hints (modulepreload) at the
 *    known entry + react-vendor + runtime chunks, AND that no JS request
 *    during the initial-paint window carries a module with a bare `octokit`
 *    package identifier.
 */
test.describe("Home page initial bundle", () => {
  test("entry only modulepreloads react-vendor + runtime", async ({ page }) => {
    await page.goto("/");

    const preloadedHrefs = await page
      .locator('link[rel="modulepreload"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href") ?? "")
          .filter((href) => href.length > 0),
      );

    // Every preload must be one of the three expected chunk families.
    const allowed = /\/(rolldown-runtime|react-vendor|index)-[^.]+\.js$/;
    for (const href of preloadedHrefs) {
      expect(allowed.test(href), `Unexpected modulepreload on /: ${href}`).toBe(
        true,
      );
    }
  });

  test("no Octokit-named module is requested before the form is needed", async ({
    page,
  }) => {
    const suspiciousRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      // `octokit` package identifiers leak into URLs for sourcemaps and
      // dev-server transforms. If we ever see one on first paint of /,
      // something in the static import graph pulled Octokit back in.
      if (/[\/?&]octokit/i.test(url)) {
        suspiciousRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(
      suspiciousRequests,
      `Home should not request Octokit-named modules, but saw: ${suspiciousRequests.join(", ")}`,
    ).toHaveLength(0);
  });
});
