import { type Page } from "@playwright/test";

import {
  getValidPersonalAccessToken,
  MOCK_REPOS,
  MOCK_USER,
} from "@/mocks/static-fixtures";

export async function mockArchiveRepo(
  page: Page,
  repoName: string,
  options: { delay?: number; error?: string; success?: boolean } = {},
) {
  await page.route(`**/repos/**/${repoName}`, (route) => {
    if (route.request().method() !== "PATCH") {
      void route.continue();
      return;
    }

    const fulfill = () => {
      if (options.success === false) {
        void route.fulfill({
          json: { message: options.error ?? "Repository archiving failed" },
          status: 403,
        });
      } else {
        void route.fulfill({ json: { archived: true }, status: 200 });
      }
    };

    if (options.delay) {
      setTimeout(fulfill, options.delay);
    } else {
      fulfill();
    }
  });
}

export async function mockBulkActions(
  page: Page,
  options: { error?: string; success?: boolean } = {},
) {
  await page.route("**/repos/**", (route) => {
    if (options.success === false) {
      void route.fulfill({
        json: { message: options.error ?? "Bulk action failed" },
        status: 403,
      });
    } else {
      void route.fulfill({ status: 204 });
    }
  });
}

export async function mockDeleteRepo(
  page: Page,
  repoName: string,
  options: { error?: string; success?: boolean } = {},
) {
  await page.route(`**/repos/**/${repoName}`, (route) => {
    if (route.request().method() !== "DELETE") {
      void route.continue();
      return;
    }

    if (options.success === false) {
      void route.fulfill({
        json: { message: options.error ?? "Repository deletion failed" },
        status: 403,
      });
    } else {
      void route.fulfill({ status: 204 });
    }
  });
}

export async function mockGraphQLRepos(page: Page): Promise<void> {
  await page.route("https://api.github.com/graphql", async (route) => {
    const body = (await route.request().postDataJSON()) as {
      query: string;
      variables?: Record<string, unknown>;
    };

    if (body.query.includes("getCurrentUser")) {
      return void route.fulfill({
        json: { data: { viewer: MOCK_USER } },
      });
    }

    if (body.query.includes("getRepositories")) {
      // Only return user-owned repos here. Org repos come via getOrgRepositories
      // to avoid duplicates (the real API returns org repos in both queries).
      const userRepos = MOCK_REPOS.filter(
        (r) => r.owner.login === MOCK_USER.login,
      );
      return void route.fulfill({
        json: {
          data: {
            user: {
              ...MOCK_USER,
              repositories: {
                nodes: userRepos,
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        },
      });
    }

    if (body.query.includes("getOrganizations")) {
      return void route.fulfill({
        json: {
          data: {
            user: {
              organizations: {
                nodes: [
                  { login: "testorg", url: "https://github.com/testorg" },
                ],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        },
      });
    }

    if (body.query.includes("getOrgRepositories")) {
      const orgRepos = MOCK_REPOS.filter(
        (r) => r.owner.login !== MOCK_USER.login,
      );
      return void route.fulfill({
        json: {
          data: {
            organization: {
              login: "testorg",
              repositories: {
                nodes: orgRepos,
                pageInfo: { endCursor: null, hasNextPage: false },
              },
              url: "https://github.com/testorg",
            },
          },
        },
      });
    }

    void route.fulfill({ json: { data: {} } });
  });
}

export async function mockGraphQLReposEmpty(page: Page): Promise<void> {
  await page.route("https://api.github.com/graphql", async (route) => {
    const body = (await route.request().postDataJSON()) as { query: string };

    if (body.query.includes("getCurrentUser")) {
      return void route.fulfill({
        json: { data: { viewer: MOCK_USER } },
      });
    }

    if (body.query.includes("getRepositories")) {
      return void route.fulfill({
        json: {
          data: {
            user: {
              ...MOCK_USER,
              repositories: {
                nodes: [],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        },
      });
    }

    if (body.query.includes("getOrganizations")) {
      return void route.fulfill({
        json: {
          data: {
            user: {
              organizations: {
                nodes: [],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        },
      });
    }

    void route.fulfill({ json: { data: {} } });
  });
}

/**
 * Mock GitHub API for token validation failure
 * @param page Playwright page
 * @param errorMessage Optional error message (defaults to "Bad credentials")
 */
export async function mockInvalidToken(
  page: Page,
  errorMessage = "Bad credentials",
) {
  await page.route("https://api.github.com/user", (route) => {
    if (route.request().method() === "GET") {
      void route.fulfill({
        json: {
          documentation_url: "https://docs.github.com/rest",
          message: errorMessage,
        },
        status: 401,
      });
    } else {
      void route.continue();
    }
  });
}

export async function mockLocalStorage(page: Page) {
  const validToken = getValidPersonalAccessToken();

  // The app's secureStorage uses Web Crypto (AES-GCM) to encrypt/decrypt tokens
  // in dev mode. Since addInitScript doesn't await async functions, we can't
  // reliably encrypt before the app reads localStorage.
  //
  // Instead, we set window.__E2E_PLAIN_STORAGE__ = true which tells secureStorage
  // to skip encryption and use plain-text storage (same as unit test mode).
  await page.addInitScript((token) => {
    // Tell secureStorage to skip encryption
    (window as Record<string, unknown>).__E2E_PLAIN_STORAGE__ = true;

    // Store plain-text values with the secure_ prefix (matching secureStorage keys)
    window.localStorage.setItem("secure_pat", token);
    window.localStorage.setItem("secure_login", "testuser");
  }, validToken);
}

export async function mockOctokitInit(page: Page) {
  await page.route("https://api.github.com/user", (route) => {
    void route.fulfill({
      json: MOCK_USER,
      status: 200,
    });
  });
}
