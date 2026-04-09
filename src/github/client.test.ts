import { beforeEach, describe, expect, it, vi } from "vitest";

interface CapturedOptions {
  auth: string;
  throttle: ThrottleConfig;
}

interface ThrottleConfig {
  onRateLimit: (
    retryAfter: number,
    options: unknown,
    octokit: unknown,
    retryCount: number,
  ) => boolean;
  onSecondaryRateLimit: () => boolean;
}

// Use vi.hoisted so the mock is available when vi.mock factories run
const { getCapturedOptions, MockConstructor } = vi.hoisted(() => {
  let capturedOptions: CapturedOptions | null = null;

  // Must use `function` (not arrow) so it can be called with `new`
  const MockConstructor = vi.fn().mockImplementation(function (
    this: unknown,
    options: CapturedOptions,
  ) {
    capturedOptions = options;
  });

  return {
    getCapturedOptions: () => capturedOptions,
    MockConstructor,
  };
});

vi.mock("@octokit/rest", () => ({
  Octokit: {
    plugin: vi.fn().mockReturnValue(MockConstructor),
  },
}));

vi.mock("@octokit/plugin-throttling", () => ({
  throttling: "mock-throttling",
}));

vi.mock("@octokit/plugin-paginate-graphql", () => ({
  paginateGraphQL: "mock-paginate",
}));

// Import after mocking so the module-level ThrottledOctokit uses the mock
import { createThrottledOctokit, isValidGitHubToken } from "./client";

describe("createThrottledOctokit", () => {
  beforeEach(() => {
    MockConstructor.mockClear();
  });

  it("should create a ThrottledOctokit instance with the provided token", () => {
    const token = "ghp_testtoken1234567890abcdef12345678";
    createThrottledOctokit(token);

    expect(MockConstructor).toHaveBeenCalledOnce();
    const options = getCapturedOptions();
    expect(options).not.toBeNull();
    expect(options!.auth).toBe(token);
  });

  it("onRateLimit should return true on first retry (retryCount=0)", () => {
    createThrottledOctokit("ghp_testtoken1234567890abcdef12345678");

    const { onRateLimit } = getCapturedOptions()!.throttle;
    expect(onRateLimit(60, {}, {}, 0)).toBe(true);
  });

  it("onRateLimit should return false on second retry (retryCount=1)", () => {
    createThrottledOctokit("ghp_testtoken1234567890abcdef12345678");

    const { onRateLimit } = getCapturedOptions()!.throttle;
    expect(onRateLimit(60, {}, {}, 1)).toBe(false);
  });

  it("onRateLimit should return false on subsequent retries (retryCount>1)", () => {
    createThrottledOctokit("ghp_testtoken1234567890abcdef12345678");

    const { onRateLimit } = getCapturedOptions()!.throttle;
    expect(onRateLimit(60, {}, {}, 2)).toBe(false);
    expect(onRateLimit(60, {}, {}, 5)).toBe(false);
  });

  it("onSecondaryRateLimit should always return false", () => {
    createThrottledOctokit("ghp_testtoken1234567890abcdef12345678");

    const { onSecondaryRateLimit } = getCapturedOptions()!.throttle;
    expect(onSecondaryRateLimit()).toBe(false);
  });
});

describe("isValidGitHubToken", () => {
  it("should return false for empty or null tokens", () => {
    expect(isValidGitHubToken("")).toBe(false);
    expect(isValidGitHubToken(null as unknown as string)).toBe(false);
    expect(isValidGitHubToken(undefined as unknown as string)).toBe(false);
  });

  it("should validate github_pat_ tokens correctly", () => {
    expect(
      isValidGitHubToken(
        "github_pat_11AABBCCDDEEFFGGHH0011_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVW",
      ),
    ).toBe(true);

    expect(isValidGitHubToken("github_pat_short")).toBe(false);
    expect(isValidGitHubToken("github_pat_12345678901234567890123456789")).toBe(
      false,
    );
    expect(
      isValidGitHubToken(
        "github_pat_11AABBCCDDEEFFGGHH0011223344556677889900_abcDEF",
      ),
    ).toBe(false);
    expect(
      isValidGitHubToken(
        "github_pat_11AABBCCDDEEFFGGHH0011_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST$%^",
      ),
    ).toBe(false);
  });

  it("should reject github_pat_ tokens with underscore-only payloads", () => {
    expect(isValidGitHubToken("github_pat_" + "_".repeat(61))).toBe(false);
    expect(isValidGitHubToken("github_pat_" + "_".repeat(100))).toBe(false);
    expect(
      isValidGitHubToken(
        "github_pat_11AABBCCDDEEFFGGHH0011_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVW",
      ),
    ).toBe(true);
  });

  it("should validate standard tokens correctly", () => {
    expect(isValidGitHubToken("ghp_1234567890abcdef1234567890abcdef1234")).toBe(
      true,
    );
    expect(isValidGitHubToken("gho_1234567890abcdef1234567890abcdef1234")).toBe(
      true,
    );
    expect(isValidGitHubToken("ghu_1234567890abcdef1234567890abcdef1234")).toBe(
      true,
    );
    expect(isValidGitHubToken("ghs_1234567890abcdef1234567890abcdef1234")).toBe(
      true,
    );
    expect(isValidGitHubToken("ghr_1234567890abcdef1234567890abcdef1234")).toBe(
      true,
    );

    expect(isValidGitHubToken("ghp_tooshort")).toBe(false);
    expect(
      isValidGitHubToken("ghp_1234567890abcdef1234567890abcdef1234567"),
    ).toBe(false);
    expect(
      isValidGitHubToken("ghp_1234567890abcdef1234567890abcdef12345$"),
    ).toBe(false);
  });

  it("should reject tokens with invalid prefixes", () => {
    expect(
      isValidGitHubToken("xyz_1234567890abcdef1234567890abcdef123456"),
    ).toBe(false);
    expect(
      isValidGitHubToken("gh_1234567890abcdef1234567890abcdef123456"),
    ).toBe(false);
    expect(
      isValidGitHubToken("ghpx_1234567890abcdef1234567890abcdef12345"),
    ).toBe(false);
  });
});
