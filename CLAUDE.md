# Repo Remover

GitHub repository management tool — bulk view, archive, and delete repos. Zero-knowledge, client-side only.

## Stack

Vite 8, React 18, React Router 7, TypeScript 5.9, Tailwind CSS 4, Vitest + RTL + Playwright, MSW, Octokit (GraphQL + REST), SWR, Sentry + Fathom, bun

Deployed on **Cloudflare Workers** (not Vercel).

## Constraints

- **Zero-knowledge architecture**: all GitHub API calls client-side only, no backend
- **PAT-based auth**: only viable client-side GitHub auth option (no OAuth, no PKCE)
- **No user data, tokens, or PII** sent to any server
- **Tailwind CSS only**: no component library — use plain Tailwind + CSS custom properties for theming
- **bun** as package manager (not npm)

## Commands

```bash
bun run dev              # dev server (localhost:5173)
bun run build            # tsc + vite production build
bun run lint             # eslint
bun run lint:fix         # eslint with auto-fix
bun run test:unit        # unit tests (vitest)
bun run test:e2e         # playwright E2E tests
bun run test:e2e:fast    # E2E with fast-fail
bun run test:all         # unit + E2E
npx tsc --noEmit         # typecheck (must pass before merge)
```

**Before every commit:** `bun run lint && bun run test:unit && bun run build`

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) — release-please uses these to auto-generate changelogs and determine semver bumps.

- `fix: ...` → patch (2.0.1)
- `feat: ...` → minor (2.1.0)
- `feat!: ...` or `BREAKING CHANGE:` footer → major (3.0.0)
- `chore:`, `docs:`, `refactor:`, `test:`, `ci:` → no release

## Workflow

Uses **Compound Engineering** workflow: Plan → Work → Review → Compound.

- `/lfg` — full autonomous pipeline (plan → work → review → compound)
- `/slfg` — same but with swarm parallelism for work + review
- `/ce-plan` — structured planning only
- `/ce-work` — execute a plan
- `/ce-review` — multi-agent code review
- `/ce-compound` — document learnings in `docs/solutions/`

Plans go in `docs/plans/`. Solutions go in `docs/solutions/`.

## Architecture

- **Presentational/Container split**: `page.tsx` (container) + `dashboard.tsx` (presentational)
- **Custom hooks**: `use-repo-filters.ts`, `use-repo-pagination.ts` — extract logic from components >200 LOC
- **GitHub API module**: `src/github/` — queries, scopes, fetcher, client, mutations, types
- **Theme**: CSS custom properties in `globals.css`, dark mode via `class` strategy with `next-themes`
- **Token storage**: AES-GCM encrypted in localStorage (`src/utils/secure-storage.ts`)
- **Data flow**: React Context (`GitHubContext`) + SWR for caching → Octokit GraphQL → GitHub API
- **Error monitoring**: Sentry (with token sanitization + PII scrubbing)
- **Analytics**: Fathom (privacy-first, no cookies)

## Load-bearing SEO infrastructure — do not touch without approval

The Cloudflare Worker at `worker/index.ts` is required for SEO and must not be deleted, disabled, or "cleaned up as unused." It performs three jobs that nothing else in the stack covers:

1. `http://` → `https://` 301 redirects
2. `www.reporemover.xyz` → `reporemover.xyz` 301 redirects
3. Injects `Link: <https://reporemover.xyz/>; rel="canonical"` on every `/` response, including query-string variants like `/?ref=producthunt`, `/?utm_source=…`, `/?from=…` (the static `_headers` file can only match exact paths and cannot cover these)

All of the following are mutually dependent — removing any one silently breaks production SEO and GSC will regress within days:

- `worker/index.ts` (+ `worker/index.test.ts` — regression suite)
- `tsconfig.worker.json` and its reference in `tsconfig.json`
- `wrangler.jsonc` keys: `main: "worker/index.ts"`, `assets.binding: "ASSETS"`, `assets.run_worker_first: true`
- `@cloudflare/workers-types` in `devDependencies` (CI's `--frozen-lockfile` skips optional peer deps, so declare it explicitly)
- `eslint.config.js` worker `parserOptions` override for `worker/**/*.ts`

If a task genuinely requires changing any of these, stop and confirm with the user first.

## Coding Standards

- Use Tailwind utility classes (not hardcoded colors). Use CSS custom properties for theme values
- Use `debug` utility for logging — never `console.log` in production
- Type-only imports for `@octokit/*` types: `import { type Repository } from "@octokit/graphql-schema"`
- Components >200 LOC: extract custom hooks or sub-components
- Tests required for all new components (co-located `.test.tsx`)
- Custom test render: `import { render } from "@/utils/test-utils"` (wraps with providers)
- MSW for unit test API mocking, operation-based handlers: `graphql.query('GetRepositories', ...)`

## Lessons Learned

- `secureStorage` uses `secure_` prefix: keys are `secure_pat` / `secure_login` in localStorage
- lint-staged runs prettier on ALL files in working tree, not just staged — untracked malformed files block commits
- Table doesn't expose standard `aria-selected` — use button enable state to verify selection
- Dashboard shows SKELETON when `repos === null`, TABLE (even empty) when `repos !== []`
- E2E: `dashboard.goto()` doesn't wait for data — add explicit waits in tests that need loaded data
- E2E: theme tests needing dashboard content must set up auth mocks BEFORE navigating
- Pre-commit hook: `husky` + `lint-staged` (eslint --fix + prettier --write)
- FAQPage JSON-LD is injected at runtime from `src/components/landing/faq-section.tsx` — single source of truth for FAQ data

## Details

- `.claude/rules/security.md` — zero-knowledge architecture, token handling, CSP (always loaded)
- `.claude/rules/testing.md` — MSW patterns, E2E conventions, type-only imports
- `.claude/rules/components.md` — theme system, React patterns, component complexity
- `.claude/rules/architecture.md` — architecture patterns, API best practices, environment setup
- `AGENTS.md` is a symlink to this file
