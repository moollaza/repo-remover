/* eslint-disable perfectionist/sort-objects */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Look for test files in the "e2e" directory, relative to this configuration file.
  testDir: "e2e",

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only - faster local development with no retries
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 2 : undefined,

  // Reporter to use
  reporter: [
    [process.env.CI ? "dot" : "list"],
    ["html", { open: "never" }],
    [
      "@argos-ci/playwright/reporter",
      { uploadToArgos: !!process.env.ARGOS_TOKEN },
    ],
  ],

  // Global timeout for tests (30 seconds)
  timeout: 30 * 1000,

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "http://localhost:5173",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",

    // Action timeout (10 seconds)
    actionTimeout: 10 * 1000,

    // Allow Argos stabilization script past CSP
    bypassCSP: true,
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 1080 },
      },
    },
  ],
  // Run your local dev server before starting the tests.
  // Preview server (port 4173) serves the built output — required for tests
  // that hit static files like /guides/* which only exist in dist/.
  webServer: [
    {
      command: "bun run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "bun run build && bun x vite preview --port 4173",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
