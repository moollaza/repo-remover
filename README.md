# Repo Remover

Bulk view, archive, and delete your GitHub repositories. Zero-knowledge — everything runs in your browser.

## Try it now at https://reporemover.xyz

<p>
  <img src="https://img.shields.io/github/license/moollaza/repo-remover.svg?style=flat-square" />
  <a href="https://reporemover.xyz">
    <img src="https://img.shields.io/website/https/reporemover.xyz.svg?style=flat-square" >
  </a>
</p>

## How it works

Repo Remover uses a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with the GitHub API to list your repositories and make changes to them.

1. Provide a Personal Access Token
2. Select which repos to archive or delete
3. Review and confirm your changes

**Zero-knowledge architecture**: Your token never leaves your browser. No backend, no cookies, no user-identifiable data collection. All API calls are made client-side directly to GitHub.

**Note**: Tokens are not stored by default. If you opt-in to "Remember Me", your PAT is encrypted (AES-GCM) and stored in localStorage. For optimal security, create a new token each time and delete it when done.

## Run locally

Requires Node.js >= 22 and [bun](https://bun.sh/).

1. Clone the repository
   ```bash
   git clone https://github.com/moollaza/repo-remover.git
   cd repo-remover
   ```
2. Install dependencies
   ```bash
   bun install
   ```
3. Start the dev server
   ```bash
   bun run dev
   ```
4. Visit http://localhost:5173

### Production build

```bash
bun run build
bun run preview
```

## Testing

```bash
bun run test:unit        # Unit tests (Vitest + RTL + MSW)
bun run test:e2e         # E2E tests (Playwright)
bun run test:e2e:fast    # E2E with fast-fail
bun run test:all         # Unit + E2E
```

## Built with

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [React Router](https://reactrouter.com/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) — testing
- [Sentry](https://sentry.io/) — privacy-first error monitoring
- [Fathom Analytics](https://usefathom.com/ref/E83PFO) — privacy-focused analytics ([public dashboard](https://app.usefathom.com/share/ikjnvhai/repo+remover))
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## AI-assisted development

This repo includes [Claude Code](https://claude.ai/code) configuration in `.claude/` and `CLAUDE.md`. These files help AI-assisted contributors follow project conventions. They're optional — you don't need Claude Code to contribute.

## Author

Zaahir Moolla ([@zmoolla](https://bsky.app/profile/zmoolla.bsky.social), [zaahir.ca](https://zaahir.ca))

## Star History

<a href="https://www.star-history.com/?repos=moollaza%2Frepo-remover&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=moollaza/repo-remover&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=moollaza/repo-remover&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=moollaza/repo-remover&type=date&legend=top-left" />
 </picture>
</a>

## License

[MIT](LICENSE)
