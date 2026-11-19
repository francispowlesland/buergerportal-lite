# Engineering brief: Bürgerportal Musterstadt

Shared rules for everyone building a feature area. Read this, `AGENTS.md`, and `buergerportal-musterstadt-plan.md` first.

## Ground rules (parallel work!)

Several engineers work at the same time in the same checkout, each in their own folder.

- **Only create/edit files in your own area** (listed in your task). Never edit shared files: `src/routes/layout.css`, `+layout.svelte`, `+layout.server.ts`, `src/lib/server/db/schema.ts`, `src/lib/components/ui|chrome|auth|demo/*`, `src/lib/server/domain.ts`, `src/hooks.server.ts`, `package.json`. If you need a change there, do the best workaround inside your area and mention it in your final report.
- **Do not run** `npm install`, `npm run format`, `npm run lint` on the whole repo, `npm run db:*`, `pkill`/`killall`, or start/stop dev servers. A dev server is already running at **http://localhost:5180** with hot reload, PostgreSQL is up and seeded. (Exception: the Termine engineer may `npm install qrcode`, see their task.)
- Format only your own files: `npx prettier --write <your paths>`; lint only your own files: `npx eslint <your paths>`.
- Typecheck with `npm run check`. Other engineers' half-finished files may show errors; fix only errors in your files.
- **Do not use the Playwright browser tools** (one shared browser, shared cookies). Test with `curl` using a cookie jar. Switch persona: `curl -c jar -b jar -i -X POST http://localhost:5180/auth/persona -H 'Origin: http://localhost:5180' -d 'persona=max-hoch&redirectTo=/'` (personas: `visitor`, `max-hoch`, `max-basis`, `erika-basis`, `hans-hoch`). Form actions need the `Origin` header. Check HTML via `curl -b jar http://localhost:5180/...`.
- **Do not create tests frameworks.** A tiny `tsx` self-check script is fine for non-trivial pure logic (put it next to the code, e.g. `availability.check.ts`), keep it small.

## Stack facts (SvelteKit 3 / Svelte 5 / Tailwind 4 – differs from what you may remember!)

