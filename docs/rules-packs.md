# State rules packs

Everything that changes from one state to the next lives in a rules pack under
`src/lib/rules/<state>/`. The application asks the pack; it never hard-codes a deadline.

## What a pack contains

| Module         | Michigan source  | Responsibility                                                     |
| -------------- | ---------------- | ------------------------------------------------------------------ |
| `holidays.ts`  | MCL 435.101      | Legal holidays for any year, excluded from business-day counts     |
| `foia.ts`      | MCL 15.235       | Receipt rules by channel, response deadline, single extension      |
| `fees.ts`      | MCL 15.234       | Fee itemization, rounding, caps, deposit rule                      |
| `minutes.ts`   | MCL 15.269       | Proposed and approved minutes deadlines                            |
| `citations.ts` | All of the above | Plain-English summaries and source URLs shown in the UI            |
| `index.ts`     | —                | `RulesPack` metadata: version, review date, attorney sign-off flag |

## Michigan rules as implemented (pack 2026.10.0)

**Business days.** Weekdays that are not Michigan legal holidays, whether or not the township
office is open (Michigan Attorney General opinion op10248). Counting excludes the start day
and includes the last day (MCL 8.6).

**Legal holidays (MCL 435.101).** New Year's Day; MLK Day (3rd Mon Jan); Lincoln's Birthday
(Feb 12); Washington's Birthday (3rd Mon Feb); Memorial Day (last Mon May); Juneteenth
(June 19); Independence Day; Labor Day; Columbus Day (2nd Mon Oct); Veterans Day (Nov 11);
Thanksgiving (4th Thu Nov); Christmas. The statute has no weekend "observed" rule, so
fixed-date holidays do not move.

**FOIA receipt (MCL 15.235(1)).**

| Channel                  | Legally received                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| In person, mail          | The day it arrives                                                                         |
| Email, fax, web form     | 1 **business** day after it is sent                                                        |
| Email found in spam/junk | 1 **calendar** day after the township first becomes aware of it (the statute says "1 day") |

**FOIA response (MCL 15.235(2), (7)).** 5 business days after receipt to grant, deny, grant
in part, or issue one extension notice. The extension adds not more than 10 business days to
the original due date, must state reasons, and may be issued once per request.

**FOIA fees (MCL 15.234).** Labor at the hourly wage of the lowest-paid employee capable of
the task. Search and separation labor are chargeable only when not charging would cause
unreasonably high costs, in increments of 15 minutes with partial increments rounded down.
Fringe benefits at up to 50% of labor. Paper at no more than $0.10 per sheet. A good-faith
deposit of up to one-half is allowed only when the estimate exceeds $50.

**Minutes (MCL 15.269(3)).** Proposed minutes available within 8 business days after the
meeting. Approved minutes available within 5 business days after the meeting at which they
are approved.

## Worked examples (all are unit tests)

| Scenario                                    | Result                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Email sent Fri Nov 20, 2026                 | Received Mon Nov 23; due Tue Dec 1 (skips Thanksgiving); extended Tue Dec 15 |
| Walk-in Mon Nov 9, 2026                     | Due Tue Nov 17 (skips Veterans Day)                                          |
| Board meets Mon Oct 12, 2026 (Columbus Day) | Proposed minutes due Thu Oct 22                                              |
| Email found in spam Fri Oct 23, 2026        | Received Sat Oct 24; due Fri Oct 30                                          |

## Changing a pack

1. Change the code and cite the primary source in a comment and in `citations.ts`.
2. Add a test with a real calendar example that would have failed before.
3. Bump `version` in `index.ts` (`YYYY.MM.patch`) and record it in `CHANGELOG.md`.
4. If letter language or a legal interpretation changed, get attorney review and record the
   reviewer's name and date in the changelog.

## Before production

`attorneyReviewed` is `false`. A Michigan municipal attorney must review the deadline rules,
the spam-folder interpretation, the fee logic, and every letter template in
`src/lib/foia/letters.ts` before any township relies on the system for real requests.

## Adding a state

Create `src/lib/rules/<state>/` implementing the same module shapes, with that state's
public-records statute, open-meetings minutes rule, and legal holidays. Widen the tenant
schema's `state` literal, add tests, and add the state to the expansion table in the README. The UI needs no
changes because it only reads from the pack.
