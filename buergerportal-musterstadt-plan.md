# Bürgerportal Musterstadt — Implementation Plan

All nine implementation areas are complete as a demonstrator, verified on 19 November 2026. See `TODO.md` for completion and `docs/verification.md` for checks and simulation limits; this is not a production identity/document service.

## Top-Level Overview

Deliver a production-grade, highly interactive demo of **Bürgerportal Musterstadt** under the Onlinezugangsgesetz (OZG) model. The system combines a searchable municipal service directory (Behördenwegweiser), transactional citizen application wizards, an OZG-compliant digital inbox (Rückkanal/Postkorb) with trust-level security gates, a live appointment booking engine (Terminvereinbarung), a public defect reporter (Mängelmelder), and a dedicated caseworker workspace (Sachbearbeiter-Portal). The stack runs on SvelteKit 3 / Svelte 5 / Tailwind CSS v4 with a containerised PostgreSQL backend orchestrated via Podman Compose and typed with Drizzle ORM.

---

## Architectural Blueprint

### System Layers

1. **Infrastructure & Persistence Layer**: Podman Compose service definition running PostgreSQL with automated schema migration and rich German municipal seed data.
2. **Data & Domain Access Layer**: Typed data repositories covering Citizens, Caseworkers, Service Catalog, Applications, Appointments, Postkorb Messages, and Mängelmelder Reports.
3. **Authentication & Identity Simulation Layer**: BundID simulation engine supporting three official security levels (Basis, Substanziell, eID Hoch) with simulated PIN verification, plus a rapid Persona Switcher for demo presentations.
4. **Service Directory & EfA Handoff Layer**: Searchable catalog structured by municipal offices (Bürgeramt, Standesamt, Kfz-Zulassung, Ordnungsamt, Bauamt, etc.) with metadata (fees, documents, processing time) and simulated external EfA redirects.
5. **Citizen Transaction Layer**: Multi-step application wizards with profile prefilling, document attachment handling, and instant validation (Meldebescheinigung, Anwohnerparkausweis, Briefwahl).
6. **Digital Inbox & Document Layer**: Cryptographic/trust-level gated Rückkanal supporting official Bescheid notifications, status tracking, and printable PDF/summary generation.
7. **Appointment Scheduling Engine**: Live slot booking across departments with calendar views, slot locking, and cancellation management.
8. **Civic Defect Reporter (Mängelmelder)**: Interactive map-based issue submission with photo attachments and public resolution tracking.
9. **Caseworker Back-Office (Sachbearbeiter)**: Secure administration dashboard for triage, verification, request-for-documents, approval/rejection workflows, and automated Bescheid issuance.

---

## Sub-Tasks

### Sub-Task 1: Container Orchestration, Database Schema & Seed Data

- **Intent**: Establish containerised PostgreSQL environment and deploy complete municipal domain schema with realistic German seed entities.
- **Expected Outcomes**:
  - Podman Compose file boots healthy PostgreSQL instance.
  - Schema defines tables for users, auth sessions, municipal offices, services, applications, attachments, appointments, inbox messages, and civic defects.
  - Automated seed script populates realistic Musterstadt directory data and demo personas (Max Mustermann with eID Hoch, Erika Musterfrau with Basis auth, and Sachbearbeiter Hans Schmidt).
- **Todo List**:
  1. Define Podman Compose configuration for PostgreSQL with persistent volume and health checks.
  2. Install database connection and schema tooling (Drizzle ORM and PostgreSQL driver) via npm.
  3. Author database schema definitions covering all core entities and relations.
  4. Write migration and seed scripts with realistic German administrative data across all required municipal departments.
  5. Validate database connectivity and seed integrity.
- **Relevant Context**:
  - `package.json`, `src/lib/server/db/`
  - German administrative taxonomy: Bürgeramt, Standesamt, Kfz-Zulassung, Ordnungsamt, Bauamt, Jugendamt, Wahlamt.
- **Status**: `[x] complete`

---

### Sub-Task 2: BundID Identity Simulation & Persona Switcher

- **Intent**: Provide authentic OZG authentication experience simulating BundID trust levels and one-click demo role toggling.
- **Expected Outcomes**:
  - Citizen login supporting three Vertrauensniveaus: Basis (username/password), Substanziell (ELSTER/2FA), and Hoch (Online-Ausweis eID with 6-digit PIN modal).
  - Floating Demo Persona Bar allowing instant switching between citizens, unauthenticated visitor, and caseworker without manual relogin.
  - Persistent server session tracking security level and prefilled identity data (Name, Steuer-ID, address, date of birth).
