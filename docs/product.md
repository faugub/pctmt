# pctmt — Product

Vision, target customer, roadmap, and pricing.

---

## What is pctmt?

**pctmt** is a SaaS platform built for padel coaches who want to digitize their work. It replaces notebooks and spreadsheets with a purpose-built tool for managing players, planning training sessions, tracking competition results, and building a strategy and tactical content library.

The core value proposition: a coach can show a player their progress over months — physical metrics, competition history, session attendance — in a way that a notebook never could. The product is now the operating system of a professional padel coach: calendar, planning, content library, player development, and (soon) external integrations in one place.

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
- May operate through a Playtomic-enabled club (relevant for Phase 4C integration)

---

## Business Model

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | Up to 5 players, basic session log |
| **Pro** | ~$15–20/month | Unlimited players, all modules, training plans, Playtomic sync |
| **Academy** | TBD | Multi-coach, shared player pool, organization management (later phase) |

> Pricing to be validated with beta users before locking in.

Payments via Stripe. Subscription billed monthly, cancel anytime. Stripe integration deferred post-MVP.

---

## Core Modules

| Module | Description | Status |
|---|---|---|
| **Players** | Full profiles, physical snapshots, progress chart, session history | ✅ Live |
| **Sessions** | Plan classes, set objectives, log attendance, attach a live block checklist | ✅ Live |
| **Competencias** | Log where a player competed externally and what they achieved (renamed from "Torneos" — see Phase 5) | ✅ Live |
| **Strategies** | Play library with court zones and tags, linkable to a tactical whiteboard | ✅ Live |
| **Dashboard** | Stats, coach utilization (hours/month), recent sessions, upcoming competitions | ✅ Live |
| **Calendar** | Week and month views, recurring series, scoped edit/delete | ✅ Live |
| **Training blocks** | Reusable exercise block library; link to strategies; attach to a session as a tappable checklist | ✅ Live |
| **Training plans** | Multi-session plans with phases, for groups or individual players | ✅ Live |
| **Shared player profile** | Public read-only progress link for players, shareable via WhatsApp | ✅ Live |
| **Tactical whiteboard** | Drag-and-drop court diagram — players, ball, shot lines, autosaved | ✅ Live |
| **Playtomic sync** | Import club bookings from Playtomic, convert to sessions in one click | 🔜 Phase 4C |
| **Stripe** | Free + Pro plan enforcement, subscription billing | ⏳ Phase 6 |
| **PWA** | Offline support, installable on mobile, push notifications | ⏳ Phase 6 |

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
- [ ] Stripe integration — deferred
- [ ] Email notifications — deferred
- [ ] PWA manifest + offline support — deferred

### Phase 4A — Calendar + Training Blocks ✅ COMPLETE (2026-06-20)

Makes sessions feel structured and professional. The coach stops typing from scratch every class.

- [x] **Session series** — recurring schedules (e.g. "Academia B1 · Tue+Thu · 18:00 · 90 min") with default player list, session type (academy / individual / pairs), category, and level
- [x] **Weekly calendar** — 7-column view (Mon–Sun), sessions rendered as cards with color coding by type, week navigation
- [x] **Recurrence edit scope** — when editing a series, coach chooses: only the template (future generations) / future sessions / entire series (regenerates via `series_id` + `series_index` on `sessions`)
- [x] **Training blocks library** — global reusable blocks per coach: warmup, technique, physical, tactical, match play, cool-down. Each has title, type, duration, description, tags, and optional link to an existing strategy
- [x] **Dashboard navigation** — Calendar and Bloques surfaced as primary entry points
- [x] **Schema migration** — `session_series`, `training_blocks`, `session_blocks`; `series_id` + `series_index` added to `sessions`

**Originally flagged as missing, closed in Phase 5:** the `session_blocks` UI to attach blocks to a session — schema and Server Actions existed since this phase, but no panel used them until `SessionBlocksPanel` shipped.

### Phase 4B — Training Plans + Player Sharing ✅ COMPLETE (2026-06-20)

The layer that makes coaching value visible — to the coach, to the player, and to whoever is paying for lessons.

- [x] **Training plans** — multi-session plans attached to either a session series (group plan) or an individual player (individual plan), via the `target_type`/`target_id` polymorphic pattern. Auto-generates one `plan_sessions` slot per planned session on creation
- [x] **Phases** — optional color-coded groupings within a plan, with objectives and session counts
- [x] **Plan progress view** — timeline showing planned vs done vs skipped sessions, completion percentage bar
- [x] **Shared player profile** — public read-only link at `/share/player/[token]`, shareable via WhatsApp. Shows progress chart, last-30-day attendance rate, last 5 competition results. No account required. Toggle, copy-link, and regenerate-token UI lives on the player detail page
- [x] **Public route exemption** — `/share` excluded from the auth middleware; access gated entirely by Supabase RLS (`share_enabled = true`)
- [x] **Dashboard navigation** — Planes surfaced next to Calendario

**Not yet built from the original scope:** linking a real session to a plan slot from the session-detail page (the `linkSessionToPlan` action exists; no UI trigger yet), and the "session report summary" (one-tap post-session summary of blocks covered).

### Phase 4C — Playtomic Integration

Import bookings from Playtomic-enabled clubs directly into the pctmt calendar.

**Prerequisite for the coach:** The club must have a Playtomic Champion or Master subscription and share API credentials. Coaches at academies need club cooperation. Independent coaches with their own club account can connect directly.

