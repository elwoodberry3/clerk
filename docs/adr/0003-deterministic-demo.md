# ADR 0003: Keep prospect demos deterministic (no LLM at runtime)

- Status: Accepted
- Date: 2026-10-22

## Context

The demo link goes to elected officials. A single invented answer ("winter taxes are due
March 1") would cost credibility we cannot recover. Demos also need to cost nothing to run
and must work the same on every open.

## Decision

The demo uses no model at runtime:

- **FOIA letters** come from statutory templates in `src/lib/foia/letters.ts`.
- **Sample requests** come from fixed seeds placed relative to today.
- **Resident-line replies** come from a keyword matcher over FAQ records copied from the
  township's own website, each with a source link. When nothing matches, the agent takes a
  message and does not guess.

## Consequences

- Every answer a prospect sees is traceable to a source URL or a statute.
- The demo understates the production agent's flexibility. The walkthrough script covers this
  by explaining that the live system speaks naturally but is grounded on the same approved
  records.
- Production will use an LLM (Claude API) for classification, drafting, and voice. It will
  stay grounded on the same tenant records and gated by human approval.