- **Todo List**:
  1. Implement server-side session management and authentication actions in SvelteKit.
  2. Build simulated BundID login portal page with visual options for eID card, ELSTER certificate, and basic login.
  3. Implement interactive eID modal simulating card reader connection and PIN entry.
  4. Build persistent global Demo Persona Switcher component accessible across all views.
  5. Connect profile store to supply verified citizen identity data to transactional forms.
- **Relevant Context**:
  - `src/lib/server/auth/`, `src/routes/auth/`, `src/lib/components/demo/`
  - Vertrauensniveau specs: Basis, Substanziell, Hoch.
- **Status**: `[x] complete`

---

### Sub-Task 3: Behördenwegweiser (Service Catalog) & EfA Interoperability Simulation

- **Intent**: Create a comprehensive, searchable A–Z directory of city services with clear categorization, metadata, and simulated EfA external redirects.
- **Expected Outcomes**:
  - Searchable, filterable catalog by search term, responsible office (Amt), and life event (Lebenslage: Geburt, Umzug, Heirat, etc.).
  - Detailed service pages displaying responsible office, required documents, legal basis, processing time, fees, and action triggers (Apply Online vs Book Appointment).
  - Visual EfA indicators (Einer für Alle / Nachnutzung) with simulated federated handoff screen for state-shared services (e.g. i-Kfz, Elterngeld).
- **Todo List**:
  1. Build service directory data repository with search and filter queries.
  2. Implement Behördenwegweiser index route with real-time text search and department badges.
  3. Create detailed service profile view with structured accordion panels for requirements, fees, and contact details.
  4. Implement EfA external gateway interstitial explaining cross-portal data sharing under the OZG network.
- **Relevant Context**:
  - `src/routes/dienste/`, `src/lib/components/services/`
  - EfA Principle and German federal service classification.
- **Status**: `[x] complete`

---

### Sub-Task 4: Interactive Citizen Application Wizards (Antragsstrecken)

- **Intent**: Deliver fully functional multi-step transactional applications with profile prefilling, document upload simulation, and validation.
- **Expected Outcomes**:
  - Wizard 1: **Meldebescheinigung** (Automated issuance flow utilizing eID Hoch trust level for instant decision).
  - Wizard 2: **Anwohnerparkausweis** (Vehicle details, address verification, parking zone selector, document attachment upload).
  - Wizard 3: **Briefwahlantrag** (Postal vote application with ballot address selector and submission confirmation).
  - Live progress indicators, draft saving capability, and form validation using Svelte 5 state runes.
- **Todo List**:
  1. Create modular multi-step wizard framework with step navigation, validation guards, and profile prefilling.
  2. Implement interactive Meldebescheinigung workflow with instant approval simulation.
  3. Implement Anwohnerparkausweis workflow with simulated vehicle registration check and document dropzone.
  4. Implement Briefwahl workflow with polling card (Wahlbenachrichtigung) simulation.
  5. Connect submissions to server actions to create database records and trigger inbox notifications.
- **Relevant Context**:
  - `src/routes/antrag/`, `src/lib/components/forms/`
- **Status**: `[x] complete`

---

### Sub-Task 5: Postkorb (Digital Inbox & Rückkanal) with Trust-Level Protection

- **Intent**: Provide an OZG-compliant digital inbox receiving official notices, status updates, messages from caseworkers, and official decisions (Bescheide).
- **Expected Outcomes**:
  - Inbox interface listing incoming administrative letters, status changes, and notifications.
  - Security gating: sensitive messages (e.g. official Bescheid) locked behind required Vertrauensniveau (prompts eID step-up auth if logged in with lower level).
  - Interactive Bescheid viewer with printable official letter layout, seal of the city, and official legal notice (Rechtsbehelfsbelehrung).
  - Citizen-to-caseworker reply and supplemental document submission interface.
- **Todo List**:
  1. Build Postkorb server data loader and message filter by authenticated user.
  2. Implement inbox list view with unread badges, message types (Status, Bescheid, Nachforderung), and security tags.
  3. Implement security-level check on message open; render step-up authentication challenge modal when security level is insufficient.
  4. Design official digital Bescheid layout matching German municipal design standards with mock seal and verification code.
  5. Implement reply interface allowing citizens to upload requested documents directly to an existing case.
- **Relevant Context**:
  - `src/routes/postkorb/`, `src/lib/components/postkorb/`
- **Status**: `[x] complete`

---

### Sub-Task 6: Terminvereinbarung (Appointment Booking Engine)

