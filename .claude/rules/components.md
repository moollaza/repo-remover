---
globs: ["src/components/**", "*.tsx"]
description: Theme system, React patterns, component complexity guidelines
---

# Component & UI Patterns

## Theme System

Uses CSS custom properties defined in `globals.css` with Tailwind utility classes for proper light/dark theme support.

**DO NOT use hardcoded Tailwind colors** like `bg-gray-100`, `text-black`, `border-gray-200` — these do not adapt to theme changes.

**DO use semantic color classes (defined via CSS custom properties in globals.css):**

- `bg-background` / `text-foreground` — main background and text
- `bg-content1` / `bg-content2` — content area backgrounds
- `border-divider` — border colors that adapt to theme
- `text-default` / `text-primary` — semantic text colors

### Theme Configuration

- **Provider**: Uses `next-themes` with `class` attribute strategy
- **Default Theme**: Light mode by default
- **Theme Persistence**: Automatically saved to localStorage
- **CSS Custom Properties**: Defined in `globals.css` via `@theme` directive, consumed as Tailwind utilities

### Common Theme Issues

- **Black on black text**: Usually caused by hardcoded CSS overriding semantic color custom properties
- **Colors not switching**: Check that you're using semantic color classes, not hardcoded Tailwind colors
- **Layout issues**: Ensure borders and backgrounds use `border-divider` and `bg-content1`

### Testing Dark Theme

- Use `bun run test:e2e:fast theme-basic.spec.ts` for quick theme testing
- Always test both light and dark modes when making UI changes

## React Patterns in Use

- Custom hooks for logic extraction (`useGitHubData`)
- Controlled components pattern (`GitHubTokenForm`, `RepoFilters`)
- Provider-Context pattern for global state (`GitHubDataProvider`)
- State machines with `useReducer` for complex flows (`ConfirmationModal`)
- Strategic memoization (`useMemo`, `useCallback` for performance)

## State Management Rules

- Global state via Context + SWR (auth, user, repos)
- Local state co-located with components (filters, pagination, UI state)
- Never lift state unless multiple components need it
- Compute derived values during render (don't store redundant state)

## Component Organization

- **Presentational components**: Pure UI, minimal logic
- **Container components**: Business logic, context consumers
- **Complex components >200 LOC**: Extract custom hooks
- Co-locate tests (`.test.tsx`)

## Component Complexity Guidelines

| Component LOC | Action Required                              |
| ------------- | -------------------------------------------- |
| < 100 LOC     | Ideal — keep as is                           |
| 100-200 LOC   | Monitor — ensure single responsibility       |
| 200-300 LOC   | Consider — extract hooks or sub-components   |
| > 300 LOC     | Refactor — definitely extract logic to hooks |

## File Organization

- `src/github/` — GitHub API module (queries, scopes, fetcher, client, mutations)
- `src/components/` — reusable UI components with co-located tests
- `src/contexts/` — React contexts for state management
- `src/providers/` — data providers and higher-order components
- `src/utils/` — generic utilities (analytics, debug, motion, secure-storage, sanitize-tokens)
- `src/mocks/` — MSW handlers and test fixtures

## React Best Practices

### When to Use useEffect

- Synchronizing with external systems (WebSocket, third-party library)
- NOT for transforming data for rendering (do during render instead)
- NOT for handling user events (use event handlers instead)

### Performance Optimization

- Only use `useMemo`/`useCallback` when:
  - Calculation is noticeably slow (measure first!)
  - Passing to `memo`-wrapped component
  - Used as dependency in another hook
- Don't prematurely optimize — most calculations are fast

### State Co-location

- Keep state as local as possible
- Lift state only to closest common parent
- Use Context for truly global state (auth, theme)

## Common Pitfalls

**Don't:**

- Use hardcoded Tailwind colors (`bg-gray-100`) — use semantic colors (`bg-content1`)
- Store GitHub token in React state — use encrypted storage only
- Fetch all data upfront — consider pagination for large datasets
- Create tests without provider wrapper — use `render` from test-utils
- Lift state unnecessarily — keep it co-located
- Over-use `useMemo`/`useCallback` — measure first

**Do:**

- Use semantic color classes (from CSS custom properties) for theme compatibility
- Extract hooks from components >200 LOC
- Write tests for all new components
- Use type-only imports for `@octokit/graphql-schema` types
- Check official React docs before using useEffect
