# Security Policy

## Supported Versions

Only the latest version deployed at [reporemover.xyz](https://reporemover.xyz) is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly. **Do not open a public issue.**

1. **Preferred**: Use [GitHub Security Advisories](https://github.com/moollaza/repo-remover/security/advisories/new) to report privately
2. **Alternative**: Email [hello@reporemover.xyz](mailto:hello@reporemover.xyz) with details

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 72 hours
- **Initial assessment**: Within 1 week
- **Fix or mitigation**: Depends on severity, but we aim for resolution within 30 days

## Scope

### In scope

- Token handling and storage (AES-GCM encryption, secure storage)
- Content Security Policy (CSP) bypasses
- Cross-site scripting (XSS)
- Client-side data leakage
- Privacy violations (token or user data exposure)

### Out of scope

- Vulnerabilities in the GitHub API itself
- Browser vulnerabilities
- Denial of service against reporemover.xyz
- Social engineering attacks
- Issues requiring physical access to a user's device

## Architecture

Repo Remover follows a **zero-knowledge architecture**:

- All GitHub API calls are made client-side in the browser
- No backend server, no cookies, no user-identifiable data collection
- Tokens are never transmitted to any server
- Optional "Remember Me" uses AES-GCM encryption in localStorage
- Error monitoring (Sentry) scrubs tokens and PII before transmission
- Analytics (Fathom) are privacy-first with no cookies
