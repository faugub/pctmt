# pctmt — Product

Vision, target customer, roadmap, and pricing.

---

## What is pctmt?

**pctmt** is a SaaS platform built for padel coaches who want to digitize their work. It replaces notebooks and spreadsheets with a purpose-built tool for managing players, planning training sessions, tracking competition results, and building a strategy and tactical content library.

The core value proposition: a coach can show a player their progress over months — physical metrics, competition history, session attendance — in a way that a notebook never could. The product is the operating system of a professional padel coach: calendar, planning, content library, player development, branding, pairs tracking, and tactical tools, all in one place.

> **Guiding voice:** `docs/voz-del-entrenador.md` is a synthesis of how elite padel coaches (Pablo Crosetti, Gustavo Pratto, Manu Martín) think about player development, translated into product principles. It's the filter behind every coaching-depth decision: does this help a coach decide better, or does it just add another screen?

---

## Target Customer

**Primary:** Individual padel coaches operating independently or attached to an academy.

The coach is the buyer — not the academy. A coach signs up, pays, and owns their data. They can work solo or, in a later phase, join an academy account.

**Profile:**
- Manages 10–40 active players
- Runs group and individual sessions on recurring weekly schedules
- Often works courtside on a tablet, between or during classes — not just at a desk
- Players compete in local/regional tournaments the coach doesn't organize, only tracks
- Currently tracks everything in WhatsApp, notes apps, or paper
- Wants their own brand (name, logo, color) visible to players, not just "pctmt"

---

## Business Model

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | Up to 5 players, basic session log |
| **Pro** | ~$15–20/month | Unlimited players, all modules, training plans |
| **Academy** | TBD | Multi-coach, shared player pool, organization management (later phase) |

> Pricing to be validated with beta users before locking in.

Stripe integration is deliberately deferred — see Chapter 2 rationale below.

---

## Core Modules

| Module | Description | Status |
|---|---|---|
| **Players** | Full profiles, physical snapshots, progress chart, session history, longitudinal trajectory | ✅ Live |
| **Player trajectory** | Longitudinal timeline per player — sessions attended, concepts worked, snapshots, attendance % | ✅ Live |
| **Pairs / Sociedades** | Pair as a first-class entity — shared session history, top concept frequency, notes per pairing | ✅ Live |
| **Sessions** | Plan classes, set objectives, log attendance, attach a live block checklist, plan-phase context | ✅ Live |
| **Competencias** | Log where a player competed externally and what they achieved (not a bracket organizer) | ✅ Live |
| **Strategies** | Play library with court zones, concept tags, decision tags, linkable to a tactical whiteboard | ✅ Live |
| **Tactical taxonomy** | Concept tags (paralelo/diagonal/transición/etc.) and decision tags on strategies and blocks | ✅ Live |
| **Dashboard** | Stats, coach utilization (hours/month), recent sessions, upcoming competitions | ✅ Live |
| **Calendar** | Week and month views, recurring series, scoped edit/delete | ✅ Live |
| **Training blocks** | Reusable exercise block library; link to strategies; attach to a session as a tappable checklist | ✅ Live |
| **Training plans** | Multi-session plans with phases, bidirectional linkage to real sessions | ✅ Live |
| **Shared player profile** | Public read-only progress link for players, shareable via WhatsApp; shows coach's own branding | ✅ Live |
| **Tactical whiteboard** | Drag-and-drop court diagram — players, ball, shot lines, autosaved | ✅ Live |
| **Theme** | Light/dark toggle, persisted, no flash on load | ✅ Live |
| **Language** | ES/EN switcher for the app's navigation/chrome | ✅ Live (infra) — full-app string coverage in Chapter 2 |
| **Branding** | Per-coach name, logo, primary color — shown in-app and on shared player profiles | ✅ Live |
| **Navigation** | Grouped sidebar + topbar, replacing old per-page header | ✅ Live |
| **UX foundations** | Empty states, loading skeletons, toasts, confirm-delete, offline-tolerant notes, global search | ✅ Live |
| **Onboarding wizard** | Guided first-run flow for new coaches — players → series → first session generated | 🔜 Chapter 2 |
| **Mobile bottom nav** | Fixed bottom tab bar on small screens (Hoy / Jugadores / Sesiones / Más) | 🔜 Chapter 2 |
| **Dashboard "Hoy"** | Next session today, players needing evaluation, active plan progress, quick-add | 🔜 Chapter 2 |
| **Whiteboard improvements** | Directional arrows, dashed lines, color per token, curved paths | 🔜 Chapter 2 |
| **PWA** | Offline support, installable on mobile | 🔜 Chapter 2 |
| **PDF player report** | Exportable progress report per player | 🔜 Chapter 2 |
| **Playtomic sync** | Import club bookings from Playtomic, convert to sessions in one click | ⏸️ Frozen |
| **Stripe** | Free + Pro plan enforcement, subscription billing | ⏸️ Frozen |

