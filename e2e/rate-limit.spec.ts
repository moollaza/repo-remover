import { expect, test } from "@playwright/test";

import { getValidPersonalAccessToken } from "@/mocks/static-fixtures";

import { HomePage } from "./pages/home";

test.describe("GitHub API Rate Limit Handling", () => {
  test("shows error state when GraphQL API returns rate limit error", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.setupMocks();

    // Mock GraphQL endpoint to return a rate limit error
    await page.route("https://api.github.com/graphql", (route) => {
      void route.fulfill({
        json: {
          data: null,
          errors: [
            {
              message: "API rate limit exceeded for user ID 12345.",
              type: "RATE_LIMITED",
            },
          ],
        },
        headers: { "Retry-After": "60" },
        status: 200, // GitHub GraphQL returns 200 with errors in body
      });
    });

    // Navigate to home and log in with a valid token
    await home.goto();
    await home.fillToken(getValidPersonalAccessToken());
    await home.expectSubmitEnabled();
    await home.submit();

    // Should navigate to dashboard
    await expect(page).toHaveURL("/dashboard");

    // Should show the error alert rather than crashing or showing empty table
    await expect(
      page.getByText(
        "Error loading repositories. Please check your token and try again.",
      ),
    ).toBeVisible();
  });
});
