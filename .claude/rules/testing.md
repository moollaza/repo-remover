---
globs:
  [
    "*.test.ts",
    "*.test.tsx",
    "*.spec.ts",
    "playwright.config.ts",
    "tests/**",
    "e2e/**",
    "src/mocks/**",
  ]
description: MSW patterns, E2E with real GitHub API, Playwright, testing strategy
---

# Testing Conventions

## Testing Strategy

- **Unit Tests**: Use MSW to mock GitHub API responses in `src/mocks/handlers.ts`
- **E2E Tests**: Require real GitHub token in `.env.test` file (`GITHUB_TEST_TOKEN`)
- **Test Utilities**: Custom render function in `src/utils/test-utils` wraps components with providers

## Test Commands

```bash
bun run test:unit              # Unit tests once
bun run test:e2e               # Playwright E2E tests
bun run test:e2e:fast          # E2E with fast-fail (no retries, max 1 failure)
bun run test:e2e:debug         # E2E in headed mode for debugging
bun run test:e2e:headed        # E2E in headed mode with fast-fail
bun run test:all               # Unit + E2E
```

## Writing Unit Tests

Import from test-utils instead of @testing-library/react:

```typescript
import { render, screen } from "@/utils/test-utils";

// render automatically wraps with GitHubDataProvider
render(<YourComponent />);
```

The custom `render` function:

- Automatically wraps components with `GitHubDataProvider`
- Re-exports all React Testing Library utilities
- Eliminates boilerplate provider wrapping

## MSW Mocking Best Practices

- Default handlers use operation-based matching: `graphql.query('getRepositories', ...)`
- Scoped to GitHub API: `graphql.link("https://api.github.com/graphql")`
- Error handler factories use `http.post` catch-all (intentionally overrides all operations)
- Use named scenarios for error cases

## New Component Checklist

- [ ] Create component file (`.tsx`)
- [ ] Create test file (`.test.tsx`) — required, not optional
- [ ] Use custom render utility: `import { render } from '@/utils/test-utils'`
- [ ] Follow RTL query priority: `getByRole` > `getByLabelText` > `getByTestId`
- [ ] Test user behavior, not implementation details

## Catching CI Issues Locally

```bash
npx playwright test --list     # Validate E2E imports without running tests
npx tsc --noEmit               # Check TypeScript compilation errors
bun run build                  # Catch Vite build issues
bun run lint                   # Catch ESLint style and syntax issues
```

**Why CI catches issues local doesn't:**

- CI uses clean environments with stricter ES module resolution
- Runtime import errors (E2E tests) vs build-time errors (Vite/TypeScript compilation)
- Fresh installs (`bun install`) vs local development cache
- Type-only imports must use `import { type ... }` syntax for packages that export types separately

## TypeScript Import Best Practices

Some packages export types separately from runtime exports. Use type-only imports to prevent CI failures:

```typescript
// Correct — use type-only imports
import { type Repository, type User } from "@octokit/graphql-schema";
import { type GraphQlQueryResponseData } from "@octokit/graphql";
import { type Page, type Locator } from "@playwright/test";

// Incorrect — runtime import of types will fail in CI
import { Repository, User } from "@octokit/graphql-schema";
```

**Packages requiring type-only imports:**

- `@octokit/graphql-schema` — All GraphQL schema types
- `@octokit/graphql` — Response data types
- `@playwright/test` — Test framework types

## Testing Pyramid

Follow: 70% unit, 20% integration, 10% E2E
