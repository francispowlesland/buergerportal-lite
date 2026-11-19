# Verification record

Recorded on 19 November 2026 against the existing seeded PostgreSQL 17 database. The development server is at <http://localhost:5180>; the Node adapter build was also exercised on port 5181. Node.js: 24.16.0.

Verification creates fictional applications, messages, users, appointments and defect reports. Those records remain for inspection; seed records were not deleted or reseeded. All verification-created appointments were cancelled afterwards.

## Repeatable checks

```sh
npm run check
npm run lint
npm run build
npx tsx src/lib/server/auth/redirect.check.ts
npx tsx src/lib/components/services/services.check.ts
npx tsx src/lib/server/wizards/validation.check.ts
npx tsx src/lib/components/postkorb/postkorb.check.ts
npx tsx src/lib/server/appointments.check.ts
npx tsx src/lib/components/map/maengelmelder.check.ts
npx tsx src/lib/components/admin/rules.check.ts
```

These checks need a running app and the demo database:

```sh
npx tsx src/lib/server/portal.check.ts
npx tsx --env-file=.env src/lib/components/home/dashboard.http.check.ts
npx tsx --env-file=.env src/lib/components/admin/decisions.http.check.ts
```

`portal.check.ts` checks all five personas across 12 main routes, including citizen redirects and caseworker access denial. The dashboard check exercises HTML and serialized page data: protected subjects stay hidden at Basis and from other users, and merely visiting the dashboard does not mark mail as read. The decision check creates fresh fixtures and verifies approval, rejection and concurrent decisions, including the assignee, issuer, notification and audit trail.

SvelteKit 3 intentionally skips Origin enforcement in development. Test CSRF against the built server, not Vite. In a separate terminal, with port 5181 free:

```sh
HOST=127.0.0.1 PORT=5181 ORIGIN=http://localhost:5181 BODY_SIZE_LIMIT=32M node --env-file=.env build
```

Then:

```sh
PORTAL_URL=http://localhost:5181 CHECK_CSRF=1 npx tsx src/lib/server/portal.check.ts
PORTAL_URL=http://localhost:5181 npx tsx --env-file=.env src/lib/components/home/dashboard.http.check.ts
```

## Runtime journeys

Feature-area checks used real HTTP requests and database assertions, not mocked repositories:

- Directory: text search, office and life-event filters, details, EfA consent and trust-based data disclosure.
- Applications: all three wizards, saved drafts, native/enhanced form input, validation, ownership, route mismatches and duplicate/concurrent submissions. Hoch Meldebescheinigung receives an instant Bescheid; Basis remains submitted for review. Every successful submission creates one submission event and its Postkorb receipt.
- Postkorb: ownership, locked content and metadata, read/unread state, replies, valid uploads and rejected submissions without writes. Sensitive replies and receipts retain the thread’s trust requirement.
- Appointments: booking, unique codes, QR generation, ICS, rescheduling and cancellation. Concurrent slot booking, duration overlaps and booking limits fail cleanly. Foreign records return 404; cancelled ICS exports return 410.
- Defects: anonymous and signed-in reports, validation, map coordinates, feed filters, timeline order and staff status changes.
- Caseworkers: visitors redirect to login; citizens receive 403. Decisions require the correct office. Nachforderung, approval and reasoned rejection reach the citizen’s Postkorb. Concurrent approval/rejection produces one success, one 409, and exactly one Bescheid, notification and decision event. Assignment commits in the same transaction as the decision.
- Dashboard: protected subjects are removed on the server, including from page-data responses. Inbox links disable data preloading to avoid hover-triggered read state changes.

Browser checks cover all five personas across all 12 main routes (60 checks), with no runtime exceptions or warnings in the final sweep. They also cover Basis login failures/success, ELSTER and eID step-up, Erika’s Basis-only restriction, and the Postkorb step-up modal unlocking a printable Bescheid. The Meldebescheinigung was submitted through the browser and received its instant decision. Appointment booking, QR display, ICS, rescheduling and cancellation were exercised through the UI. The landing page and booking/confirmation views fit a 360px viewport. Leichte Sprache includes the service count; language and contrast preferences survive reload.

## Boundaries

- BundID, ELSTER, eID, EfA, photos and document uploads are simulations. File contents are not retained. The persona bar deliberately bypasses authentication for demonstration.
- Appointment schedules are simulated; the holiday list covers 2026–2027. Calendar exports must be replaced or removed manually after changes. Appointment Postkorb delivery is best-effort; the appointment itself remains the source of truth.
- Instant Bescheid issuance has its own transaction. An issuance failure retains the submitted application and receipt so staff can process the case rather than losing it.
- `db:setup` and `db:seed` erase the demo database. They were not rerun during verification.
- No real identity provider, external municipal service, printer, formal WCAG audit, load test or public deployment was exercised. Browser checks used Chromium, not a cross-browser certification matrix.
- `npm audit --omit=dev` reports no production dependency advisories. The full audit reports six moderate development-toolchain findings (Drizzle’s legacy esbuild loader and Tailwind typography’s selector parser). No forced dependency downgrade or broad upgrade was applied.
- Formatting excludes imported agent-tooling bundles, including skill documentation with deliberately invalid code examples; application source remains fully linted.
