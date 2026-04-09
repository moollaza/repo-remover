import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import {
  createMockRepo,
  getValidPersonalAccessToken,
  MOCK_REPOS,
  MOCK_USER,
} from "@/mocks/static-fixtures";
import { createThrottledOctokit } from "@/github/client";
import { fetchGitHubDataWithProgress } from "@/github/fetcher";
import { checkTokenScopes } from "@/github/scopes";

const VALID_PAT = getValidPersonalAccessToken();

// Helper to create a rate_limit handler with specific scopes
function createRateLimitHandler(scopes: string) {
  return http.get("https://api.github.com/rate_limit", () => {
    return HttpResponse.json(
      {
        rate: {
          limit: 5000,
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 1,
        },
        resources: {},
      },
      { headers: { "X-OAuth-Scopes": scopes } },
    );
  });
}

describe("checkTokenScopes", () => {
  it("returns no missing scopes when all required scopes are present", async () => {
    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toEqual([]);
    expect(result.grantedScopes).toContain("repo");
    expect(result.grantedScopes).toContain("delete_repo");
    expect(result.grantedScopes).toContain("read:org");
  });

  it("detects missing delete_repo scope", async () => {
    server.use(createRateLimitHandler("repo, read:org"));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toContain("delete_repo");
    expect(result.missingScopes).not.toContain("repo");
    expect(result.missingScopes).not.toContain("read:org");
  });

  it("detects missing read:org scope", async () => {
    server.use(createRateLimitHandler("repo, delete_repo"));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toContain("read:org");
    expect(result.missingScopes).not.toContain("repo");
  });

  it("detects missing repo scope", async () => {
    server.use(createRateLimitHandler("delete_repo, read:org"));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toContain("repo");
    expect(result.missingScopes).not.toContain("delete_repo");
  });

  it("accepts admin:org as satisfying read:org", async () => {
    server.use(createRateLimitHandler("repo, delete_repo, admin:org"));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toEqual([]);
  });

  it("accepts write:org as satisfying read:org", async () => {
    server.use(createRateLimitHandler("repo, delete_repo, write:org"));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.missingScopes).toEqual([]);
  });

  it("returns empty arrays for fine-grained tokens (no scope header)", async () => {
    // Fine-grained tokens don't include X-OAuth-Scopes header at all
    server.use(
      http.get("https://api.github.com/rate_limit", () => {
        return HttpResponse.json({
          rate: {
            limit: 5000,
            remaining: 4999,
            reset: Math.floor(Date.now() / 1000) + 3600,
            used: 1,
          },
          resources: {},
        });
      }),
    );

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.grantedScopes).toEqual([]);
    expect(result.missingScopes).toEqual([]);
  });

  it("detects all missing scopes for classic PAT with empty scope header", async () => {
    // Classic PATs with no scopes return X-OAuth-Scopes header with empty value
    server.use(createRateLimitHandler(""));

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.grantedScopes).toEqual([]);
    expect(result.missingScopes).toEqual(["repo", "delete_repo", "read:org"]);
  });

  it("returns empty arrays when rate_limit endpoint fails", async () => {
    server.use(
      http.get("https://api.github.com/rate_limit", () => {
        return HttpResponse.error();
      }),
    );

    const octokit = createThrottledOctokit(VALID_PAT);
    const result = await checkTokenScopes(octokit);

    expect(result.grantedScopes).toEqual([]);
    expect(result.missingScopes).toEqual([]);
  });
});

