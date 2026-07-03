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
| **Academy** | TBD | Multi-coach, shared player pool, organization management (Chapter 5) |

> Pricing to be validated with beta users before locking in.

Stripe integration is deliberately deferred — the product needs to be something coaches genuinely want before it becomes a business.

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
| **Language** | ES/EN switcher for navigation/chrome | ✅ Live (infra) |
| **Branding** | Per-coach name, logo, primary color — shown in-app and on shared player profiles | ✅ Live |
| **UX foundations** | Empty states, skeletons, toasts, confirm-delete, offline notes, global search | ✅ Live |
| **Onboarding wizard** | Guided first-run flow — players → series → first session auto-generated | 🔜 Chapter 2 |
| **Mobile bottom nav** | Fixed bottom tab bar: Hoy / Jugadores / Sesiones / Más | 🔜 Chapter 2 |
| **Dashboard “Hoy”** | Next session, players needing evaluation, active plan progress | 🔜 Chapter 2 |
| **Whiteboard improvements** | Directional arrows, dashed lines, colors per team, curved paths | 🔜 Chapter 2 |
| **PWA** | Offline support, installable on mobile homescreen | 🔜 Chapter 2 |
| **PDF player report** | Exportable per-player progress report | 🔜 Chapter 2 |
| **Live session mode** | On-court screen: big timer, tap attendance, block checklist, quick voice note | 🔜 Chapter 3 |
| **Coaching streak** | Weekly coaching consistency tracker with smart notifications | 🔜 Chapter 3 |
| **Smart notifications** | "Lucas has 3 absences", "45 days without snapshot", "tournament season in 2 weeks" | 🔜 Chapter 3 |
| **Annual periodization** | Year-view with load blocks (preseason/competitive/recovery), linked to plans | 🔜 Chapter 3 |
| **Session video & photo** | Attach clips from court, tag by player + block + concept, visible in trajectory | 🔜 Chapter 4 |
| **Coach → player messaging** | In-app direct messages per session, stored in player history | 🔜 Chapter 4 |
| **Lesson billing** | Generate and track invoices per player; payment history; pending balance | 🔜 Chapter 4 |
| **Player portal** | Player logs in, sees their own trajectory, plan, upcoming sessions, coach feedback | 🔜 Chapter 5 |
| **Parent portal** | Read-only parent access: attendance, physical progress, competition results | 🔜 Chapter 5 |
| **Multi-coach / academy** | One org, multiple coaches, shared player pool (organizations table already in schema) | 🔜 Chapter 5 |
| **Playtomic sync** | Import club bookings, convert to sessions in one click | ⏸️ Frozen |
| **Stripe** | Free + Pro plan enforcement, subscription billing | ⏸️ Frozen |

---

## Roadmap

### Phase 1 — Foundations ✅ COMPLETE (2026-06-15)
- [x] Scaffold, dev environment, Next.js + Supabase, auth, initial schema, deploy

### Phase 2 — Functional MVP ✅ COMPLETE (2026-06-15)
- [x] Players, snapshots, sessions, tournaments, Vercel deploy

### Phase 3 — Full Product ✅ COMPLETE (2026-06-15)
- [x] Strategies, dashboard stats, progress chart, session attendance history, edit flows

### Phase 4A — Calendar + Training Blocks ✅ COMPLETE (2026-06-20)
- [x] Session series, weekly calendar, recurrence edit scope, training blocks library

### Phase 4B — Training Plans + Player Sharing ✅ COMPLETE (2026-06-20)
- [x] Training plans, plan phases, plan progress view, shared player profile

### Phase 4C — Playtomic Integration ⏸️ FROZEN
Schema prepared. Implementation frozen indefinitely.

### Phase 5 — UX Refinement ✅ COMPLETE (2026-06-23)
- [x] Monthly calendar, scoped delete, tactical whiteboard, coach utilization, Competencias reframe, SessionBlocksPanel

### Phase 6 — Theming, Navigation & Branding ✅ COMPLETE (2026-06-23)
- [x] Dark/light theme, grouped sidebar + topbar, per-coach branding, ES/EN switcher

### Phase 6.5 — Coaching Depth & Product Polish ✅ COMPLETE (2026-07-03)

**Track A — UX foundations:** empty states, skeletons, toasts, ConfirmDeleteButton, error boundary, AutosavingTextarea, global search — all 8 entity types.

**Track B — Coaching depth:** tactical taxonomy (concept + decision tags), player trajectory view, session↔plan-phase bidirectional linkage, pairs/sociedad as first-class entity.

**Track C — Architecture hardening:** RLS audit (16 tables, 1 gap fixed), N+1 query audit (all clean), recurring-series Vitest coverage (13 tests).

---

## Chapter 2 — The Coach Experience

**The pivot:** Chapter 1 built the data model and features. Chapter 2 asks: *does using pctmt feel natural?* The app is currently organized like a database. Coaches think in workflows. Chapter 2 reorganizes around how coaches actually work.

### C2 Phase 1 — First Impression & Navigation

