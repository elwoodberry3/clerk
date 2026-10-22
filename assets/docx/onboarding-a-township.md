# Adding a township (demo and client)

A new township is a configuration file plus review. Target time: **1–2 hours for a demo**,
about **20 hours for a paying client** once the platform is templated.

## 1. Create the demo config (about 1 hour)

1. Copy `src/lib/tenants/data/cooper-charter-township.ts` to
   `src/lib/tenants/data/<slug>.ts`. The slug is lowercase and hyphenated, e.g.
   `richland-township`.
2. Fill every field from the township's **public website only**:
   - Name, county, address, main phone, website.
   - Board roster with roles (Supervisor, Clerk, Treasurer, Trustees).
   - Regular meeting rule (`weekOfMonth`, `weekday`, `time`, `location`).
   - FOIA policy URL.
   - Minutes heading and certification line, copied from a recent minutes PDF.
   - 6–8 resident-line FAQs. Each answer must be a paraphrase of a page on their site, with
     that page as `provenance.sourceUrl`. Do not add facts the site does not state.
3. Set every `provenance.status` to `public-site`. Leave fee inputs as `placeholder`.
4. Add internal `salesNotes`: why this township fits, pain signals (late minutes posting,
   one-person clerk office), and timing (elections, budget season). These are never rendered.
5. Register it in `src/lib/tenants/registry.ts`.
6. Run `npm run verify`. The schema test fails on any missing or malformed field.

## 2. Review before sending

- [ ] Open `/demo/<slug>` on desktop and on a phone.
- [ ] Every resident-line answer matches the cited page today.
- [ ] Board names and roles match the township's current site.
- [ ] Sample content does not attribute any action or statement to a real person, and makes
      no claim about real township business.
- [ ] If `DEMO_ACCESS_KEY` is set in production, build the link as
      `https://<domain>/demo/<slug>?key=<key>`.

## 3. Discovery (paying client)

Replace placeholders with confirmed values and set `provenance.status` to `confirmed`:

- Lowest-paid capable employee's hourly wage and the township's fringe percentage for FOIA fees.
- FOIA intake address (create `foia@` routing), letterhead, and signer.
- Which body hears FOIA appeals under the township's procedures.
- Minutes template and where recordings are stored.
- Phone routing: after-hours only, overflow, or full answering.
- FAQ answers the office wants the phone line to give, and what it should never answer.

## 4. Retiring a demo

Remove the tenant file and its registry entry. The URL then returns a 404 page that offers
to send a fresh link.
