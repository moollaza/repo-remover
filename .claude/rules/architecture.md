---
globs: ["src/**"]
description: Architecture review findings, priority recommendations, GitHub API patterns
---

# Architecture & API Patterns

## Core Data Flow

- **GitHub API Integration**: Uses Octokit with GraphQL to fetch user and organization repositories
- **State Management**: React Context (`GitHubContext`) provides authentication state and repository data across components
- **Data Fetching**: SWR for caching and revalidation of GitHub API calls
- **Authentication**: GitHub Personal Access Token (PAT) based authentication

## Key Components Structure

- **GitHub API Module**: `src/github/` — queries, scopes, fetcher, client, mutations, types
- **Data Provider Layer**: `GitHubDataProvider` wraps the app and manages API calls and state
- **Context Layer**: `GitHubContext` provides typed access to user data, repositories, and authentication state
- **Component Layer**: Reusable UI components built with Tailwind CSS
- **Testing Layer**: MSW for unit tests, real API calls for E2E tests

## GitHub API Best Practices

### GraphQL Optimization

- Only request fields you need
- Use pagination (`first`, `after`) for large datasets
- Batch organization repo fetches in parallel

### Rate Limiting

- All requests must be authenticated (higher limits)
- Wait 1 second between mutative operations
- Respect `X-RateLimit-Remaining` and `retry-after` headers
- Use conditional requests (etag, if-modified-since) when possible

### Error Handling

- Support partial data loading (SSO-protected orgs may fail)
- Never ignore repeated 4xx/5xx errors
- Validate input to prevent validation errors

## Environment Setup

### Development Environment

No environment variables required. The app uses:

- MSW for API mocking
- Mock authentication data
- Local-only analytics (console logs instead of tracking)

### Production Environment

Configure optional monitoring services:

1. **Sentry.io** — add `VITE_SENTRY_DSN` to `.env`
2. **Fathom Analytics** — add `VITE_FATHOM_SITE_ID` to `.env`

## Documentation Links

### Core Framework & Libraries

- Vite: https://vitejs.dev/guide/
- React Router: https://reactrouter.com/
- React: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs/

### UI & Styling

- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/

### GitHub API & Data Fetching

- Octokit: https://github.com/octokit/octokit.js
- GitHub GraphQL API: https://docs.github.com/en/graphql
- SWR: https://swr.vercel.app/docs/getting-started

### Testing

- Vitest: https://vitest.dev/guide/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright: https://playwright.dev/docs/intro
- MSW: https://mswjs.io/docs/

### Development Tools

- ESLint: https://eslint.org/docs/latest/
- Prettier: https://prettier.io/docs/en/

### Production Monitoring

- Sentry.io: https://docs.sentry.io/platforms/javascript/guides/react/
- Fathom Analytics: https://usefathom.com/docs
