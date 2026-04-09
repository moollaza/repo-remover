# Contributing to Repo Remover

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [bun](https://bun.sh/) (package manager)

## Setup

```bash
git clone https://github.com/moollaza/repo-remover.git
cd repo-remover
bun install
bun run dev
```

Visit http://localhost:5173 to see the app running.

## Development Workflow

1. Fork the repo and create a feature branch from `main`
2. Make your changes
3. Run checks before committing:
   ```bash
   bun run lint && bun run test:unit && bun run build
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `fix: resolve token validation error`
   - `feat: add org filter to dashboard`
   - `feat!: redesign authentication flow` (breaking change)
   - `chore:`, `docs:`, `refactor:`, `test:` for non-release changes
5. Open a pull request and fill out the PR template

## Code Conventions

### Styling

- Use **Tailwind semantic color classes** (`bg-background`, `text-foreground`, `bg-content1`, `border-divider`) — not hardcoded colors like `bg-gray-100`
- Colors are defined as CSS custom properties in `src/globals.css` and adapt to light/dark themes

### TypeScript

- Use **type-only imports** for `@octokit/*` types:
  ```typescript
  import { type Repository } from "@octokit/graphql-schema";
  ```

### Components

- Components over 200 LOC should extract logic into custom hooks
- Co-locate tests next to components (e.g., `button.tsx` + `button.test.tsx`)

### Testing

- Use the custom render utility (wraps components with providers):
  ```typescript
  import { render, screen } from "@/utils/test-utils";
  ```
- Follow RTL query priority: `getByRole` > `getByLabelText` > `getByTestId`
- MSW mocks for GitHub API calls in unit tests
- Test user behavior, not implementation details

## Running Tests

```bash
bun run test:unit        # Unit tests (Vitest + RTL + MSW)
bun run test:e2e         # E2E tests (Playwright)
bun run test:e2e:fast    # E2E with fast-fail
bun run test:all         # Unit + E2E
```

## Environment Variables

Copy `.env.example` to see available variables. None are required for development — the app works without any env vars configured.

## AI-Assisted Development

This repo includes `.claude/` configuration files for contributors using [Claude Code](https://claude.ai/code). These are optional — you don't need Claude Code to contribute.

## Security

This app follows a **zero-knowledge architecture** — all GitHub API calls happen client-side. Never add backend dependencies or server-side token handling. See [SECURITY.md](SECURITY.md) for details.

## Questions?

[Open an issue](https://github.com/moollaza/repo-remover/issues) — we're happy to help.
