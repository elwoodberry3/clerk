# Township Clerk Agent

**By Adbyrd.** A done-for-you assistant that keeps Michigan township clerks inside two legal
clocks:

- **FOIA responses:** 5 business days, under MCL 15.235.
- **Proposed board minutes:** 8 business days, under MCL 15.269.

It also answers the resident phone line from the township's own website.

This repository contains three things:

- **The public site:** a landing page and a free _Michigan FOIA deadline calculator_.
- **Personalized prospect demos:** one private link per township, built from that township's
  public website. It shows the clerk's week with deadlines computed live.
- **The domain core of the production product:** a tested Michigan rules engine (business
  days, legal holidays, FOIA receipt and deadlines, FOIA fees, minutes deadlines), statutory
  letter drafts, and a typed multi-tenant configuration model.

The first target is **Cooper Charter Township, Kalamazoo County**: `/demo/cooper-charter-township`.

---

## Contents

- [Quick start](#quick-start)
- [What's in the app](#whats-in-the-app)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [The Michigan rules engine](#the-michigan-rules-engine)
- [Tenants: adding a township](#tenants-adding-a-township)
- [Brand and design system](#brand-and-design-system)
- [Quality gates](#quality-gates)
- [Deploying to Vercel](#deploying-to-vercel)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Security and privacy](#security-and-privacy)
- [Accessibility](#accessibility)
- [Expansion to other states](#expansion-to-other-states)
- [Roadmap to production](#roadmap-to-production)
- [Documentation index](#documentation-index)

---

## Quick start

Requirements: **Node.js 22** (see `.nvmrc`) and npm 10.

```bash
git clone git@github.com:<org>/township-clerk-agent.git
cd township-clerk-agent
nvm use
npm ci
cp .env.example .env.local     # optional; every variable has a safe default
npm run dev
```

Open:

| URL                                                  | What you'll see                      |
| ---------------------------------------------------- | ------------------------------------ |
| http://localhost:3000                                | Landing page                         |
| http://localhost:3000/tools/foia-deadline-calculator | Free calculator                      |
| http://localhost:3000/demo/cooper-charter-township   | Cooper Charter Township demo         |
| http://localhost:3000/api/health                     | Health check with rules-pack version |

Before every push:

```bash
npm run verify   # format check, lint, typecheck, tests, production build
```

### Scripts

| Script                    | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `dev`                     | Local development server (Turbopack)                |
| `build` / `start`         | Production build and server                         |
| `lint`                    | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `typecheck`               | `tsc --noEmit` in strict mode                       |
| `test` / `test:watch`     | Vitest unit and API contract tests                  |
| `test:coverage`           | Tests with V8 coverage and enforced thresholds      |
| `format` / `format:check` | Prettier                                            |
| `verify`                  | Everything CI runs, in order                        |

---

## What's in the app

### Landing page (`/`)

This page explains the product to clerks and supervisors. Its hero is a **deadline rail**: a
calendar strip that greys out weekends, hatches and names Michigan legal holidays, and numbers
each business day. The example is a real case: an email sent the Friday before Thanksgiving
2026 is due Tuesday, December 1. Below the hero are capabilities with statute citations,
guardrails, a three-step onboarding path, and fixed pricing.

### FOIA deadline calculator (`/tools/foia-deadline-calculator`)

A free, public lead-generation tool. Enter the date and channel to get:

- the legal receipt date
- the response due date
- the extension deadline
- the deadline rail and the statutes behind the result

It handles the spam-folder rule.

### Prospect demo (`/demo/[slug]`)

A private, `noindex` demo personalized to one township. It has four screens:

| Screen            | What the clerk sees                                                                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monday brief**  | Greeting by first name; what needs a signature; a two-week deadline rail; what got done                                                                                                                                                                                                       |
| **FOIA desk**     | Inbox of requests with legal receipt dates, due dates, and extension limits. Each has a drafted letter on township letterhead, an itemized fee estimate under MCL 15.234, exemption flags, and a checklist of required statutory elements. The button reads "Approve and send," never "Send." |
| **Minutes**       | Draft minutes in the township's own heading and certification format, motions and votes, and the Open Meetings Act clock                                                                                                                                                                      |
| **Resident line** | A try-it-yourself conversation answering from the township's website, with source links; anything unknown becomes a message for the office                                                                                                                                                    |

Every sample is built **relative to today** in America/Detroit. Requests are always a few
business days old and deadlines always upcoming, whatever day the link is opened.

**What is real vs. sample:** township facts, resident-line answers, and all deadline math are
real. Requests, requesters, call counts, and meeting business are labeled samples. Fee wages
are placeholders until discovery. See [`docs/demo-playbook.md`](docs/demo-playbook.md).

---

## Tech stack

| Concern     | Choice                                                            | Why                                                                                                                                               |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | **Next.js 16** (App Router, Turbopack, `proxy.ts`)                | Server components, per-request rendering for live dates, first-class Vercel deploys                                                               |
| Language    | **TypeScript 6**, `strict` + `noUncheckedIndexedAccess`           | Legal logic must not have silent `undefined`s                                                                                                     |
| UI          | **React 19**, **Tailwind CSS 4** (CSS-first `@theme` tokens)      | Tokens map 1:1 to the brand guide                                                                                                                 |
| Typeface    | **Public Sans** (self-hosted via Fontsource)                      | The U.S. Web Design System typeface. It reads as civic and trustworthy to public officials, and needs no third-party font requests (CSP-friendly) |
| Validation  | **Zod 4**                                                         | Tenant configs, API bodies, analytics events, fee inputs                                                                                          |
| Tests       | **Vitest 5** + V8 coverage                                        | Fast, ESM-native; thresholds enforced in CI                                                                                                       |
| Lint/format | ESLint 9 (flat config), Prettier 3                                | Standard Next.js rules plus consistent type imports                                                                                               |
| Hosting     | **Vercel** (`cle1`, Cleveland, closest region to Michigan)        | Zero-config deploys, preview URLs per PR                                                                                                          |
| Analytics   | Vercel Web Analytics (on Vercel only) + first-party `/api/events` | Page views, plus demo engagement without third-party trackers                                                                                     |

---

## Project structure

```
.
├── .github/
│   ├── workflows/ci.yml          # format, lint, typecheck, tests + coverage, build, audit
│   ├── dependabot.yml            # weekly grouped dependency updates
│   ├── CODEOWNERS                # extra review on legal rules
│   └── pull_request_template.md
├── docs/
│   ├── architecture.md           # layers, request flow, production target (Mermaid)
│   ├── rules-packs.md            # Michigan law as implemented, worked examples
│   ├── onboarding-a-township.md  # adding a demo or client
│   ├── demo-playbook.md          # Cooper rationale + 20-minute walkthrough script
│   ├── security.md               # controls, trade-offs, production requirements
│   └── adr/                      # architecture decision records
├── src/
│   ├── app/                      # routes (App Router)
│   │   ├── page.tsx              # landing
│   │   ├── demo/[slug]/page.tsx  # per-township demo (dynamic, noindex)
│   │   ├── tools/foia-deadline-calculator/page.tsx
│   │   ├── api/                  # health, foia/deadline, events (+ contract tests)
│   │   ├── layout.tsx, globals.css, icon.svg, robots.ts, sitemap.ts, not-found.tsx
│   ├── components/               # shared UI: DeadlineRail, brand mark, site chrome
│   ├── features/
│   │   ├── demo/                 # DemoApp shell + MondayBrief, FoiaDesk, MinutesStudio, ResidentLine
│   │   └── calculator/           # FoiaCalculator
│   ├── lib/                      # pure domain logic, 100% framework-free
│   │   ├── dates/                # CivilDate type, business-day arithmetic
│   │   ├── rules/michigan/       # holidays, FOIA, fees, minutes, citations, rules-pack metadata
│   │   ├── foia/letters.ts       # grant / extension / partial-denial drafts
│   │   ├── tenants/              # Zod schema, registry, data/<slug>.ts
│   │   ├── demo/scenario.ts      # relative-date sample data builder
│   │   ├── resident-line/        # deterministic FAQ matcher
│   │   ├── analytics/            # event schema + client beacon
│   │   └── env.ts                # validated public configuration
│   └── proxy.ts                  # optional demo access gate
├── next.config.ts                # security headers, demo/API cache rules
├── vercel.json                   # region, install/build commands
└── vitest.config.ts              # test + coverage thresholds
```

**Layering rule:** `src/lib` never imports from `src/app`, `src/features`, or React. Components
render results from `src/lib`; they never compute a deadline themselves.

---

## The Michigan rules engine

All legal logic is in `src/lib/rules/michigan/`. Every rule cites its source and is covered by
tests with real 2026–2027 calendar examples.

| Rule                                                                                                             | Statute                  | Implementation           |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------ |
| Business days exclude weekends and legal holidays, open or not                                                   | Mich. AG opinion op10248 | `dates/business-days.ts` |
| Counting excludes the first day, includes the last                                                               | MCL 8.6                  | `addBusinessDays`        |
| Legal holidays, incl. Lincoln's Birthday, Juneteenth, Columbus Day                                               | MCL 435.101              | `holidays.ts`            |
| Email, fax, and web requests received 1 business day after sending                                               | MCL 15.235(1)            | `computeFoiaDeadlines`   |
| Email found in spam: received 1 _calendar_ day after awareness                                                   | MCL 15.235(1)            | `computeFoiaDeadlines`   |
| Respond within 5 business days; one extension of up to 10                                                        | MCL 15.235(2), (7)       | `computeFoiaDeadlines`   |
| Denials must contain five elements and be signed                                                                 | MCL 15.235(5), (6)       | `foia/letters.ts`        |
| Fees: lowest-paid capable wage, 15-min increments rounded down, ≤50% fringe, ≤$0.10/sheet, deposit only over $50 | MCL 15.234               | `estimateFoiaFee`        |
| Proposed minutes in 8 business days; approved in 5 after approval                                                | MCL 15.269(3)            | `minutes.ts`             |

Worked examples (all tested):

```
Email sent Fri 2026-11-20 → received Mon 11-23 → due Tue 12-01 (skips Thanksgiving) → extended Tue 12-15
Walk-in   Mon 2026-11-09 → due Tue 11-17 (skips Veterans Day)
Board meets Mon 2026-10-12 (Columbus Day) → proposed minutes due Thu 10-22
```

> **Production gate.** `MICHIGAN_RULES_PACK.attorneyReviewed` is `false`. A Michigan
> municipal attorney must review the rules and letter templates before any township relies on
> them for real requests. The flag is exposed at `/api/health`.

Full detail: [`docs/rules-packs.md`](docs/rules-packs.md).

---

## Tenants: adding a township

A township is one typed file, `src/lib/tenants/data/<slug>.ts`, validated by a Zod schema at
build time. A malformed config fails CI instead of a prospect's demo. Every fact carries
provenance:

```ts
provenance: { sourceUrl: "https://www.coopertwp.org/taxes/", status: "public-site" }
//                                                          "public-site" | "confirmed" | "placeholder"
```

Steps (about 1–2 hours per demo):

1. Copy `cooper-charter-township.ts` and fill it from the township's public website only.
2. Register it in `src/lib/tenants/registry.ts`.
3. Run `npm run verify` and review the demo on desktop and mobile.

Step-by-step checklist: [`docs/onboarding-a-township.md`](docs/onboarding-a-township.md).

---

## Brand and design system

Light mode only, per the Adbyrd brand guide. Tokens are defined once in
`src/app/globals.css` (`@theme`):

| Token                   | Hex                   | Role                                       |
| ----------------------- | --------------------- | ------------------------------------------ |
| `ocean-600`             | `#1F70A6`             | Primary actions, links, focus rings        |
| `navy-700`              | `#1A4B7C`             | Headings, app chrome, pricing band         |
| `green-600`             | `#2D8C55`             | On time, success, confirmations            |
| `slate-ink`             | `#4A4D4E`             | Body text                                  |
| `paper`                 | `#F4F7FA`             | Page background (cool, not cream)          |
| `amber-700` / `red-700` | `#94570A` / `#A5281C` | **Deadline states only**, never decoration |

Design principles:

- **One signature element.** The deadline rail shows _why_ the math is hard: holidays are
  named on the calendar. Everything else stays quiet.
- **Civic, not startup.** Public Sans, left-aligned layouts, tables and lists over card
  grids, plain-language copy in sentence case.
- **Trust is visible.** Statute citations sit beside every computed date. Sample content is
  labeled. The primary button always names the approval ("Approve and send").
- **Brand mark.** The Adbyrd "A" is inlined from the brand SVG (`AdbyrdMark`) and is also the
  favicon (`src/app/icon.svg`).

---

## Quality gates

CI (`.github/workflows/ci.yml`) runs on every PR and on `main`:

1. `npm ci` (lockfile-exact install)
2. Prettier check
3. ESLint
4. TypeScript strict typecheck
5. Vitest with coverage thresholds: **90% statements, lines, and functions; 80% branches**.
   Current coverage is about 95%.
6. Production build
7. `npm audit --omit=dev --audit-level=high`

Test suites:

| File                                  | Covers                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/dates/civil-date.test.ts`        | Date validation, rollover, DST immunity, Michigan "today"                                                                                               |
| `lib/rules/michigan/michigan.test.ts` | Holidays, business days, FOIA receipt/deadlines, urgency, minutes, fees                                                                                 |
| `lib/domain.test.ts`                  | Tenant schema, meeting schedule, demo scenario invariants (never overdue on any date), letters' statutory elements, resident-line matching and fallback |
| `app/api/api.test.ts`                 | API contracts: success, malformed JSON, invalid dates, unknown fields, oversized payloads                                                               |

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository. The framework is detected as
   Next.js. `vercel.json` pins `npm ci`, the build command, and the `cle1` region.
3. Set environment variables (Production and Preview); see [Configuration](#configuration).
4. Add the domain, e.g. `clerk.adbyrd.com`, and set `NEXT_PUBLIC_SITE_URL` to match.
5. Turn on **Web Analytics** in the Vercel project. The `<Analytics />` component renders only
   when `VERCEL` is set.
6. Every pull request gets a preview URL. Protect `main` with required CI checks and one
   approving review.

Post-deploy smoke test:

```bash
curl -s https://clerk.adbyrd.com/api/health
curl -sI https://clerk.adbyrd.com/demo/cooper-charter-township | grep -i x-robots-tag
```

---

## Configuration

All variables are optional; defaults are safe for a demo deployment.

| Variable                  | Default                    | Purpose                                                                         |
| ------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | `https://clerk.adbyrd.com` | Canonical URLs, sitemap                                                         |
| `NEXT_PUBLIC_SALES_EMAIL` | `support@adbyrd.com`       | Contact links                                                                   |
| `NEXT_PUBLIC_SALES_PHONE` | `+1 (888) 712-1694`        | Contact links                                                                   |
| `DEMO_ACCESS_KEY`         | _(unset)_                  | When set, `/demo/*` requires `?key=<value>` once, then a 30-day HttpOnly cookie |

Public variables are validated with Zod at build (`src/lib/env.ts`); an invalid value fails the
build.

---

## API reference

All endpoints return `Cache-Control: no-store`.

### `GET /api/health`

```json
{
  "status": "ok",
  "commit": "a1b2c3d",
  "rulesPack": { "state": "MI", "version": "2026.10.0", "attorneyReviewed": false },
  "tenants": 1
}
```

### `POST /api/foia/deadline`

Request (`channel`: `email` | `fax` | `web-form` | `in-person` | `mail`):

```json
{ "submittedOn": "2026-11-20", "channel": "email", "discoveredInSpamOn": "2026-11-23" }
```

Response `200`:

```json
{ "receivedOn": "2026-11-23", "responseDueOn": "2026-12-01", "extendedDueOn": "2026-12-15",
  "receiptRule": "Electronic request: received 1 business day after it was sent.",
  "rulesPack": { "state": "MI", "version": "2026.10.0" }, "citations": [ ... ] }
```

Errors: `400` malformed JSON, `422` invalid date, unknown field, or spam date before
submission.

### `POST /api/events`

First-party demo engagement, written to structured logs. It accepts only enumerated names:

- `demo_opened`
- `demo_tab_viewed`
- `foia_request_opened`
- `foia_letter_approved`
- `resident_question_asked`
- `calculator_used`

The optional `tenant` and `detail` fields must be slug-shaped. Payloads are capped at 1 KB and
the endpoint returns `204`. This answers the sales question "which screen did the clerk spend
time on?" without collecting personal data.

---

## Security and privacy

- Strict security headers on every response: CSP, HSTS preload, `frame-ancestors 'none'`,
  `nosniff`, and Permissions-Policy.
- Demos are `noindex, nofollow, noarchive`, `private, no-store`, and excluded from
  `robots.txt` and the sitemap. They are never linked from public pages, and the slug index
  is never exposed.
- Optional demo gate in `src/proxy.ts`. The key is removed from the URL after the first visit.
- All inputs are validated with strict Zod schemas; unknown fields are rejected.
- No resident data, township records, or secrets are in this repository.

Details, trade-offs (CSP nonce upgrade), and production requirements:
[`docs/security.md`](docs/security.md). To report a vulnerability, see
[`SECURITY.md`](SECURITY.md).

---

## Accessibility

Target: **WCAG 2.2 AA**.

- Skip link, landmarks, and one `h1` per view.
- Tabs use `role="tablist"` with `aria-selected` and `aria-controls`.
- The resident-line log is an `aria-live` region.
- Every deadline-rail cell has a full spoken label, e.g. "Thu, Nov 26, Thanksgiving Day."
- Visible 3px focus rings; colour is never the only signal (badges carry text).
- `prefers-reduced-motion` is respected; tables have captions; form fields have labels.

---

## Expansion to other states

The app is state-agnostic. All law sits in a rules pack (see
[ADR 0002](docs/adr/0002-state-rules-packs.md)). Adding a state means:

1. Create `src/lib/rules/<state>/` with holidays, public-records receipt and deadlines, fees,
   minutes, and citations.
2. Write tests with worked calendar examples.
3. Widen the tenant schema's `state` field.
4. Get municipal-attorney review of the letter templates.

| State        | Townships (2017 Census of Governments) | Status                                             |
| ------------ | -------------------------------------- | -------------------------------------------------- |
| Michigan     | 1,240                                  | **Rules pack 2026.10.0** (pending attorney review) |
| Ohio         | 1,308                                  | Planned                                            |
| Indiana      | 1,000+                                 | Planned                                            |
| Pennsylvania | 1,546                                  | Planned                                            |
| Illinois     | 1,429                                  | Planned                                            |
| Minnesota    | 1,780                                  | Planned                                            |

---

## Roadmap to production

| Phase                                   | Scope                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Now (this repo)**                     | Public site, calculator, personalized demos, tested Michigan rules core                                                                                                                 |
| **Design partners (first 3 townships)** | Postgres with per-tenant row-level security; authentication with MFA for township staff; real `foia@` intake; letter generation to DOCX/PDF on letterhead; immutable approval audit log |
| **Minutes**                             | Recording upload, transcription with speaker labels, LLM-drafted minutes in the tenant template (human approval required)                                                               |
| **Resident line**                       | Twilio number + voice agent grounded only on approved FAQ records; after-hours and overflow routing; call summaries                                                                     |
| **Operations**                          | Deadline scheduler and reminders, Monday brief email, monthly board report, uptime and error monitoring, data processing agreements with each subprocessor                              |

Production keeps the same rule as the demo: **the agent drafts; a named township official
approves.**

---

## Documentation index

| Document                                                                  | Read when                                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`docs/architecture.md`](./assets/docx/architecture.md)                   | You need the big picture or the production target    |
| [`docs/rules-packs.md`](./assets/docx/rules-packs.md)                     | You are touching legal logic                         |
| [`docs/onboarding-a-township.md`](./assets/docx/onboarding-a-township.md) | You are adding a demo or client                      |
| [`docs/demo-playbook.md`](./assets/docx/demo-playbook.md)                 | You are about to show the Cooper demo                |
| [`docs/security.md`](./assets/docx/security.md)                           | You are reviewing controls or planning production    |
| [`docs/adr/`](./assets/docx/adr)                                          | You want the reasoning behind a design decision      |
| [`CONTRIBUTING.md`](./clerk/CONTRIBUTING.md)                              | Before your first pull request                       |
| [`CHANGELOG.md`](./clerk/CHANGELOG.md)                                    | You need what changed, including rules-pack versions |

---

© 2026 Adbyrd. Proprietary; see [`LICENSE`](LICENSE). Nothing in this repository is legal
advice.
