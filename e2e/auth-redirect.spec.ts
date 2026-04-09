import { expect, test } from "@playwright/test";

import {
  mockGraphQLRepos,
  mockLocalStorage,
  mockOctokitInit,
} from "./utils/github-api-mocks";

test.describe("Authentication Redirects", () => {
  test("unauthenticated user navigating to /dashboard is redirected to /", async ({
    page,
  }) => {
    // Navigate directly to /dashboard without setting up auth
    await page.goto("/dashboard");

    // Should be redirected to home page. The redirect is async (React useEffect)
    // so we wait for the URL to change.
    await page.waitForURL("/", { timeout: 10000 });
  });

  test("authenticated user stays on /dashboard", async ({ page }) => {
    // Set up auth mocks before navigation
    await mockLocalStorage(page);
    await mockOctokitInit(page);
    await mockGraphQLRepos(page);

    await page.goto("/dashboard");

    // Should see dashboard content (implies URL is /dashboard and auth succeeded)
    await expect(page.getByText("Repository Management")).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL("/dashboard");
  });
});
