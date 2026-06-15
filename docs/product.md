# pctmt — Product

Vision, target customer, roadmap, and pricing.

---

## What is pctmt?

**pctmt** is a SaaS platform built for padel coaches who want to digitize their work. It replaces notebooks and spreadsheets with a purpose-built tool for managing players, planning training sessions, tracking tournament results, and building a strategy library.

The core value proposition: a coach can show a player their progress over months — physical metrics, tournament history, session attendance — in a way that a notebook never could. As the product matures, it becomes the operating system of a professional padel coach: calendar, planning, content library, player development, and external integrations in one place.

---

## Target Customer

**Primary:** Individual padel coaches operating independently or attached to an academy.

The coach is the buyer — not the academy. A coach signs up, pays, and owns their data. They can work solo or, in a later phase, join an academy account.

**Profile:**
- Manages 10–40 active players
- Runs group and individual sessions on recurring weekly schedules
- Participates in local and regional tournaments
- Currently tracks everything in WhatsApp, notes apps, or paper
- May operate through a Playtomic-enabled club (relevant for Phase 4C integration)

---

## Business Model

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | Up to 5 players, basic session log |
| **Pro** | ~$15–20/month | Unlimited players, all modules, training plans, Playtomic sync |
| **Academy** | TBD | Multi-coach, shared player pool, organization management (Phase 5+) |

> Pricing to be validated with beta users before locking in.

Payments via Stripe. Subscription billed monthly, cancel anytime. Stripe integration deferred post-MVP.

---

## Core Modules

| Module | Description | Status |
|---|---|---|
| **Players** | Full profiles, physical snapshots, progress chart, session history | ✅ Live |
| **Sessions** | Plan classes, set objectives, log attendance | ✅ Live |
| **Tournaments** | Register events, record results per player and pair | ✅ Live |
| **Strategies** | Play library with court zones and tags | ✅ Live |
| **Dashboard** | Stats, progress chart, recent sessions, upcoming tournaments | ✅ Live |
| **Calendar** | Weekly 7-column view, recurring series, session type classification | 🔜 Phase 4A |
| **Training blocks** | Reusable exercise block library; drag or click into sessions | 🔜 Phase 4A |
| **Training plans** | Multi-session plans with phases, for groups or individual players | 🔜 Phase 4B |
| **Shared player profile** | Public read-only progress link for players, shareable via WhatsApp | 🔜 Phase 4B |
| **Playtomic sync** | Import club bookings from Playtomic, convert to sessions in one click | 🔜 Phase 4C |
| **Stripe** | Free + Pro plan enforcement, subscription billing | ⏳ Phase 5 |
| **PWA** | Offline support, installable on mobile, push notifications | ⏳ Phase 5 |

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
- [ ] Stripe integration — deferred to Phase 5
- [ ] Email notifications — deferred
- [ ] PWA manifest + offline support — deferred to Phase 5

### Phase 4A — Calendar + Training Blocks

Makes sessions feel structured and professional. The coach stops typing from scratch every class.

- [ ] **Session series** — recurring schedules (e.g. "Academia B1 · Tue+Thu · 18:00 · 90 min") with default player list, session type (academy / individual / pairs), category, and level
- [ ] **Weekly calendar** — 7-column view (Mon–Sun with time slots), sessions rendered as cards with color coding by type
- [ ] **Recurrence edit scope** — when editing a session in a series, coach chooses: only this / this and future / entire series (stored via `series_id` + `series_index` on the `sessions` table)
- [ ] **Training blocks library** — global reusable blocks per coach: warmup, technique, physical, tactical, match play, cool-down. Each has title, type, duration, description, tags, and optional link to an existing strategy
- [ ] **Blocks on sessions** — add blocks from library or create inline; reorder with drag or up/down buttons; override duration per instance; custom notes per block
- [ ] **Schema migration** — `session_series`, `training_blocks`, `session_blocks`; add `series_id UUID` and `series_index INT` to existing `sessions` table

### Phase 4B — Training Plans + Player Sharing

The layer that makes coaching value visible — to the coach, to the player, and to whoever is paying for lessons.

- [ ] **Training plans** — multi-session plans attached to either a session series (group plan) or an individual player (individual plan). Define phases, assign blocks per planned session, set an overall goal. `plan_sessions.session_id` fills in as real sessions occur, linking plan to reality automatically
- [ ] **Plan progress view** — timeline showing planned vs completed sessions per plan, phase color bands, completion percentage. Coach sees at a glance if they're on track
- [ ] **Shared player profile** — public read-only link at `/share/player/[token]`, shareable via WhatsApp or any channel. Shows progress chart, last-month attendance rate, tournaments played. No account required for the player. This is the "wow moment" that justifies the coach's subscription fee to themselves
- [ ] **Session report summary** — after marking attendance, one-tap summary of blocks covered and notes, stored per session for future reference

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

### Phase 5 — Monetization + Retention

To be refined based on real coach feedback from Phases 4A–4C. This phase turns the product into a business.

- [ ] **Stripe integration** — enforce Free (≤5 players) vs Pro (unlimited) plans; subscription billing, cancel anytime
- [ ] **Landing page** — standalone marketing page with value proposition, screenshots, pricing table, and sign-up CTA (separate from the app)
- [ ] **Onboarding flow** — guided first-run experience so a new coach reaches their first complete session in under 5 minutes
- [ ] **Multi-language** — Spanish + English; Spanish first (primary market is Spain + Latin America)
- [ ] **PWA manifest + service worker** — offline attendance marking during live sessions on court with no cell signal
- [ ] **Push notifications via PWA** — session reminders 30 min before, plan milestone alerts ("you've completed phase 1")
- [ ] **PDF player report** — exportable, printable progress report per player; the coach hands it to the player or prints it for parents
- [ ] **Academy / multi-coach** — one organization, multiple coaches, shared player pool. Uses the `organizations` table already modeled in the schema

### Phase 6 — Ecosystem

- [ ] React Native app (iOS + Android) — only after PWA proves insufficient for real coaches in production
- [ ] App Store + Play Store publish
- [ ] Player-facing app — player sees their own profile, upcoming sessions, plan progress (separate auth scope)
- [ ] Coach content marketplace — coaches can publish training block libraries and strategy packs (optional community feature, requires critical mass of users)

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. A coach can show a player exactly how their endurance score improved over 6 months.

**vs a generic tool (Notion, spreadsheet):** Built specifically for padel. Session types, tournament categories, court zones, dominant hand, training block types, plan phases — the data model speaks the coach's language.

**vs other coaching apps:** Focused on padel first. Simpler and cheaper than broad sports management platforms aimed at academies or clubs. The shared player profile and Playtomic integration are padel-native features that generic tools cannot offer.

**vs a Playtomic-only workflow:** Playtomic manages court bookings. pctmt manages what happens *during* those bookings — the coaching content, player development, and long-term progress. They are complementary, not competing.

---

## The "Worth Paying For" Moment

A coach subscribes because the tool makes them look professional in front of their players. The specific moment: coach pulls out their phone mid-session, opens the shared player profile for María, and shows her the progress chart — endurance up 18 points over 4 months, attendance at 92%, semifinal at the last tournament. María sees her own trajectory. The coach's value is visible. That justifies both the coaching fee and the pctmt subscription.

Everything in the roadmap either enables that moment or makes it happen faster.