---

## Roadmap

### Phase 1 — Foundations ✅ COMPLETE (2026-06-15)

- [x] GitHub repo and project scaffold
- [x] WSL dev environment (Fedora 42 + Node 20)
- [x] Next.js 16 + TypeScript + Tailwind
- [x] Supabase connected (database + auth)
- [x] Route protection middleware
- [x] Database schema (10 tables, RLS)
- [x] SQL migration applied in Supabase
- [x] Functional login + register (Supabase Auth)
- [x] Basic post-login dashboard shell

### Phase 2 — Functional MVP ✅ COMPLETE (2026-06-15)

- [x] Players module — create, view, edit, delete
- [x] Physical snapshots — log weight, height, scores per date
- [x] Sessions module — create, edit, delete, add players, mark attendance
- [x] Tournaments module — create, edit, delete, add results per player
- [x] Deploy on Vercel — https://pctmt-azure.vercel.app

### Phase 3 — Full Product ✅ COMPLETE (2026-06-15)

- [x] Strategies module — CRUD, court zone filter, tags
- [x] Dashboard with real stats, progress chart, recent activity
- [x] Progress chart on individual player profile
- [x] Session attendance history on player profile
- [x] Edit session and tournament (closes CRUD gap)

### Phase 4A — Calendar + Training Blocks ✅ COMPLETE (2026-06-20)

- [x] Session series — recurring schedules with default player list and type
- [x] Weekly calendar — 7-column view with session cards, week navigation
- [x] Recurrence edit scope — this occurrence / future / entire series
- [x] Training blocks library — global reusable blocks per coach
- [x] Schema migration — `session_series`, `training_blocks`, `session_blocks`

### Phase 4B — Training Plans + Player Sharing ✅ COMPLETE (2026-06-20)

- [x] Training plans — multi-session plans for groups or individual players
- [x] Plan phases — color-coded groupings within a plan
- [x] Plan progress view — planned vs done vs skipped, completion percentage
- [x] Shared player profile — public read-only link at `/share/player/[token]`
- [x] Public route exemption from auth middleware

### Phase 4C — Playtomic Integration ⏸️ FROZEN

Schema prepared (`playtomic_connections`, `playtomic_bookings`). Server Actions, cron route, and UI not built. **Frozen indefinitely — the product needs to be a great tool before becoming a business.**

### Phase 5 — UX Refinement from Coach QA Feedback ✅ COMPLETE (2026-06-23)

- [x] Monthly calendar view — week/month toggle
- [x] Scoped recurring delete — this / future / all
- [x] Tactical whiteboard — `tactic_boards` module with SVG court, drag/drop, autosave
- [x] Coach utilization on the dashboard — hours coached/month vs prior month
- [x] "Torneos" → "Competencias" reframe — data model unchanged, UI copy corrected
- [x] Session blocks UI — `SessionBlocksPanel` with live tap-to-complete checklist