**Integration flow:**
1. Coach goes to Settings → Integrations → Connect Playtomic and pastes their Client ID and Client Secret
2. Vercel Cron runs hourly, fetches upcoming bookings from `thirdparty.playtomic.io/api/v1/bookings` (OAuth 2.0, ~1 req/min rate limit)
3. Bookings land in `playtomic_bookings` and appear in the calendar with a Playtomic badge
4. Coach clicks a booking → "Convert to session" → session is created with court, time, and player list pre-filled
5. Players matched automatically by email if they exist in pctmt; unmatched players shown as names only

**Known constraints:**
- API is read-only — pctmt cannot create or modify bookings in Playtomic
- Historical access limited to past 90 days
- Rate limit ~1 req/min — hourly sync is the correct design, not real-time
- `raw_payload JSONB` in `playtomic_bookings` preserves full API response, protecting against schema changes on Playtomic's side

**Upcoming Playtomic API features to incorporate when available:** player data endpoints, payment history, event and clinic data.

**Status:** Schema migration applied (`playtomic_connections`, `playtomic_bookings`). Server Actions, cron route handler, and UI not yet built.

### Phase 5 — UX Refinement from Coach QA Feedback ✅ COMPLETE (2026-06-23)

Unlike Phases 1–4, this phase wasn't planned upfront — it came from the coach actually using the product day-to-day and listing what felt wrong or missing. Smaller in scope per item, but each item came from a real friction point, not a guess.

- [x] **Monthly calendar view** — week/month toggle on `/calendar`, sharing the same data layer as the weekly view (just a different date range)
- [x] **Scoped recurring delete** — deleting a series or a single occurrence now offers the same this/future/all scope editing already had. Closes a real gap: deleting a series used to leave every generated session behind as an orphaned one-off, requiring manual cleanup
- [x] **Tactical whiteboard** — new `tactic_boards` module: drag/drop players, ball, and shot-line drawing on an SVG padel court, optionally linked to a strategy, autosaved. Court proportions corrected mid-build after a coach screenshot caught the service line at the wrong depth (was 3m from net, should be 3.05m from the back wall — confirmed against FIP regulation)
- [x] **Coach utilization on the dashboard** — replaced a progress chart for "whichever player was opened last" (not a meaningful metric) with hours-coached-per-month, computed from existing session data, plus a vs-last-month delta. Maps directly to the coach's income, unlike the old chart
- [x] **"Torneos" → "Competencias" reframe** — the data model already matched the real workflow (log where a player competed externally, not organize a bracket); only the UI language was wrong. Copy changed throughout; schema, routes, and internal names left as-is (see `architecture.md` for why)
- [x] **Session blocks UI** — `SessionBlocksPanel`: tap-to-add blocks onto a session from the library, reorder with up/down, mark complete during the live class. Closes the `session_blocks` gap flagged back in Phase 4A — the table existed for three phases with no UI ever built on top of it

**Migrations added, not yet applied in production as of this writing — apply before relying on these features:** `20260622000005_tactic_boards.sql`, `20260623000006_session_blocks_completed.sql`.

### Phase 6 — Monetization + Retention

To be refined based on real coach feedback. This phase turns the product into a business.

- [ ] **Stripe integration** — enforce Free (≤5 players) vs Pro (unlimited) plans; subscription billing, cancel anytime
- [ ] **Landing page** — standalone marketing page with value proposition, screenshots, pricing table, and sign-up CTA (separate from the app)
- [ ] **Onboarding flow** — guided first-run experience so a new coach reaches their first complete session in under 5 minutes
- [ ] **Multi-language** — Spanish + English; Spanish first (primary market is Spain + Latin America)
- [ ] **PWA manifest + service worker** — offline attendance marking during live sessions on court with no cell signal
- [ ] **Push notifications via PWA** — session reminders 30 min before, plan milestone alerts ("you've completed phase 1")
- [ ] **PDF player report** — exportable, printable progress report per player; the coach hands it to the player or prints it for parents
- [ ] **Academy / multi-coach** — one organization, multiple coaches, shared player pool. Uses the `organizations` table already modeled in the schema

### Phase 7 — Ecosystem

- [ ] React Native app (iOS + Android) — only after PWA proves insufficient for real coaches in production
- [ ] App Store + Play Store publish
- [ ] Player-facing app — player sees their own profile, upcoming sessions, plan progress (separate auth scope)
- [ ] Coach content marketplace — coaches can publish training block libraries and strategy packs (optional community feature, requires critical mass of users)

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. A coach can show a player exactly how their endurance score improved over 6 months.

**vs a generic tool (Notion, spreadsheet):** Built specifically for padel. Session types, competition categories, court zones, dominant hand, training block types, plan phases — the data model speaks the coach's language.

**vs other coaching apps:** Focused on padel first. Simpler and cheaper than broad sports management platforms aimed at academies or clubs. The shared player profile, tactical whiteboard, and Playtomic integration are padel-native features that generic tools cannot offer.

**vs a Playtomic-only workflow:** Playtomic manages court bookings. pctmt manages what happens *during* those bookings — the coaching content, player development, and long-term progress. They are complementary, not competing.

---

## The "Worth Paying For" Moment

A coach subscribes because the tool makes them look professional in front of their players. The specific moment: coach pulls out their phone mid-session, opens the shared player profile for María, and shows her the progress chart — endurance up 18 points over 4 months, attendance at 92%, semifinal at the last competition. María sees her own trajectory. The coach's value is visible. That justifies both the coaching fee and the pctmt subscription.

This moment is fully live in production. Everything in the remaining roadmap either enables it further or makes it happen faster.
