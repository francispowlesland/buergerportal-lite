# Bürgerportal Musterstadt

A German municipal portal demonstrator built with SvelteKit 3, Svelte 5, Tailwind 4 and PostgreSQL 17. It includes a service directory, three application wizards, a trust-gated inbox, appointment booking, public defect reports and a caseworker workspace.

**This is a demo, not a live public service.** BundID, ELSTER, eID and EfA handoffs are simulated. The persona bar gives anyone access to demo citizen and caseworker accounts. Uploads store file metadata only, not document or photo contents. Use fictional data and keep the app on a trusted local network.

## Run locally

You’ll need Node.js 24 LTS, npm, Podman and a Compose provider (verified with Node 24.16.0). Start the Podman machine first on macOS. PostgreSQL uses host port **5433**; the app uses **5180**.

```sh
npm ci
cp .env.example .env
npm run db:setup
npm run dev
```

Open <http://localhost:5180>.

**`db:setup` and `db:seed` erase and recreate all demo data, including sessions and records you’ve added.** Run setup once on a new demo database, not each time you start the app. `db:push` applies the schema directly and is intended for this disposable demo database, not production migrations.

On subsequent starts:

```sh
npm run db:up
npm run dev
```

The `db:*` container scripts use `podman compose`. With Docker instead, start the same database using `docker compose up -d --wait`, then run `npm run db:push` and `npm run db:seed` for the initial setup. `.env.example` matches the local Compose credentials; never reuse them for a public deployment.

## Demo accounts

Use the persona bar at the bottom of any page, or sign in at `/auth/login`.

| Account | Persona bar             | Available trust levels    | Role              |
| ------- | ----------------------- | ------------------------- | ----------------- |
| `max`   | `max-hoch`, `max-basis` | Basis, Substanziell, Hoch | Citizen           |
| `erika` | `erika-basis`           | Basis only                | Citizen           |
| `hans`  | `hans-hoch`             | Basis, Substanziell, Hoch | Caseworker        |
| —       | `visitor`               | Not signed in             | Public pages only |

Password: **`demo1234`**. ELSTER code and eID PIN: **`123456`**. For eID, select an identity and click **Ausweis auflegen** before entering the PIN. A sensitive Bescheid requires Hoch even when the inbox itself is accessible at Basis. Erika cannot step up beyond Basis.

## Main routes

- `/dienste`: search by name, office and life event; service details and simulated EfA handoff.
- `/antrag`: Meldebescheinigung, Anwohnerparkausweis and Briefwahl, including saved drafts. A Meldebescheinigung submitted at Hoch receives an instant Bescheid.
- `/postkorb`: administrative messages, printable Bescheide, replies and simulated supplemental uploads.
- `/termine`: book, view, reschedule or cancel appointments; confirmation QR and calendar export.
- `/maengelmelder`: public map/feed, reporting and status timelines.
- `/mein-buergerportal`: the citizen’s applications, appointments and unread messages.
- `/sachbearbeiter`: office-scoped application processing and municipal defect management (use Hans).

## Checks

```sh
npm run check
npm run lint
npm run build
```

Small assert-based checks live next to their domain code (`*.check.ts`); no test framework is needed. Runtime verification uses the seeded database. See `TODO.md` for the implementation status and `docs/verification.md` for the checked journeys and remaining limits.

## Built Node server

The project uses `@sveltejs/adapter-node`, producing `build/`:

```sh
npm run build
HOST=127.0.0.1 PORT=5180 ORIGIN=http://localhost:5180 BODY_SIZE_LIMIT=32M node --env-file=.env build
```

Stop the dev server first if you use the same port. Keep the build output, `package.json`, lockfile and production dependencies together. Production doesn’t load `.env` automatically, hence `--env-file`. The body limit allows the simulated upload forms; individual file limits are still checked by the app.

This gives you a runnable demo build, not production-ready identity or document storage. Before public use, replace demo authentication and persona switching, database credentials, simulated uploads and external-service integrations, and configure HTTPS and a proper migration process. Accessibility controls and keyboard-friendly components are included; a formal WCAG audit has not been performed.