### Phase 6 — Platform UX: Theming, Navigation & Branding ✅ COMPLETE (2026-06-23)

- [x] Dark / light theme — toggle persisted in `localStorage`, no flash on load
- [x] Grouped sidebar + topbar navigation — replaces duplicated per-page headers
- [x] Per-coach branding — brand name, logo URL, primary color in `/settings`
- [x] Language switcher (ES/EN) — cookie-persisted, server-rendered
- [x] All dashboard pages migrated to semantic Tailwind tokens

### Phase 6.5 — Coaching Depth & Product Polish ✅ COMPLETE (2026-07-03)

Inserted before monetization to ensure the product is genuinely useful before it becomes a business. Guided by `docs/voz-del-entrenador.md`.

**Track A — UX foundations ✅ COMPLETE (2026-06-26)**
- [x] Empty states across all 7 top-level list pages
- [x] Loading skeletons across all list pages and `/search`
- [x] Toast/snackbar feedback for every create/update/delete action
- [x] `ConfirmDeleteButton` replacing all `window.confirm()` — including scoped series deletes with mutual-exclusion guard
- [x] Error boundary for the full `(dashboard)` segment
- [x] `AutosavingTextarea` with localStorage debounce for session objectives/notes
- [x] Global search (`/search`) across 8 entity types — plain GET form, works without JS

**Track B — Coaching depth ✅ COMPLETE (2026-07-03)**
- [x] Tactical taxonomy — `concept_tags` and `decision_tags` on strategies and training blocks; `TaxonomyTagPicker` chip component; concept-filter rows on list pages; amber/purple color coding
- [x] Player trajectory view — `/players/[id]/trajectory`: longitudinal timeline merging sessions + snapshots, attendance summary, top-3 concept chips
- [x] Session → plan-phase bidirectional linkage — plan slots link to real sessions; session detail shows plan + phase context
- [x] Pair/sociedad as a first-class entity — `pairs` table + full CRUD, shared session history via set intersection, top-5 concept frequency, linked from sidebar

**Track C — Architecture hardening ✅ COMPLETE (2026-07-03)**
- [x] RLS audit — all 16 tables verified; `organizations` was the single gap (no RLS enabled); fixed via migration `20260703000010_rls_organizations.sql`
- [x] N+1 query audit — all list pages confirmed clean; no per-row sub-queries found
- [x] Recurring-series test coverage — pure date logic extracted to `src/lib/series-utils.ts`; 13 Vitest tests covering `computeOccurrenceDates` and `capDateBefore` across month/year/leap-year boundaries

---

## Chapter 2 — The Coach Experience

**The pivot:** Chapter 1 (Phases 1–6.5) built the product's data model and feature set. Every major coaching workflow exists and works. Chapter 2 asks a different question: *does using pctmt feel natural — for a coach opening it for the first time, and for a coach opening it every day?*

Through real coach use, the clearest friction point emerged: the app is organized like a database (Players, Sessions, Strategies, Plans, Boards…) and a coach doesn't think that way. They think about workflows. They don't know where to start. Chapter 2 reorganizes the product around how coaches actually work.

**Stripe and Playtomic remain frozen.** The goal is a product coaches genuinely want to use before it becomes a business.

### C2 Phase 1 — First Impression & Navigation

The highest-impact UX gap: a new coach lands on the dashboard, sees 8 sidebar items, and has no clear starting point. The features are all there; the entry point isn't.