- **Intent**: Provide an integrated booking engine for in-person municipal visits across multiple locations and departments.
- **Expected Outcomes**:
  - Department and concern picker (e.g. Reisepass beantragen at Bürgeramt Mitte).
  - Interactive calendar with dynamic slot availability across locations.
  - Booking confirmation with unique appointment reference (Termin-Code), QR code visualization, and calendar export (ICS).
  - Self-service appointment cancellation and rescheduling flow.
- **Todo List**:
  1. Build appointments data model and availability calculation logic.
  2. Implement step-by-step booking route: Office selection -> Service selection -> Location picker -> Time slot grid.
  3. Implement reservation confirmation action with generation of appointment confirmation ticket and QR code.
  4. Build citizen appointment overview tab in profile with cancel/reschedule actions.
- **Relevant Context**:
  - `src/routes/termine/`, `src/lib/components/appointments/`
- **Status**: `[x] complete`

---

### Sub-Task 7: Mängelmelder (Civic Defect & Feedback Platform)

- **Intent**: Enable citizens to report civic issues (potholes, defective streetlights, graffiti, illegal dumping) with geolocation and status tracking.
- **Expected Outcomes**:
  - Submission form with category selection, description, simulated photo upload, and interactive map coordinate pin selector.
  - Public overview of reported issues with filterable status badges (Gemeldet, In Bearbeitung, Behoben).
  - Detail page showing progress updates and municipal feedback.
- **Todo List**:
  1. Create defect report database schema and API endpoints.
  2. Build public Mängelmelder feed with map-inspired pin visualization and filtering.
  3. Implement report creation flow with interactive mock map picker and photo dropzone.
  4. Implement public status timeline on each report item.
- **Relevant Context**:
  - `src/routes/maengelmelder/`, `src/lib/components/map/`
- **Status**: `[x] complete`

---

### Sub-Task 8: Sachbearbeiter-Portal (Caseworker Back-Office)

- **Intent**: Deliver an administrative management portal for municipal clerks to triage, verify, process, and issue decisions on incoming citizen requests.
- **Expected Outcomes**:
  - Departmental queue view showing pending applications, appointment schedules, and reported defects.
  - Application dossier review screen showing citizen details, submitted data, uploaded proofs, and audit trail.
  - Action toolbelt: Request additional documents (Nachforderung), Approve with automated Bescheid generation, Reject with custom reasoning.
  - Status updates and generated Bescheide automatically sync to citizen's Postkorb in real time.
- **Todo List**:
  1. Implement caseworker route group protected by role-based guard.
  2. Build dashboard overview displaying departmental KPIs, urgent tasks, and queue metrics.
  3. Create application processing view with split-pane layout (citizen data on left, document viewer & decision form on right).
  4. Implement decision dispatch action that creates official Bescheid record, updates application state, and sends Postkorb notification.
  5. Build Mängelmelder management table to transition civic issue states.
- **Relevant Context**:
  - `src/routes/admin/` or `src/routes/sachbearbeiter/`, `src/lib/components/admin/`
- **Status**: `[x] complete`

---

### Sub-Task 9: Design System, OZG UI Chrome & Accessibility Integration

- **Intent**: Unify the application with a clean, authentic German public administration design system (standardised header/footer, eID badges, Leichte Sprache mode, responsive navigation).
- **Expected Outcomes**:
  - Professional public sector aesthetic utilizing clean typography, government color palette (Amt-Blau, Signal-Rot, Status-Grün), and accessible contrast.
  - Official municipal header with Musterstadt crest, emergency alerts banner, search quick-access, and language/Leichte Sprache toggles.
  - Citizen portal hub (Mein Dashboard) aggregating active applications, upcoming appointments, unread inbox count, and quick links.
  - Full WCAG 2.2 AA compliant keyboard navigation and semantic HTML structure.
- **Todo List**:
  1. Configure Tailwind v4 color tokens and UI component primitives (Cards, Badges, Alert banners, Modals, Breadcrumbs).
  2. Implement municipal layout chrome (Header, Navigation bar, Emergency banner, Footer with Impressum & Datenschutz).
  3. Create citizen landing hub (`Mein Bürgerportal`) with personalized summary cards and quick actions.
  4. Implement accessibility enhancement tools (Leichte Sprache preview toggle, contrast adjustment).
  5. Run typecheck (`npm run check`) and linting (`npm run lint`) across all components.
- **Relevant Context**:
  - `src/routes/layout.css`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/lib/components/ui/`
- **Status**: `[x] complete`
