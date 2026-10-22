# Changelog

All notable changes are recorded here. Rules-pack changes are listed separately because they
change legal output and require review.

## [0.1.0] - 2026-10-22

### Added

- Marketing site with the deadline-rail hero, capabilities, guardrails, onboarding steps, and
  pricing.
- Free Michigan FOIA deadline calculator (`/tools/foia-deadline-calculator`).
- Personalized prospect demo (`/demo/[slug]`) with Monday brief, FOIA desk, minutes studio,
  and resident line. First tenant: Cooper Charter Township, Kalamazoo County.
- API: `GET /api/health`, `POST /api/foia/deadline`, `POST /api/events`.
- Optional demo access gate (`src/proxy.ts`).

### Rules pack: Michigan 2026.10.0

- Legal holidays per MCL 435.101 (including Lincoln's Birthday, Juneteenth, Columbus Day).
- FOIA receipt rules per MCL 15.235(1), including the spam-folder rule (1 calendar day after
  awareness).
- FOIA response (5 business days) and single extension (10 business days) per MCL 15.235(2).
- FOIA fee estimation per MCL 15.234 (15-minute increments rounded down, fringe cap 50%,
  $0.10/sheet cap, deposit only above $50, up to one-half).
- Open Meetings Act minutes deadlines per MCL 15.269(3) (8 and 5 business days).
- Status: **not yet attorney-reviewed** (`attorneyReviewed: false`). Required before any
  township goes live in production.