- [ ] **Onboarding wizard** — shown once, only when a coach has zero data. 3 steps, no sidebar: (1) Añadí tus jugadores → (2) Creá tu clase semanal → (3) Listo. Progress indicator. Completing step 3 auto-generates the first week of sessions so the coach lands on a live calendar, not an empty screen.
- [ ] **Bottom navigation (mobile)** — on small screens, replace the sidebar-heavy layout with a fixed bottom tab bar: **Hoy | Jugadores | Sesiones | Más**. The 4 tabs map to the 4 most-used daily workflows. Sidebar remains for desktop and tablet.
- [ ] **Dashboard redesign: "Hoy"** — the current dashboard shows aggregate stats. The new one answers "what do I do today?": próxima sesión del día con sus asistentes, jugadores sin snapshot en >30 días, plan activo con % de progreso, acceso directo a "+ Nueva sesión". Empty if nothing is scheduled — and then shows the onboarding prompt instead.

### C2 Phase 2 — Tool Polish

Features that exist but have friction or clear gaps found through real daily use.

- [ ] **Whiteboard improvements** — additional drawing primitives: directional arrow (player/ball movement direction), dashed line (ball trajectory), curved path (globo arc), color per token (team A vs team B), stroke width selector. The current single-line-type makes anything beyond basic positioning hard to diagram.
- [ ] **Session quick-view from calendar** — tapping a session tile on the calendar opens a slide-up panel: title, players, block checklist. Attendance can be marked without leaving the calendar. For sessions linked to a plan, the phase is visible inline.
- [ ] **Pairs surface area** — show a player's societies on their profile page under a "Sociedades" section with links. Add pairs to `/search`. From pair detail, direct links to each player's full profile.
- [ ] **Plan ↔ session linkage, closed** — from a plan's timeline, tapping a done slot navigates to that actual session. From a session, the plan+phase badge is a tappable link to the plan. (Partial UI exists; close the gap.)

### C2 Phase 3 — Reach & Depth

- [ ] **PWA — offline + installable** — service worker + web app manifest so the app installs on the coach's homescreen and attendance marking works with no cell signal on court. Does not require Stripe to ship.
- [ ] **PDF player report** — one-tap exportable PDF per player: progress chart, last 10 sessions with blocks covered, competition history, plan phase milestones. Coach shares via WhatsApp or prints for parents.
- [ ] **Full-app ES/EN translation** — extend the existing dictionary infrastructure (`src/lib/i18n/`) to every remaining hardcoded Spanish string across all forms, list pages, and detail views. The language switcher currently covers only navigation/chrome/settings.

---

## Monetization (deferred)

Stored here for future reference, not on the active roadmap.

- **Stripe** — Free (≤5 players) vs Pro (unlimited) plan enforcement; monthly subscription billing
- **Playtomic sync** — OAuth flow + hourly booking import from `thirdparty.playtomic.io`; schema already live in production
- **Academy / multi-coach** — organizations table already in schema; UI not started
- **Landing page** — standalone marketing page with value prop, screenshots, pricing
- **React Native** — only if PWA proves insufficient for real coaches in production

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. A coach can show a player exactly how their endurance score improved over 6 months, which concepts they worked most, and what their attendance trend looks like.

**vs a generic tool (Notion, spreadsheet):** Built specifically for padel. Session types, competition categories, court zones, dominant hand, training block types, plan phases, concept taxonomy, pair tracking — the data model speaks the coach's language.

**vs other coaching apps:** Focused on padel first. Simpler than broad sports management platforms aimed at academies. The shared player profile, tactical whiteboard, per-coach branding, and pair-as-entity are padel-native features generic tools cannot offer.

---

## The "Worth Paying For" Moment

A coach subscribes because the tool makes them look professional in front of their players. The specific moment: coach pulls out their phone mid-session, opens the shared player profile for María, and shows her the progress chart — endurance up 18 points over 4 months, attendance at 92%, semifinal at the last competition, paralelo worked in 7 of the last 10 sessions. The page carries the coach's own name and color. María sees her own trajectory under her coach's brand. That justifies both the coaching fee and the pctmt subscription.

This moment was fully live in production as of Phase 6. Phase 6.5 deepened it — trajectory is now longitudinal and tactical, not just a snapshot. Chapter 2 makes it feel effortless to reach.