- Read `.agents/skills/svelte-core-bestpractices/SKILL.md` and `.agents/skills/svelte-code-writer/SKILL.md`. Run `npx @sveltejs/mcp svelte-autofixer <file.svelte>` on **every** component you write and fix what it reports. Look up docs with `npx @sveltejs/mcp get-documentation "<section>"` when unsure.
- Runes only: `$props`, `$state`, `$derived`, `{@render}`, `onclick={}`. Use keyed `{#each}`. No `export let`, no `$:`, no `<slot>`, no `on:click`, no stores. Prefer `$derived` over `$effect`.
- Import shared code through `#lib/...` and **always with the file extension**: `#lib/trust.ts`, `#lib/server/db/index.ts`, `#lib/components/ui/Alert.svelte`. `$lib` does not exist. Relative imports inside your folder are fine.
- `$app/environment` is now `$app/env`; private env via `$app/env/private` (only `DATABASE_URL`, already used in `db/index.ts`; do not use it yourself). Page state: `import { page } from '$app/state'`. `invalidateAll` is deprecated: use `refreshAll` from `$app/navigation`. `goto` options: `replace`, `reset: false` (instead of keepFocus/noScroll), `refreshAll`. Types `Handle` etc. live in `@sveltejs/kit/hooks`. Use `Response.json()` instead of `json()`.
- `use:enhance` with a form `action` on another page navigates there after submit.
- Data access: `import { db, <tables> } from '#lib/server/db/index.ts'` (drizzle, postgres-js). Only in `+page.server.ts` / `+server.ts` / `src/lib/server/**`. Schema: `src/lib/server/db/schema.ts` (read it fully). Seed data: `src/lib/server/db/seed/` (read to know what exists).
- Auth: `locals.user` (full user row or null), `locals.trust` (trust level of the live session), `locals.sessionId`. Guards in `#lib/server/auth/guards.ts`: `requireUser`, `requireCitizen(ctx, minTrust?)`, `requireCaseworker(ctx)` – call as `requireCitizen({ locals, url }, 'basis')`. Trust helpers in `#lib/trust.ts` (`meetsTrust`, `TRUST_LABELS`, …). Step-up UI: `<StepUpModal bind:open required="hoch" />` from `#lib/components/auth/StepUpModal.svelte` (after success the server redirects back to the current URL and load re-runs).
- Domain helpers in `#lib/server/domain.ts`: `newReference('MS')`, `newVerificationCode()`, `newToken()`, `addEvent()`, `notify()` (Postkorb message), `issueBescheid()` (creates Bescheid + Postkorb message that needs trust Hoch + updates application + audit trail). Reuse them, do not reimplement.
- Shared lib: `#lib/labels.ts` (status/category/Lebenslagen labels and tones), `#lib/format.ts` (`formatDate`, `formatDateTime`, `formatFee`, …, Europe/Berlin), `#lib/applicationData.ts` (shape of `applications.data` per wizard), `#lib/geo.ts` (mock map projection), `#lib/personas.ts`.
- Mutations: SvelteKit form actions + `use:enhance`, with **server-side validation** and `fail(400, { ... })`. Citizen data and trust level are always taken from `locals`, never from the form. Check ownership (`application.userId === locals.user.id`) on every read/write of personal data.
- UI components in `src/lib/components/ui/`: `PageHeader` (title, lead, crumbs, actions snippet), `Alert` (tone, title), `Stempel` / `StatusStempel` / `TrustBadge` (rubber-stamp badges), `Breadcrumbs`, `Modal`, `Stepper`, `EmptyState`, `Ortsschild`, `Leicht` (standard vs Leichte Sprache text). CSS classes from `layout.css`: `panel`, `panel-quiet`, `panel-head`, `btn`, `btn-primary`, `btn-danger`, `btn-ghost`, `btn-sm`, `field-label`, `field-hint`, `field-error`, `stempel*`, `aktenzeichen`, `visually-hidden`, `no-print`; plain `input/select/textarea` are already styled. Tailwind colour tokens: `paper`, `sheet`, `ink`, `ink-soft`, `rule`, `amt-50/100/300/500/700/900`, `signal-50/600/800`, `status-50/600/800`, `warn-50/700`, `ortsschild`. Fonts: `font-sans` (Atkinson Hyperlegible Next), `font-display` (Archivo, use `style="font-stretch: 112%"` or rely on heading defaults), `font-serif` (Source Serif 4: use for official letters).
- Every page: `<svelte:head><title>… – Bürgerportal Musterstadt</title></svelte:head>`, one `<h1>` (via `PageHeader`), `main` is provided by the layout (content width max 6xl).

## Design language ("Amtsformular")

Cool grey-green Aktenpapier, ink-dark 1–2px outlines like printed form boxes, small 2px radius, **no shadows, no gradients, no icon-in-circle cards, no identical card grids as default**. Amt-Blau for structure, Signal-Rot only for problems or "act now", Status-Grün only for "done". Status = rubber-stamp (`Stempel`). Reference numbers (Aktenzeichen, Termin-Code) use `.aktenzeichen`.

Avoid the generated-page tells: ALL-CAPS eyebrow labels, "01 / 02 / 03" numbering unless the content really is a sequence, spaced em-dash labels, middle-dot meta strings, "→" appended to links, a single accented word in a headline, motion on every card. Structure (borders, rules, dividers) should carry information. Use motion only when it answers a user action. Layout: left-aligned, line length under 80 characters (about `max-w-prose`), generous but disciplined spacing, tables where the content is tabular.

Copy: German, formal "Sie", sentence case, plain verbs, specific button labels ("Antrag absenden", "Termin buchen", never "Submit"/"Weiter" alone when something more specific is possible), the same action keeps its name through the flow. Errors say what went wrong and how to fix it, no apologies. Empty states invite an action.

Quality floor: WCAG 2.2 AA: semantic landmarks, labels tied to inputs (`for`/`id`, use `$props.id()` for unique ids), visible focus (global), errors announced (`role="alert"`), `aria-current`, tables with `<th scope>`, keyboard-operable (no click-only `div`s), touch targets ≥ 44px, responsive down to 360px, respects reduced motion, print styles where noted.

## Deliverable checklist

1. Everything in your task works end to end against the real database (verify with `curl`; data you create may stay, it is a demo DB, but don't delete seed data).
2. `npx @sveltejs/mcp svelte-autofixer` clean for each component, `npx eslint` and `npx prettier --check` clean for your files, `npm run check` shows no errors in your files.
3. Final reply: short list of routes, files created, any shared-file change you wanted but did not make, and anything fragile. Keep it brief.
