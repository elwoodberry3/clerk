# ADR 0001: Represent legal dates as civil dates, not instants

- Status: Accepted
- Date: 2026-10-22

## Context

FOIA and Open Meetings Act deadlines are counted in calendar days ("5 business days after").
JavaScript `Date` is an instant in time. Using it for calendar days invites off-by-one errors
around midnight, daylight-saving changes (US DST ends Nov 1, 2026, inside the busiest FOIA
season), and Vercel functions running in UTC while townships are in America/Detroit.

## Decision

Legal dates are a branded string type, `CivilDate` (`YYYY-MM-DD`). Arithmetic converts to a
UTC noon timestamp internally, which cannot cross a date boundary under any DST rule, and
converts back immediately. "Today" is derived explicitly with `todayIn("America/Detroit")`.

## Consequences

- Dates serialize trivially between server and client components and in JSON APIs.
- String comparison orders dates correctly, so no library is needed.
- Instants (when an email arrived, to the minute) will need a separate type when production
  intake handles time-of-day rules. They must be converted to a `CivilDate` in the township's
  zone before any deadline is computed.
