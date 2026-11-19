# Bürgerportal Musterstadt: todo list

Completed and verified on 2026-11-19. Plan: `buergerportal-musterstadt-plan.md`. Engineering rules: `docs/engineering-brief.md`. Repeatable checks and demo limits: `docs/verification.md`.

## Done

- [x] Foundation: npm dependencies (drizzle-orm, postgres, drizzle-kit, tsx, fontsource fonts)
- [x] Foundation: `compose.yaml` (Postgres 17 on port 5433, volume, healthcheck), `.env`, `.env.example`, `npm run db:*` scripts
- [x] Foundation: Drizzle schema (`src/lib/server/db/schema.ts`), pushed to the database
- [x] Foundation: seed data (`src/lib/server/db/seed/`): 7 offices, 9 locations, 41 services, 12 users, applications, messages, bescheid, 33 appointments, 16 defects
- [x] Foundation: design tokens, fonts and component classes (`src/routes/layout.css`)
- [x] Foundation: UI primitives (`src/lib/components/ui/`)
- [x] Foundation: header, footer, emergency banner, accessibility tools (Leichte Sprache, hoher Kontrast), demo persona bar
- [x] Foundation: sessions, guards, BundID login with three trust levels, step-up (`TrustChallenge`, `StepUpModal`), persona switch, logout
- [x] Foundation: domain helpers (`src/lib/server/domain.ts`: references, `notify`, `addEvent`, `issueBescheid`)
- [x] Foundation: static pages (Impressum, Datenschutz, Barrierefreiheit)
- [x] Foundation verified: `npm run check` has 0 errors, login flow works in the browser
- [x] Engineering brief for parallel work (`docs/engineering-brief.md`)

## Completed feature areas

- [x] Sub-Task 3: Behördenwegweiser
  - [x] Fix EfA field types and validate consent and trust-based disclosure
  - [x] Verify search, Amt and Lebenslage filters, detail pages and EfA handoff with real HTTP/database checks
- [x] Sub-Task 4: Antrag wizards
  - [x] Fix types, bindings, warnings, server-only client imports and the null-wizard index crash
  - [x] Complete confirmation pages and native/enhanced form handling
  - [x] Verify all three submissions, receipts, instant Bescheid at Hoch and Basis review fallback
  - [x] Verify draft save/resume, server validation, ownership, mismatched routes and duplicate/concurrent submission protection
- [x] Sub-Task 5: Postkorb
  - [x] Fix upload types and validate multipart data server-side
  - [x] Verify server trust gates, browser step-up modal, read state, replies, uploads and ownership
  - [x] Protect thread metadata and reply/receipt trust; disable hover preloading on message links
- [x] Sub-Task 6: Terminvereinbarung
  - [x] Complete appointment cards, four-step booking, calendar and slot grid
  - [x] Confirmation with Termin-Code, rendered QR code, printable ticket and ICS export
  - [x] Cancel and reschedule with ownership checks and Postkorb notifications
  - [x] Verify simultaneous booking, overlapping durations, booking limits and cancellation/reschedule races; return clean conflicts
  - [x] Exercise booking, QR/ICS, rescheduling and cancellation in the browser, including 360px layouts
- [x] Sub-Task 7: Mängelmelder
  - [x] Run self-checks and verify feed, filters, anonymous/authenticated reporting and timeline with real HTTP/database checks
  - [x] Fix server input validation, coordinates, reference collisions and deterministic timeline order
- [x] Sub-Task 8: Sachbearbeiter-Portal
  - [x] Verify visitor/citizen guards and office-scoped decisions
  - [x] Verify Nachforderung, approval with Bescheid, rejection with reason and defect transitions
  - [x] Verify concurrent approval/rejection: one success, one 409, one Bescheid/notification/event
  - [x] Commit the winning assignee in the shared decision transaction; retain a repeatable HTTP/database regression check
- [x] Sub-Task 9: Landing page and citizen dashboard
  - [x] Verify every persona, citizen dashboard and caseworker redirects
  - [x] Include the service count in Leichte Sprache; verify contrast/language persistence and mobile navigation
  - [x] Complete linked routes; remove protected subjects server-side from HTML and serialized dashboard data
  - [x] Disable message preloading and verify dashboard visits leave mail unread
- [x] Integration
  - [x] Dev server running on port 5180; `npm run dev` now defaults to this strict port
  - [x] `npm run check`: zero errors and zero warnings
  - [x] `npm run lint`: Prettier and ESLint clean
  - [x] `npm run build`: standalone Node server generated successfully
  - [x] All seven pure self-check scripts pass; dashboard and decision HTTP/database checks pass
  - [x] 60 persona/route HTTP checks pass on dev and built Node servers; production cross-origin submissions rejected
  - [x] Browser smoke test: all five personas across all 12 main routes, with no runtime exceptions or warnings
  - [x] Replace adapter-auto with adapter-node
  - [x] Document setup, destructive seed commands, demo credentials, deployment and repeatable checks
- [x] Final report to the user

## Known issues and notes

- I stopped another project's dev server by accident: `multi-repo-obs-dashboard` (`vite dev` on port 5173). A broad `pkill -f "vite dev"` killed it. I can't restart it from here because tools are blocked outside this workspace. Run `npm run dev` in that folder to bring it back.
- This project's dev server is running on port 5180. Only the temporary Node verification server on 5181 was stopped after testing; other projects were not touched.
- Subagents sometimes get cancelled before they start (tool result "cancelled"). Check the files on disk before assuming work was lost.
- `#lib/...` imports need the file extension (for example `#lib/trust.ts`), because package `imports` do no extension probing.
- SvelteKit 3 differences: `$app/env` replaces `$app/environment`, `$app/env/private` replaces `$env/*`, and the `Handle` type is in `@sveltejs/kit/hooks`.
- `.bob-dev.*` is in `.gitignore`. It is only a leftover from an earlier dev-server log attempt.
- No test framework was added. Small assert scripts are listed in `docs/verification.md`.
- Authentication, EfA and uploads remain simulated; do not use real personal data or expose the persona switcher publicly. No formal WCAG audit, cross-browser certification, load test or live deployment was performed.
- Appointment schedules are simulated, holidays cover 2026–2027 and exported calendars require manual updates. See `docs/verification.md` for delivery/failure boundaries.
- The production dependency audit is clean. Six moderate development-toolchain advisories remain; no forced upgrades/downgrades were applied.

## Demo access

- Personas: `visitor`, `max-hoch`, `max-basis`, `erika-basis`, `hans-hoch` (floating bar at the bottom of every page).
- Login: password `demo1234`, code or PIN `123456`. Accounts: `max` (all levels), `erika` (Basis only), `hans` (caseworker).