- [ ] **Onboarding wizard** — shown once to a coach with zero data. 3 steps, no sidebar: Añadí jugadores → Creá tu clase semanal → Listo. Auto-generates first week of sessions on completion so the coach lands on a live calendar, not an empty screen.
- [ ] **Bottom navigation (mobile)** — fixed bottom tab bar on small screens: **Hoy | Jugadores | Sesiones | Más**. Sidebar remains for desktop/tablet.
- [ ] **Dashboard “Hoy”** — answers "what do I do today?": próxima sesión con asistentes, jugadores sin snapshot en >30 días, plan activo con % de progreso, acceso rápido a nueva sesión.

### C2 Phase 2 — Tool Polish

- [ ] **Whiteboard improvements** — directional arrows (movement), dashed lines (ball trajectory), curved paths (globo arc), color per token (team A/B), stroke width. Current single-line type is too limited for real tactical diagramming.
- [ ] **Session quick-view from calendar** — tapping a session tile opens a slide-up: players, block checklist, attendance marking. No full-page navigation needed. Plan phase shown inline.
- [ ] **Pairs surface area** — player profile shows their sociedades. Pairs added to `/search`. Pair detail links directly to each player profile.
- [ ] **Plan ↔ session linkage, closed** — from plan timeline, tap a done slot → go to the session. From session, plan+phase badge is a tappable link to the plan.

### C2 Phase 3 — Reach & Depth

- [ ] **PWA — offline + installable** — service worker + manifest. App installs on homescreen, attendance marking works without cell signal on court.
- [ ] **PDF player report** — one-tap exportable PDF: progress chart, last 10 sessions + blocks, competition history, plan milestones. Shareable via WhatsApp or printable for parents.
- [ ] **Full-app ES/EN translation** — extend dictionary infra to every remaining hardcoded string across all forms, list pages, and detail views.

---

## Chapter 3 — Intelligence & Habits

*Inspired by: Duolingo (streaks + loss aversion), TrainingPeaks (periodization), Whoop (smart context), Strava (habit reinforcement).*

Chapter 3 makes pctmt feel like it knows the coach — like it's paying attention even when the coach isn't looking at it.

### C3 Phase 1 — Live Session Mode

The highest-priority workflow pctmt doesn't currently serve well: what the coach does *during* the class, on the court, phone in hand.

- [ ] **Dedicated session screen** — activated when a session starts. Optimized for one-handed use: big countdown timer for the current block, player list with attendance tap, block checklist with tap-to-complete, "next block" gesture. No need to navigate menus mid-class.
- [ ] **Quick voice note** — at the end of the session, the coach records a 30-second audio note per player ("Lucas mejorado mucho el paralelo hoy"). Transcribed and saved as a session note, visible in the player's trajectory.
- [ ] **Post-session summary** — when the timer ends, a one-screen summary: blocks completed, players present, auto-suggested concept tags based on blocks used. One tap to confirm and save.

### C3 Phase 2 — Coaching Streak & Smart Notifications

Duolingo's streak mechanic applied to coaching habits. Users with a 7-day streak are 2.4x more likely to return tomorrow (Duolingo data). Loss aversion is more powerful than any feature.

- [ ] **Coaching streak** — weekly streak for consistent activity: logging sessions, evaluating players, completing plan milestones. Visible on dashboard. Breaking a streak triggers a friendly prompt, not a penalty.
- [ ] **Smart notifications** — not generic pings but contextual alerts the coach actually wants: "Lucas lleva 3 faltas seguidas — ¿lo chequeás?", "45 días sin snapshot de María", "Temporada de torneos en 2 semanas, 4 jugadores compitiendo", "Este mes ya superaste tu récord de horas entrenadas 🎉".
- [ ] **Player health indicators** — on the player list and profile: small colored dot showing recency of last evaluation (green = recent, yellow = >30 days, red = >60 days). Visible at a glance without opening each profile.

### C3 Phase 3 — Annual Periodization

How elite coaches plan: not class by class but year by year, with load cycles.

- [ ] **Annual calendar view** — 52-week grid per coach. Drag to mark blocks: pretemporada (base building), competitiva (peak load), recuperación (rest). Color-coded, shareable with players.
- [ ] **Load recommendations** — based on upcoming tournaments and current plan phases, suggest when to push and when to ease. "3 jugadores compiten el 20/8 — esta semana podría ser de baja intensidad."
- [ ] **Session volume tracking** — hours per week/month/year per player and per group, charted over time. Identifies overload and underload patterns.

---

## Chapter 4 — Media & Communication

*Inspired by: CoachNow (video annotation + side-by-side comparison), WhatsApp (where coaching communication actually lives today).*

Chapter 4 gives pctmt a face and a voice — the coach stops being invisible between sessions.

### C4 Phase 1 — Video & Photo per Session

CoachNow's strongest feature adapted for padel context. Today there's no way to attach what happened visually.

