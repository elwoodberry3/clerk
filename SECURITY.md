# Security policy

## Reporting a vulnerability

Email **support@adbyrd.com** with the subject line `SECURITY`. Include steps to reproduce and
the affected URL or commit. Do not open a public issue.

We acknowledge reports within 2 business days and aim to fix high-severity issues within 7
calendar days.

## Scope and posture

This repository serves a public marketing site, a public calculator, and private prospect
demos. It holds no township records and no resident personal data. The controls below are
described in more detail in [`docs/security.md`](docs/security.md).

- Strict security headers (CSP, HSTS with preload, `frame-ancestors 'none'`, `nosniff`,
  restrictive `Permissions-Policy`) on every response.
- Demos are `noindex`, `no-store`, excluded from the sitemap and `robots.txt`, and optionally
  gated by `DEMO_ACCESS_KEY` with an HttpOnly cookie.
- Every API input is validated with Zod; unknown fields are rejected; payloads are size-capped.
- First-party analytics accept only enumerated event names and slug-shaped values, so free text
  and personal data cannot be recorded.
- `npm audit` for production dependencies runs in CI; Dependabot opens weekly update PRs.
