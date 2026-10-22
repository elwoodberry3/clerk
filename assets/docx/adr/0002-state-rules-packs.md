# ADR 0002: Isolate state law in versioned rules packs

- Status: Accepted
- Date: 2026-10-22

## Context

The product's value is getting the law right. The business plan is to start in Michigan and
expand to other township states (Ohio, Indiana, Pennsylvania, Illinois, Minnesota), each with
its own public-records and open-meetings statutes and legal holidays.

## Decision

All state-specific legal logic lives in `src/lib/rules/<state>/`. It is exposed as pure
functions plus a `RulesPack` metadata object carrying:

- `version`
- `reviewedOn`
- `attorneyReviewed`
- citations for every rule

UI and tenant code depend only on the pack's interface. Each rule ships with a plain-English
summary and source URL that the UI renders next to the result.

## Consequences

- Entering a new state is one new directory plus tests; the app does not change.
- Legal changes are isolated, reviewable diffs with their own CODEOWNERS rule and changelog
  section.
- The `attorneyReviewed` flag makes the production go-live gate explicit and visible in
  `/api/health`.
