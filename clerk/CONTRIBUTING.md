# Contributing

## Workflow

1. Branch from `main`: `feat/…`, `fix/…`, `rules/…` (rules-pack changes), or `tenant/<slug>`.
2. Keep pull requests small and single-purpose. Fill in the PR template checklist.
3. `npm run verify` must pass locally; CI runs the same steps.
4. Squash-merge after one approving review. Rules-pack changes need the CODEOWNERS review.

## Commit messages

Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `rules:`.
Example: `rules(mi): add 2027 Juneteenth observance test`.

## Code standards

- TypeScript `strict` plus `noUncheckedIndexedAccess`. No `any`.
- Business logic lives in `src/lib/` as pure, tested functions. Components render; they do not
  compute deadlines.
- Dates that represent legal days are `CivilDate` (`YYYY-MM-DD`), never `Date`.
- Every legal rule cites its source in code (`MI_CITATIONS`) and has a unit test with a real
  calendar example.
- User-facing copy: plain language, sentence case, active voice. Buttons say what happens
  ("Approve and send"), never "Submit".

## Rules-pack changes

Changes under `src/lib/rules/` change legal output. In the same PR:

- Cite the statute or opinion and link the primary source.
- Add or update tests with worked calendar examples.
- Bump `MICHIGAN_RULES_PACK.version` and add a `CHANGELOG.md` entry under the rules pack.
- If the change affects letter language, note whether attorney review is needed.
