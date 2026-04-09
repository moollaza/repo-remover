---
globs: ["src/**", "next.config.*", "*.config.*"]
description: Zero-knowledge architecture, token handling, CSP — always enforced
alwaysApply: true
---

# Zero-Knowledge Security Architecture

THIS APPLICATION FOLLOWS A STRICT ZERO-KNOWLEDGE ARCHITECTURE FOR MAXIMUM USER PRIVACY.

## Core Security Principles

1. **No Backend Server**: All GitHub API calls are made client-side only
2. **No Data Collection**: No user data, tokens, or analytics data is sent to any backend
3. **Client-Side Only**: Everything happens in the user's browser
4. **Open Source & Auditable**: Users can verify no data leaves their browser

## Authentication Strategy

Personal Access Tokens (PAT) are the ONLY option for client-side GitHub authentication:

- OAuth Web App Flow: Requires client secret (must be server-side) — not viable
- OAuth Device Flow: Requires backend polling infrastructure — not viable
- PKCE: GitHub does NOT support PKCE as of 2025 — not viable
- **Personal Access Tokens**: Client-side only, user-controlled — this is what we use

**Why PAT is optimal:**

- No backend required (maintains zero-knowledge)
- User maintains complete control (generation, scoping, revocation)
- More secure than OAuth for this use case (no client secrets to compromise)
- Industry best practice for client-side GitHub applications

## Security Audit Checklist

Before making changes, verify:

- No API calls to non-GitHub domains
- No token logging or console output in production
- No data persistence beyond localStorage
- No analytics that could identify users
- All sensitive operations happen client-side

## Security Features

- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **Security Headers**: HSTS, frame options, referrer policy
- **Token Sanitization**: GitHub PATs are redacted from error logs
- **Privacy-First**: IP addresses and sensitive data excluded from monitoring

## Important Rules

- NEVER add backend dependencies or server-side token handling
- Do NOT store GitHub token in React state — use encrypted storage only
- Do NOT add console.log in production — use `debug` utility
