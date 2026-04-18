import { expect, test } from "@playwright/test";

/**
 * Ensures the marketing home route does not pull in dashboard-only code on
 * initial navigation. The check is intentionally broad: any request whose URL
 * mentions "octokit" on first paint indicates the chunk-splitting regressed.
 */
test.describe("Home page initial bundle", () => {
  test("does not request the Octokit chunk before the form is needed", async ({
    page,
  }) => {
    const octokitRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (/octokit/i.test(url)) {
        octokitRequests.push(url);
      }
    });

    await page.goto("/");
    // Give the network a beat to settle after first paint.
    await page.waitForLoadState("networkidle");

    expect(
      octokitRequests,
      `Home should not preload Octokit, but saw: ${octokitRequests.join(", ")}`,
    ).toHaveLength(0);
  });
});
