# Security and privacy

## Data handled by this repository

| Data                                          | Where                     | Sensitivity                     |
| --------------------------------------------- | ------------------------- | ------------------------------- |
| Township public facts (roster, address, FAQs) | Tenant config in Git      | Public                          |
| Sample FOIA requests and minutes              | Generated at request time | Fictional                       |
| Demo engagement events                        | Structured logs           | Enumerated names and slugs only |

No resident data, township records, credentials, or secrets are stored in this repository.

## Controls

**Transport and browser.** Every response sets the following:

- `Content-Security-Policy` (same-origin scripts, `frame-ancestors 'none'`, `object-src 'none'`)
- `Strict-Transport-Security` (2 years, preload)
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- A restrictive `Permissions-Policy`

**Demos.** These are private sales assets:

- `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-store`
- Excluded from `robots.txt` and the sitemap, and never linked from public pages
- Optional `DEMO_ACCESS_KEY` gate in `src/proxy.ts`. The first visit carries `?key=`; the
  proxy sets a 30-day `HttpOnly; Secure; SameSite=Lax` cookie scoped to `/demo` and redirects
  to the clean URL so the key does not stay in history or referrers.

**APIs.** Input is handled as follows:

- Zod validation with `.strict()` objects (unknown fields rejected)
- Explicit 400 / 413 / 422 responses
- `Cache-Control: no-store`
- The events endpoint caps payloads at 1 KB and accepts only enumerated event names and
  slug-shaped values, so free text and personal data cannot be logged.

**Supply chain.** These checks run continuously:

- Pinned dependency versions with a committed lockfile and `npm ci` in CI
- `npm audit --omit=dev --audit-level=high` on every PR
- Weekly Dependabot PRs

## Known trade-offs and upgrade path

- **CSP `'unsafe-inline'` for scripts.** This is required by Next.js hydration without a
  nonce. To harden, generate a per-request nonce in `src/proxy.ts`, pass it via a request
  header, and switch `script-src` to `'nonce-…' 'strict-dynamic'`. Every page is already
  dynamic or cheap to render, so the cost is small.
- **Demo gate.** This is a shared key per environment. For per-prospect revocation, store a
  hash of a per-tenant key in the tenant config and compare in the proxy.

## Production system (future)

The live product will process real FOIA requests and resident calls. Before launch, it needs
the following:

- Per-tenant row-level security in Postgres
- Encryption at rest
- Multi-factor authentication for township users
- An immutable audit log for every approval
- A written retention policy aligned with the township's records-retention schedule
- A data processing agreement with each subprocessor (LLM, telephony, transcription, email)