- [ ] **Media attachment** — coach films a drill or technique moment from the phone. Attaches to the session. Tags by player + training block + concept. Stored in the player's trajectory — "sesiones con video" visible on the timeline.
- [ ] **Side-by-side comparison** — same player, two dates. The coach picks two clips and the app renders them in split view. The most powerful way to show progress: "Este eras vos en marzo, este sos hoy."
- [ ] **Draw & annotate** — on any photo or video frame, draw lines and arrows using the same primitives as the tactic board (directional arrow, dashed line, circle). Add a voice comment. Share with the player directly.

### C4 Phase 2 — Coach → Player Messaging

- [ ] **In-app direct message per session** — coach sends a note to the player after class: "Hoy trabajamos bien el paralelo. Para el martes: enfocá en la volea de revés.". Stored in the player's history, not lost in a WhatsApp thread.
- [ ] **Session summary push** — after a session is closed, optionally auto-send a summary to all attending players: blocks covered, coach's note, next session date. Players don't need an account to receive it (WhatsApp API or email).
- [ ] **Player reply** — simple: the player can acknowledge or respond to the coach's note. Thread stored on the session record.

### C4 Phase 3 — Lesson Billing

Not Stripe subscriptions for pctmt — the coach's own invoicing to their students. The problem coaches solve today with bank transfers and phone notes.

- [ ] **Invoice per player** — generate a monthly invoice: player name, sessions attended, rate per session, total. PDF exportable, shareable via WhatsApp.
- [ ] **Payment tracking** — mark invoices as paid/pending. Running balance per player. Dashboard shows total owed this month.
- [ ] **Rate configuration** — per player or per session type (individual vs group). The data already exists (sessions, attendance); only the financial layer is missing.

---

## Chapter 5 — Ecosystem

*The step from a coach tool to a coaching platform. Each phase adds a new stakeholder to the product.*

### C5 Phase 1 — Player Portal

The shared player profile exists but is read-only and anonymous. A logged-in player can see more and interact.

- [ ] **Player account** — the coach invites a player via email. The player creates an account and lands on their own portal: trajectory, upcoming sessions, active plan + current phase, coach feedback messages.
- [ ] **Plan visibility** — player sees the plan the coach has for them. Phase objectives, session count, how far along. Transparent, motivating.
- [ ] **Goal setting** — coach sets an annual objective per player ("Clasificar al provincial U18"). Visible to the player on their portal. Updated as milestones are reached.

### C5 Phase 2 — Parent Portal

For minor players, parents are often the real client. Today coaches manage this via WhatsApp groups and screenshots.

- [ ] **Parent read-only access** — coach links a parent to a player. Parent sees: sessions this month, attendance rate, physical progress chart, competition results, upcoming schedule. No tactical content — that's coach-only.
- [ ] **Monthly summary email** — auto-sent to parents at month-end: sessions attended, concepts covered (in plain language, not jargon), next competition date. The coach looks professional without any extra work.

### C5 Phase 3 — Multi-Coach / Academy

- [ ] **Organization layer** — the `organizations` table is already in the schema. One academy account, multiple coaches, shared player pool. The academy director sees aggregate stats; each coach sees their own players.
- [ ] **Coach profiles** — each coach has their own branding within the academy umbrella. Players know which coach is theirs.
- [ ] **Stripe + billing** — at academy scale, billing makes sense: the academy pays one Pro plan per coach, or a flat academy tier. This is when monetization lands naturally.

---

## Monetization (deferred until Chapter 5)

- **Stripe** — Free (≤5 players) vs Pro plan; subscription billing. Natural entry point at Chapter 5 when academy tier justifies enterprise pricing.
- **Playtomic sync** — schema live in production; implementation frozen. Revisit after Chapter 3.
- **Landing page** — standalone marketing page with value prop, screenshots, pricing table.
- **React Native** — only if PWA (Chapter 2) proves insufficient for real coaches in production.

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. Longitudinal trajectory with tactical context across months.

**vs generic tools (Notion, spreadsheet):** Built specifically for padel. Session types, court zones, dominant hand, training block types, plan phases, concept taxonomy, pair tracking — the data model speaks the coach's language.

**vs generic coaching apps (CoachNow, TrainingPeaks):** Padel-native. Tactical whiteboard linked to the strategy library. Pair/sociedad tracking. Concept taxonomy built from elite coach methodology. Branding that makes the coach look professional in front of their players.

**vs club management platforms (Playtomic Manager, 360player):** Built for the individual coach, not the club. The coach owns their data. They take it with them if they change academies.

**The unique position:** pctmt is the only tool that combines coaching intelligence (plans, taxonomy, trajectory), tactical tools (whiteboard, strategy library), player relationships (shared profiles, messaging, billing), and padel-specific depth — in a single product built for the individual coach.

---

## The “Worth Paying For” Moment

A coach pulls out their phone mid-session, opens the player portal for María, and shows her the side-by-side video comparison — her backhand in March vs today. The progress chart shows endurance up 18 points. The plan shows she's in week 3 of 4 of the technical phase. The page carries the coach's own name and color. María sees her own trajectory under her coach's brand.

That moment — which no notebook, no generic app, and no club management platform can produce — justifies both the coaching fee and the pctmt subscription.