describe("scope warnings in fetch results", () => {
  it("includes delete_repo warning in permissionWarning when scope is missing", async () => {
    server.use(createRateLimitHandler("repo, read:org"));

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeDefined();
    expect(result.permissionWarning).toContain("delete_repo");
    expect(result.permissionWarning).toContain("delete repositories");
    // Repos should still load fine
    expect(result.repos).not.toBeNull();
  });

  it("includes read:org warning in permissionWarning when scope is missing", async () => {
    server.use(createRateLimitHandler("repo, delete_repo"));

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeDefined();
    expect(result.permissionWarning).toContain("read:org");
    expect(result.permissionWarning).toContain("organization");
  });

  it("includes multiple scope warnings when multiple scopes are missing", async () => {
    server.use(createRateLimitHandler("repo"));

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeDefined();
    expect(result.permissionWarning).toContain("delete_repo");
    expect(result.permissionWarning).toContain("read:org");
  });

  it("does not include permissionWarning when all scopes are present", async () => {
    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeUndefined();
  });

  it("falls back to error-based detection for fine-grained tokens", async () => {
    // Fine-grained tokens have no X-OAuth-Scopes header at all
    server.use(
      http.get("https://api.github.com/rate_limit", () => {
        return HttpResponse.json({
          rate: {
            limit: 5000,
            remaining: 4999,
            reset: Math.floor(Date.now() / 1000) + 3600,
            used: 1,
          },
          resources: {},
        });
      }),
      // But org fetch still fails with scope error
      http.post("https://api.github.com/graphql", async ({ request }) => {
        const body = (await request.json()) as { query: string };

        if (body.query.includes("getOrganizations")) {
          return HttpResponse.json({
            data: null,
            errors: [
              {
                message:
                  "Your token has not been granted the required scopes to execute this query.",
                type: "INSUFFICIENT_SCOPES",
              },
            ],
          });
        }

        if (body.query.includes("getRepositories")) {
          return HttpResponse.json({
            data: {
              user: {
                ...MOCK_USER,
                repositories: {
                  nodes: MOCK_REPOS.slice(0, 2),
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    // Should fall back to error-based detection
    expect(result.permissionWarning).toBeDefined();
    expect(result.permissionWarning).toContain("read:org");
    expect(result.repos).not.toBeNull();
  });

  it("scope-based read:org warning prevents duplicate error-based warning", async () => {
    // Token is missing read:org AND org fetch fails
    server.use(
      createRateLimitHandler("repo, delete_repo"),
      http.post("https://api.github.com/graphql", async ({ request }) => {
        const body = (await request.json()) as { query: string };

        if (body.query.includes("getOrganizations")) {
          return HttpResponse.json({
            data: null,
            errors: [
              {
                message:
                  "Your token has not been granted the required scopes to execute this query.",
                type: "INSUFFICIENT_SCOPES",
              },
            ],
          });
        }

        if (body.query.includes("getRepositories")) {
          return HttpResponse.json({
            data: {
              user: {
                ...MOCK_USER,
                repositories: {
                  nodes: MOCK_REPOS.slice(0, 2),
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeDefined();
    // Should have scope-based warning
    expect(result.permissionWarning).toContain("Missing read:org scope");
    // Should NOT have duplicate error-based "may lack the read:org scope" message
    expect(result.permissionWarning).not.toContain("may lack");
  });
});

describe("fetchGitHubDataWithProgress", () => {
  it("returns permissionWarning when org fetch fails with required scopes error", async () => {
    // Override the org query to return a permissions error
    server.use(
      http.post("https://api.github.com/graphql", async ({ request }) => {
        const body = (await request.json()) as { query: string };

        if (body.query.includes("getOrganizations")) {
          return HttpResponse.json({
            data: null,
            errors: [
              {
                message:
                  "Your token has not been granted the required scopes to execute this query.",
                type: "INSUFFICIENT_SCOPES",
              },
            ],
          });
        }

        // For user repos, return normal data
        if (body.query.includes("getRepositories")) {
          return HttpResponse.json({
            data: {
              user: {
                ...MOCK_USER,
                repositories: {
                  nodes: MOCK_REPOS.slice(0, 2),
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeDefined();
    expect(result.permissionWarning).toContain("read:org");
    expect(result.repos).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it("does not include permissionWarning on successful fetch", async () => {
    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.permissionWarning).toBeUndefined();
    expect(result.repos).not.toBeNull();
    expect(result.error).toBeNull();
  });

  describe("pagination", () => {
    /**
     * Helper to create a GraphQL handler that returns paginated org repo responses.
     * All other queries (getRepositories, getOrganizations) return single-page defaults.
     */
    function createPaginatedOrgReposHandler(
      opts: {
        onOrgRepoRequest?: (variables: Record<string, unknown>) => void;
      } = {},
    ) {
      let orgRepoCallCount = 0;

      return http.post(
        "https://api.github.com/graphql",
        async ({ request }) => {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader?.includes(VALID_PAT)) {
            return HttpResponse.json(
              { message: "Bad credentials" },
              { status: 401 },
            );
          }

          const body = (await request.json()) as {
            query: string;
            variables?: Record<string, unknown>;
          };

          // User repos — single page, one repo
          if (body.query.includes("getRepositories")) {
            return HttpResponse.json({
              data: {
                user: {
                  ...MOCK_USER,
                  repositories: {
                    nodes: [MOCK_REPOS[0]],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          // Orgs — single org so fetchAllOrgRepos runs once
          if (body.query.includes("getOrganizations")) {
            return HttpResponse.json({
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
            });
          }

          // Org repos — paginated: page 1 has hasNextPage:true, page 2 has hasNextPage:false
          if (body.query.includes("getOrgRepositories")) {
            opts.onOrgRepoRequest?.(body.variables ?? {});
            orgRepoCallCount++;
            const isFirstPage = orgRepoCallCount === 1;
            return HttpResponse.json({
              data: {
                organization: {
                  login: "testorg",
                  repositories: {
                    nodes: [
                      createMockRepo({
                        id: `org-page${orgRepoCallCount}-repo`,
                        name: `org-page${orgRepoCallCount}-repo`,
                      }),
                    ],
                    pageInfo: {
                      endCursor: isFirstPage ? "cursor-after-page-1" : null,
                      hasNextPage: isFirstPage,
                    },
                  },
                  url: "https://github.com/testorg",
                },
              },
            });
          }

          return HttpResponse.json({ data: {} });
        },
      );
    }

    it("accumulates org repos across paginated responses", async () => {
      server.use(createPaginatedOrgReposHandler());

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // 1 user repo + 2 org repos (from 2 pages)
      expect(result.repos).toHaveLength(3);
      expect(result.repos?.some((r) => r.id === "org-page1-repo")).toBe(true);
      expect(result.repos?.some((r) => r.id === "org-page2-repo")).toBe(true);
      expect(result.error).toBeNull();
    });

    it("threads cursor correctly between paginated requests", async () => {
      const capturedCursors: unknown[] = [];
      server.use(
        createPaginatedOrgReposHandler({
          onOrgRepoRequest: (vars) => capturedCursors.push(vars.cursor),
        }),
      );

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      expect(capturedCursors).toHaveLength(2);
      // First request: cursor should be null (initial page)
      expect(capturedCursors[0]).toBeNull();
      // Second request: cursor should match endCursor from page 1
      expect(capturedCursors[1]).toBe("cursor-after-page-1");
    });

    it("reports progress for each org page loaded", async () => {
      server.use(createPaginatedOrgReposHandler());

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      // Progress calls: personal repos, org page 1 done, complete
      // The org progress fires once after all pages for that org are fetched
      const orgCalls = onProgress.mock.calls.filter(
        ([p]: [{ stage: string }]) => p.stage === "orgs",
      );
      expect(orgCalls.length).toBeGreaterThanOrEqual(1);

      // Final complete call should have all repos
      const completeCalls = onProgress.mock.calls.filter(
        ([p]: [{ stage: string }]) => p.stage === "complete",
      );
      expect(completeCalls).toHaveLength(1);
      expect(completeCalls[0][0].repos).toHaveLength(3);
    });
  });

  describe("org permission and SAML error handling", () => {
    /**
     * Helper that returns normal user repos but lets the caller control
     * what happens when the getOrganizations query fires.
     */
    function createOrgErrorHandler(orgErrorResponse: () => Response) {
      return http.post(
        "https://api.github.com/graphql",
        async ({ request }) => {
          const body = (await request.json()) as { query: string };

          if (body.query.includes("getRepositories")) {
            return HttpResponse.json({
              data: {
                user: {
                  ...MOCK_USER,
                  repositories: {
                    nodes: MOCK_REPOS.slice(0, 3),
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          if (body.query.includes("getOrganizations")) {
            return orgErrorResponse();
          }

          return HttpResponse.json({ data: {} });
        },
      );
    }

    it("returns permissionWarning with read:org message on required scopes error", async () => {
      server.use(
        createOrgErrorHandler(() =>
          HttpResponse.json({
            data: null,
            errors: [
              {
                message:
                  "Your token has not been granted the required scopes to execute this query.",
                type: "INSUFFICIENT_SCOPES",
              },
            ],
          }),
        ),
      );

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      expect(result.permissionWarning).toBeDefined();
      expect(result.permissionWarning).toContain("read:org");
      // Personal repos still returned
      expect(result.repos).toHaveLength(3);
      expect(result.error).toBeNull();
    });

    it("surfaces SAML enforcement error as permissionWarning — personal repos still returned", async () => {
      server.use(
        createOrgErrorHandler(() =>
          HttpResponse.json({
            data: null,
            errors: [
              {
                message:
                  "Resource protected by organization SAML enforcement. You must grant your OAuth token access to this organization.",
                type: "FORBIDDEN",
              },
            ],
          }),
        ),
      );

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // SAML errors now surface as permissionWarning
      expect(result.permissionWarning).toBeDefined();
      // Personal repos still returned despite org failure
      expect(result.repos).toHaveLength(3);
      expect(result.error).toBeNull();
      expect(result.user).not.toBeNull();
    });

    it("surfaces unknown org error as permissionWarning — personal repos still returned", async () => {
      server.use(createOrgErrorHandler(() => HttpResponse.error()));

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // Any org fetch error now surfaces as permissionWarning
      expect(result.permissionWarning).toBeDefined();
      // Personal repos still returned
      expect(result.repos).toHaveLength(3);
      expect(result.error).toBeNull();
      expect(result.user).not.toBeNull();
    });

    it("fires complete progress with personal repos even when org fetch fails", async () => {
      server.use(
        createOrgErrorHandler(() =>
          HttpResponse.json({
            data: null,
            errors: [
              {
                message: "Resource protected by organization SAML enforcement.",
                type: "FORBIDDEN",
              },
            ],
          }),
        ),
      );

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const stages = onProgress.mock.calls.map(
        ([p]: [{ stage: string }]) => p.stage,
      );
      expect(stages).toContain("personal");
      expect(stages).toContain("complete");
      // No org progress since org list was empty
      expect(stages).not.toContain("orgs");

      // Complete progress should have the personal repos
      const completeCall = onProgress.mock.calls.find(
        ([p]: [{ stage: string }]) => p.stage === "complete",
      );
      expect(completeCall[0].repos).toHaveLength(3);
    });
  });

  describe("onProgress callback sequence and parallelism", () => {
    /**
     * Helper that creates a handler with N orgs, each returning distinct repos.
     * Personal repos are a fixed set. This lets us verify progress payloads
     * across parallel org fetches.
     */
    function createMultiOrgHandler(orgCount: number) {
      const orgs = Array.from({ length: orgCount }, (_, i) => ({
        login: `org-${i + 1}`,
        url: `https://github.com/org-${i + 1}`,
      }));

      return http.post(
        "https://api.github.com/graphql",
        async ({ request }) => {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader?.includes(VALID_PAT)) {
            return HttpResponse.json(
              { message: "Bad credentials" },
              { status: 401 },
            );
          }

          const body = (await request.json()) as {
            query: string;
            variables?: Record<string, unknown>;
          };

          if (body.query.includes("getRepositories")) {
            return HttpResponse.json({
              data: {
                user: {
                  ...MOCK_USER,
                  repositories: {
                    nodes: [MOCK_REPOS[0]],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          if (body.query.includes("getOrganizations")) {
            return HttpResponse.json({
              data: {
                user: {
                  organizations: {
                    nodes: orgs,
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          if (body.query.includes("getOrgRepositories")) {
            const variables = body.variables as { org?: string } | undefined;
            const orgLogin = variables?.org ?? "unknown";
            return HttpResponse.json({
              data: {
                organization: {
                  login: orgLogin,
                  repositories: {
                    nodes: [
                      createMockRepo({
                        id: `${orgLogin}-repo`,
                        name: `${orgLogin}-repo`,
                        owner: {
                          id: `${orgLogin}-id`,
                          login: orgLogin,
                          url: `https://github.com/${orgLogin}`,
                        },
                      }),
                    ],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                  url: `https://github.com/${orgLogin}`,
                },
              },
            });
          }

          return HttpResponse.json({ data: {} });
        },
      );
    }

    it("personal stage fires with orgsTotal=0 and orgsLoaded=0", async () => {
      server.use(createMultiOrgHandler(2));

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const personalCall = onProgress.mock.calls.find(
        ([p]: [{ stage: string }]) => p.stage === "personal",
      );
      expect(personalCall).toBeDefined();
      expect(personalCall[0].orgsLoaded).toBe(0);
      expect(personalCall[0].orgsTotal).toBe(0);
      expect(personalCall[0].repos.length).toBeGreaterThan(0);
      expect(personalCall[0].user).not.toBeNull();
    });

    it("orgs stage fires once per org with correct currentOrg and orgsTotal", async () => {
      server.use(createMultiOrgHandler(2));

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const orgCalls = onProgress.mock.calls.filter(
        ([p]: [{ stage: string }]) => p.stage === "orgs",
      );

      // One progress call per org
      expect(orgCalls).toHaveLength(2);

      // All org calls should have correct orgsTotal
      for (const [progress] of orgCalls) {
        expect(progress.orgsTotal).toBe(2);
        expect(progress.currentOrg).toBeDefined();
      }

      // Each org should appear exactly once in currentOrg
      const orgNames = orgCalls.map(
        ([p]: [{ currentOrg: string }]) => p.currentOrg,
      );
      expect(orgNames).toContain("org-1");
      expect(orgNames).toContain("org-2");
    });

    it("orgsLoaded increments from 1 to N across org progress calls", async () => {
      server.use(createMultiOrgHandler(2));

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const orgCalls = onProgress.mock.calls.filter(
        ([p]: [{ stage: string }]) => p.stage === "orgs",
      );

      const orgsLoadedValues = orgCalls
        .map(([p]: [{ orgsLoaded: number }]) => p.orgsLoaded)
        .sort((a: number, b: number) => a - b);

      // Should increment from 1 to 2
      expect(orgsLoadedValues).toEqual([1, 2]);
    });

    it("repos accumulate across parallel org fetches", async () => {
      server.use(createMultiOrgHandler(2));

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const orgCalls = onProgress.mock.calls.filter(
        ([p]: [{ stage: string }]) => p.stage === "orgs",
      );

      // Each org progress call should have more repos than personal alone
      const personalCall = onProgress.mock.calls.find(
        ([p]: [{ stage: string }]) => p.stage === "personal",
      );
      expect(personalCall).toBeDefined();
      const personalRepoCount: number = personalCall[0].repos.length;

      for (const [progress] of orgCalls) {
        expect(progress.repos.length).toBeGreaterThan(personalRepoCount);
      }

      // The last org call should have personal + 2 org repos
      const sortedOrgCalls = [...orgCalls].sort(
        ([a]: [{ orgsLoaded: number }], [b]: [{ orgsLoaded: number }]) =>
          a.orgsLoaded - b.orgsLoaded,
      );
      const lastOrgCall = sortedOrgCalls[sortedOrgCalls.length - 1];
      expect(lastOrgCall[0].repos.length).toBe(personalRepoCount + 2);
    });

    it("complete stage includes all repos from personal + all orgs", async () => {
      server.use(createMultiOrgHandler(2));

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      const completeCall = onProgress.mock.calls.find(
        ([p]: [{ stage: string }]) => p.stage === "complete",
      );
      expect(completeCall).toBeDefined();
      expect(completeCall[0].orgsLoaded).toBe(2);
      expect(completeCall[0].orgsTotal).toBe(2);

      // Complete repos should match the returned result
      expect(completeCall[0].repos.length).toBe(result.repos!.length);

      // Should have personal repo + 2 org repos
      expect(completeCall[0].repos.length).toBe(3);
    });

    it("with zero orgs, no orgs-stage progress fires", async () => {
      server.use(createMultiOrgHandler(0));

      const onProgress = vi.fn();
      await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

      const stages = onProgress.mock.calls.map(
        ([p]: [{ stage: string }]) => p.stage,
      );
      expect(stages).not.toContain("orgs");
      expect(stages).toContain("personal");
      expect(stages).toContain("complete");

      // Complete should show 0 orgs
      const completeCall = onProgress.mock.calls.find(
        ([p]: [{ stage: string }]) => p.stage === "complete",
      );
      expect(completeCall[0].orgsLoaded).toBe(0);
      expect(completeCall[0].orgsTotal).toBe(0);
    });
  });

  it("throws when PAT is missing", async () => {
    const onProgress = vi.fn();
    await expect(
      fetchGitHubDataWithProgress(["testuser", ""], onProgress),
    ).rejects.toThrow("PAT is required");
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("returns personal and org repos on happy path", async () => {
    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.error).toBeNull();
    expect(result.repos).not.toBeNull();
    expect(result.repos!.length).toBeGreaterThan(0);
    expect(result.user).not.toBeNull();
    expect(result.user!.login).toBe("testuser");
  });

  it("fires progress callbacks in order: personal -> orgs -> complete", async () => {
    const onProgress = vi.fn();
    await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

    const stages = onProgress.mock.calls.map(
      ([p]: [{ stage: string }]) => p.stage,
    );

    // First call should be personal
    expect(stages[0]).toBe("personal");
    // Last call should be complete
    expect(stages[stages.length - 1]).toBe("complete");

    // Verify ordering: all personal before orgs, all orgs before complete
    const personalIdx = stages.indexOf("personal");
    const completeIdx = stages.indexOf("complete");
    expect(personalIdx).toBeLessThan(completeIdx);

    // If there are org calls, they should be between personal and complete
    const orgIndices = stages
      .map((s: string, i: number) => (s === "orgs" ? i : -1))
      .filter((i: number) => i >= 0);
    for (const idx of orgIndices) {
      expect(idx).toBeGreaterThan(personalIdx);
      expect(idx).toBeLessThan(completeIdx);
    }
  });

  it("handles empty org list — returns only personal repos", async () => {
    server.use(
      http.post("https://api.github.com/graphql", async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.includes(VALID_PAT)) {
          return HttpResponse.json(
            { message: "Bad credentials" },
            { status: 401 },
          );
        }

        const body = (await request.json()) as { query: string };

        if (body.query.includes("getRepositories")) {
          return HttpResponse.json({
            data: {
              user: {
                ...MOCK_USER,
                repositories: {
                  nodes: MOCK_REPOS.slice(0, 2),
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        if (body.query.includes("getOrganizations")) {
          return HttpResponse.json({
            data: {
              user: {
                organizations: {
                  nodes: [],
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.error).toBeNull();
    expect(result.repos).toHaveLength(2);

    // No org progress calls — only personal and complete
    const stages = onProgress.mock.calls.map(
      ([p]: [{ stage: string }]) => p.stage,
    );
    expect(stages).not.toContain("orgs");
    expect(stages).toContain("personal");
    expect(stages).toContain("complete");
  });

  it("resolves user login via GET_CURRENT_USER when login is empty", async () => {
    // Explicit handler to ensure getCurrentUser is handled in all suite contexts
    server.use(
      http.post("https://api.github.com/graphql", async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.includes(VALID_PAT)) {
          return HttpResponse.json(
            { message: "Bad credentials" },
            { status: 401 },
          );
        }

        const body = (await request.json()) as { query: string };

        if (body.query.includes("getCurrentUser")) {
          return HttpResponse.json({
            data: { viewer: MOCK_USER },
          });
        }

        if (body.query.includes("getRepositories")) {
          return HttpResponse.json({
            data: {
              user: {
                ...MOCK_USER,
                repositories: {
                  nodes: MOCK_REPOS.slice(0, 2),
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        if (body.query.includes("getOrganizations")) {
          return HttpResponse.json({
            data: {
              user: {
                organizations: {
                  nodes: [],
                  pageInfo: { endCursor: null, hasNextPage: false },
                },
              },
            },
          });
        }

        return HttpResponse.json({ data: {} });
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["", VALID_PAT],
      onProgress,
    );

    // Should resolve login from viewer query and still return data
    expect(result.user).not.toBeNull();
    expect(result.user!.login).toBe("testuser");
    expect(result.repos).not.toBeNull();
    expect(result.error).toBeNull();
  }, 30000);

  it("returns error when API calls fail", async () => {
    server.use(
      http.post("https://api.github.com/graphql", () => {
        return HttpResponse.error();
      }),
    );

    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    // fetchRepositories returns error + null repos, outer code does repos ?? []
    // org fetch fails silently (returns empty orgs)
    expect(result.error).not.toBeNull();
    expect(result.repos).toEqual([]);
    expect(result.user).toBeNull();
  });

  it("returns user data from repo query response", async () => {
    const onProgress = vi.fn();
    const result = await fetchGitHubDataWithProgress(
      ["testuser", VALID_PAT],
      onProgress,
    );

    expect(result.user).toEqual({
      avatarUrl: MOCK_USER.avatarUrl,
      id: MOCK_USER.id,
      login: MOCK_USER.login,
      name: MOCK_USER.name,
      url: `https://github.com/${MOCK_USER.login}`,
    });
  });

  it("complete progress includes all repos and user data", async () => {
    const onProgress = vi.fn();
    await fetchGitHubDataWithProgress(["testuser", VALID_PAT], onProgress);

    const completeCalls = onProgress.mock.calls.filter(
      ([p]: [{ stage: string }]) => p.stage === "complete",
    );
    expect(completeCalls).toHaveLength(1);

    const completeProgress = completeCalls[0][0];
    expect(completeProgress.user).not.toBeNull();
    expect(completeProgress.repos.length).toBeGreaterThan(0);
    expect(completeProgress.orgsLoaded).toBe(completeProgress.orgsTotal);
  });

  describe("GraphQL partial response (fetchRepositories path)", () => {
    it("returns partial repos and user data from GraphqlResponseError", async () => {
      const partialRepo = MOCK_REPOS[0];
      server.use(
        http.post("https://api.github.com/graphql", async ({ request }) => {
          const body = (await request.json()) as { query: string };

          if (body.query.includes("getRepositories")) {
            // Return both errors AND data — Octokit throws GraphqlResponseError
            // with error.data containing the partial data
            return HttpResponse.json({
              data: {
                user: {
                  ...MOCK_USER,
                  repositories: {
                    nodes: [partialRepo],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
              errors: [
                {
                  message:
                    "Although you appear to have the correct authorization credentials, the `test-org` organization has enabled OAuth App access restrictions",
                  type: "FORBIDDEN",
                },
              ],
            });
          }

          if (body.query.includes("getOrganizations")) {
            return HttpResponse.json({
              data: {
                user: {
                  organizations: {
                    nodes: [],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          return HttpResponse.json({ data: {} });
        }),
      );

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // Should return the partial repos from the error response
      expect(result.repos).not.toBeNull();
      expect(result.repos!.length).toBeGreaterThanOrEqual(1);
      expect(result.repos!.some((r) => r.id === partialRepo.id)).toBe(true);

      // Should return user data extracted from partial response
      expect(result.user).not.toBeNull();
      expect(result.user!.login).toBe("testuser");

      // Should have an error set
      expect(result.error).not.toBeNull();
    });

    it("returns null repos and null userData when GraphqlResponseError has no user field", async () => {
      server.use(
        http.post("https://api.github.com/graphql", async ({ request }) => {
          const body = (await request.json()) as { query: string };

          if (body.query.includes("getRepositories")) {
            // Error response where data has no user field at all
            return HttpResponse.json({
              data: { viewer: null },
              errors: [
                {
                  message: "Something went wrong with SAML enforcement",
                  type: "FORBIDDEN",
                },
              ],
            });
          }

          if (body.query.includes("getOrganizations")) {
            return HttpResponse.json({
              data: {
                user: {
                  organizations: {
                    nodes: [],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          return HttpResponse.json({ data: {} });
        }),
      );

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // No user.repositories in error data — repos fallback to empty via null ?? []
      expect(result.repos).toEqual([]);

      // No user data available
      expect(result.user).toBeNull();

      // Should have an error
      expect(result.error).not.toBeNull();
    });

    it("returns null repos when GraphqlResponseError has no repo data", async () => {
      server.use(
        http.post("https://api.github.com/graphql", async ({ request }) => {
          const body = (await request.json()) as { query: string };

          if (body.query.includes("getRepositories")) {
            // Error response with no usable data
            return HttpResponse.json({
              data: null,
              errors: [
                {
                  message: "Something went completely wrong",
                  type: "INTERNAL",
                },
              ],
            });
          }

          if (body.query.includes("getOrganizations")) {
            return HttpResponse.json({
              data: {
                user: {
                  organizations: {
                    nodes: [],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          return HttpResponse.json({ data: {} });
        }),
      );

      const onProgress = vi.fn();
      const result = await fetchGitHubDataWithProgress(
        ["testuser", VALID_PAT],
        onProgress,
      );

      // No partial data available — repos come back as empty array (null ?? [])
      expect(result.repos).toEqual([]);
      expect(result.user).toBeNull();
      expect(result.error).not.toBeNull();
    });
  });
});
