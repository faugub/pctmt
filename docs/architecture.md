# pctmt — Architecture

Technical design, database schema, and engineering decisions.

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.9 | App Router, TypeScript |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| Charts | Recharts | v2 | Progress chart in dashboard and player profile |
| Database | Supabase (PostgreSQL) | cloud | Hosted, free tier |
| Auth | Supabase Auth | via `@supabase/ssr` | Cookie-based sessions |
| Payments | Stripe | — | Deferred Phase 5 |
| Deploy | Vercel | — | Auto-deploy on push to `main` |
| Cron jobs | Vercel Cron | — | Playtomic sync (Phase 4C) |
| Native app | React Native (Expo) | — | Phase 6 |

---

## Database Schema

### Entity Hierarchy

```
organizations                    (optional — Phase 5, multi-coach academies)
└── coaches                      (primary unit — the paying customer)
    ├── players
    │   ├── player_snapshots     (physical + performance history over time)
    │   └── tournament_results   (results per player per tournament)
    ├── session_series           (recurring schedule templates)
    │   └── sessions             (concrete instances, series_id + series_index)
    │       ├── session_players  (many-to-many: players ↔ sessions + attendance)
    │       └── session_blocks   (ordered training blocks assigned to a session)
    ├── training_blocks          (reusable exercise block library per coach)
    ├── training_plans           (multi-session plans for groups or individuals)
    │   ├── plan_phases          (optional phase groupings within a plan)
    │   └── plan_sessions        (planned session slots; links to real session when it occurs)
    ├── tournaments
    │   └── tournament_results   (results per player per tournament)
    ├── strategies               (play library with court zones and tags)
    └── playtomic_connections    (OAuth credentials for Playtomic API — Phase 4C)
        └── playtomic_bookings   (raw bookings imported from Playtomic)
```

### Table Reference — Core (live)

| Table | Description | Key fields |
|---|---|---|
| `coaches` | The paying user of the system | `email`, `full_name`, `plan`, `org_id` |
| `organizations` | Academy grouping coaches (optional) | `name`, `owner_id` |
| `players` | Coach's players | `full_name`, `birth_date`, `dominant_hand`, `level`, `weight_kg`, `height_cm` |
| `player_snapshots` | Physical + performance at a point in time | `recorded_at`, `weight_kg`, `height_cm`, `endurance_score`, `speed_score`, `strength_score`, `technique_score` |
| `sessions` | Training sessions (concrete instances) | `title`, `session_date`, `duration_min`, `session_type`, `objectives`, `notes`, `series_id`, `series_index` |
| `session_players` | Attendance per player per session | `session_id`, `player_id`, `attended` |
| `tournaments` | Registered tournaments | `name`, `start_date`, `end_date`, `location`, `category` |
| `tournament_results` | Results per player per tournament | `player_id`, `partner_name`, `final_round`, `sets_won`, `sets_lost` |
| `strategies` | Coach's play library | `title`, `court_zone`, `description`, `tags[]` |

### Table Reference — Phase 4A (calendar + blocks)

| Table | Description | Key fields |
|---|---|---|
| `session_series` | Recurring schedule template | `coach_id`, `title`, `session_type`, `recurrence_days int[]`, `start_time`, `duration_min`, `starts_on`, `ends_on`, `category`, `level`, `player_ids uuid[]` |
| `training_blocks` | Reusable exercise blocks library | `coach_id`, `title`, `block_type` (warmup/technique/physical/tactical/match/cool), `description`, `duration_min`, `tags[]`, `strategy_id` (nullable FK) |
| `session_blocks` | Blocks assigned to a session, ordered | `session_id`, `block_id` (nullable — null means inline/custom), `strategy_id` (nullable), `sort_order`, `custom_notes`, `duration_override` |

**Recurrence model:** `session_series` stores the schedule template. Concrete `sessions` rows are generated on series creation (or on demand per week) with `series_id` and `series_index` populated. Edit scope ("only this / this and future / entire series") is resolved with `WHERE series_id = X AND series_index >= N`.

**`session_series.recurrence_days`** is an `int[]` where 0 = Sunday, 1 = Monday … 6 = Saturday. Example: `{2,4}` = Tuesday + Thursday.

### Table Reference — Phase 4B (training plans + sharing)

| Table | Description | Key fields |
|---|---|---|
| `training_plans` | A multi-session plan for a group or individual | `coach_id`, `title`, `description`, `target_type` ('group'/'individual'), `target_id` (series_id or player_id), `total_sessions`, `status`, `starts_on`, `goal_description` |
| `plan_phases` | Optional phase groupings within a plan | `plan_id`, `title`, `sort_order`, `session_count`, `objectives`, `notes`, `color` |
| `plan_sessions` | Planned session slots; one row per session number | `plan_id`, `phase_id` (nullable), `session_number`, `session_id` (nullable FK — fills when real session occurs), `block_ids uuid[]`, `notes`, `status` (planned/done/skipped) |

**Polymorphic target:** `training_plans.target_type + target_id` replaces two separate FK columns. Group plan: `target_type='group'`, `target_id=session_series.id`. Individual plan: `target_type='individual'`, `target_id=players.id`. No join table needed; resolve in application layer with a type check.

**Plan ↔ reality link:** `plan_sessions.session_id` starts NULL (planned). When a real session is marked complete, the application fills this FK. `plan_sessions.status` flips to 'done' automatically. This is the bridge between planning and execution — queryable for progress views without scanning attendance tables.

**Shareable player profile:** Add `share_token UUID DEFAULT gen_random_uuid()` and `share_enabled BOOLEAN DEFAULT false` to the `players` table. Public route `/share/player/[token]` bypasses auth, reads only the columns needed for the profile view. RLS policy: allow SELECT on `players` WHERE `share_enabled = true` matching `share_token` (no auth.uid() check on this specific policy).

### Table Reference — Phase 4C (Playtomic integration)

| Table | Description | Key fields |
|---|---|---|
| `playtomic_connections` | One per coach; stores OAuth credentials | `coach_id`, `client_id`, `client_secret` (encrypted), `access_token`, `token_expires_at`, `club_id`, `club_name`, `last_sync_at`, `sync_status` |
| `playtomic_bookings` | Raw bookings imported from Playtomic | `coach_id`, `playtomic_booking_id`, `court_name`, `start_at`, `end_at`, `player_names text[]`, `player_emails text[]`, `session_id` (nullable FK — fills on convert), `raw_payload jsonb`, `synced_at` |

**Security:** `client_secret` must never be returned to the client. Store encrypted in Supabase (use `pgcrypto` extension or Supabase Vault). The Next.js route handler that performs the sync runs server-side only and decrypts at call time.

**Sync architecture:** Vercel Cron calls `/api/playtomic/sync` (route handler, not a Server Action — crons cannot call Server Actions). The handler: (1) fetches all coaches with active `playtomic_connections`, (2) refreshes expired tokens, (3) calls Playtomic API for next 14 days of bookings, (4) upserts into `playtomic_bookings` by `playtomic_booking_id`. Rate limit is ~1 req/min per Playtomic's documentation — stagger syncs across coaches if needed.

**Player matching:** On "Convert to session", match `playtomic_bookings.player_emails` against `players.email` for the coach. Matched players are added to `session_players` automatically. Unmatched names are shown for manual selection.

**`raw_payload JSONB`** preserves the complete Playtomic API response. If Playtomic changes their schema, historical imports are safe and can be re-mapped without data loss.

### Row Level Security

RLS is enabled on all tables. Every policy is scoped to `auth.uid()` so a coach can only read and write their own data. This is enforced at the database level — application bugs cannot cause cross-coach data leakage.

**Exception — shared player profiles:** The `players` table has an additional SELECT policy: `USING (share_enabled = true)` with no `auth.uid()` check. This policy only allows reading the specific columns exposed in the public share route. The application layer enforces column restriction; the RLS policy enforces row restriction.

**Note:** The `coaches` table requires two separate policies: `for all using` (SELECT/UPDATE/DELETE) and `for insert with check` (INSERT on registration).

Migration files:
- `supabase/migrations/20260611000001_initial_schema.sql` — Phases 1–3 ✅ applied
- `supabase/migrations/20260615000002_phase4a_calendar_blocks.sql` — Phase 4A (pending)
- `supabase/migrations/20260615000003_phase4b_plans_sharing.sql` — Phase 4B (pending)
- `supabase/migrations/20260615000004_phase4c_playtomic.sql` — Phase 4C (pending)

Keeping migrations separate makes rollback safe and keeps git history readable.

---

## Auth Flow

```
User visits any route
       ↓
middleware.ts intercepts request
       ↓
updateSession() refreshes Supabase cookie
       ↓
No valid session?  ──→  Redirect to /login
Valid session?     ──→  Allow through to dashboard
```

Public share routes (`/share/player/[token]`) bypass middleware auth check — they are excluded from the protected route pattern.

### Server Actions vs Route Handlers

All user-initiated mutations use Next.js Server Actions. Background jobs (Playtomic sync) use Route Handlers because Vercel Cron cannot invoke Server Actions.

**Server Actions (current):**

| File | Actions |
|---|---|
| `src/app/actions/auth.ts` | `login`, `register`, `logout` |
| `src/app/actions/players.ts` | `createPlayer`, `updatePlayer`, `deletePlayer` |
| `src/app/actions/snapshots.ts` | `createSnapshot`, `deleteSnapshot` |
| `src/app/actions/sessions.ts` | `createSession`, `updateSession`, `updateAttendance`, `deleteSession` |
| `src/app/actions/tournaments.ts` | `createTournament`, `updateTournament`, `addResult`, `deleteResult`, `deleteTournament` |
| `src/app/actions/strategies.ts` | `createStrategy`, `updateStrategy`, `deleteStrategy` |

**Planned Server Actions (Phase 4A–4B):**

| File | Actions |
|---|---|
| `src/app/actions/series.ts` | `createSeries`, `updateSeries`, `deleteSeries`, `generateSessionsForWeek` |
| `src/app/actions/blocks.ts` | `createBlock`, `updateBlock`, `deleteBlock` |
| `src/app/actions/sessionBlocks.ts` | `addBlockToSession`, `reorderBlocks`, `removeBlockFromSession` |
| `src/app/actions/plans.ts` | `createPlan`, `updatePlan`, `deletePlan`, `addPhase`, `linkSessionToPlan` |
| `src/app/actions/sharing.ts` | `enablePlayerShare`, `disablePlayerShare`, `regenerateShareToken` |

**Planned Route Handlers (Phase 4C):**

| File | Purpose |
|---|---|
| `src/app/api/playtomic/sync/route.ts` | Called by Vercel Cron; performs hourly booking sync |
| `src/app/api/playtomic/connect/route.ts` | Saves + validates Playtomic credentials |

Supabase client files:

| File | Used in | Purpose |
|---|---|---|
| `src/lib/supabase/client.ts` | Client components | Browser-side queries |
| `src/lib/supabase/server.ts` | Server components, Server Actions | Server-side queries |
| `src/lib/supabase/middleware.ts` | `src/middleware.ts` | Session refresh on every request |

---

## Component Patterns

### Server vs Client split

All pages are Server Components by default. Client Components (`'use client'`) are used only when interactivity is required:

| Component | Reason for client |
|---|---|
| `AttendanceToggle` | Optimistic UI toggle with `useTransition` |
| `DeletePlayerButton` | `onSubmit` confirm dialog |
| `DeleteSnapshotButton` | `onSubmit` confirm dialog |
| `DeleteSessionButton` | `onSubmit` confirm dialog |
| `DeleteTournamentButton` | `onSubmit` confirm dialog |
| `DeleteResultButton` | `onSubmit` confirm dialog |
| `DeleteStrategyButton` | `onSubmit` confirm dialog |
| `PlayerForm` | Form with controlled inputs and defaultValues |
| `SessionForm` | Form with defaultValues + checkbox list |
| `SnapshotForm` | Form with defaultValues |
| `TournamentForm` | Form with defaultValues |
| `ResultForm` | Form with player select |
| `StrategyForm` | Form with defaultValues and tag parsing |
| `ProgressChart` | Recharts LineChart (requires browser APIs) |
| `WeeklyCalendar` | (Phase 4A) CSS grid with time slots, drag interactions |
| `BlockLibraryPanel` | (Phase 4A) Searchable list with add-to-session action |
| `PlanTimeline` | (Phase 4B) Visual plan progress with phase bands |
| `PlaytomicBadge` | (Phase 4C) Badge + convert button on imported bookings |

### Supabase join typing pattern

Supabase infers join results as arrays even for single-row foreign keys. Always type the full query result, not the individual field:

```typescript
// ✓ Correct
type Row = { player_id: string; players: { full_name: string } | null }
const { data } = await supabase
  .from('session_players')
  .select('player_id, players(full_name)') as { data: Row[] | null }

// ✗ Wrong — TS build error
const name = (row.players as { full_name: string } | null)?.full_name
```

### Polymorphic target pattern (training_plans)

`training_plans.target_type + target_id` is a polymorphic association. Resolve in the application layer:

```typescript
type PlanTarget =
  | { target_type: 'group'; target_id: string }   // → session_series.id
  | { target_type: 'individual'; target_id: string } // → players.id

async function resolvePlanTarget(plan: PlanTarget) {
  if (plan.target_type === 'group') {
    return supabase.from('session_series').select('title').eq('id', plan.target_id).single()
  }
  return supabase.from('players').select('full_name').eq('id', plan.target_id).single()
}
```

---

## Design Decisions

**2026-06-12 — Coach as the primary unit**
The coach is the paying customer, not the academy. `organizations` is modeled but fully optional — a coach can sign up and operate independently. This simplifies the MVP and enables selling to individual coaches from day one.

**2026-06-12 — `player_snapshots` separate from `players`**
Physical metrics (weight, height) and performance scores change over time. Keeping them in a separate table with a `recorded_at` date enables progress charts over months — a core differentiator vs a notebook or spreadsheet.

**2026-06-12 — PWA first, native later**
The app works on any device from the first deploy without App Store approval or native build pipelines. React Native is added in Phase 6 once real users prove the PWA insufficient.

**2026-06-12 — Supabase RLS as the security boundary**
Access control lives at the database level, not only in application code. Even if a bug exists in the Next.js layer, RLS policies prevent a coach from reading another coach's data.

**2026-06-15 — Server Actions for all user-initiated mutations**
All create/update/delete operations use Next.js Server Actions instead of API routes. This avoids boilerplate, keeps logic server-side, and integrates cleanly with the App Router redirect model. Exception: background/cron jobs use Route Handlers.

**2026-06-15 — No Stripe yet**
Stripe integration is deferred to Phase 5. The `plan` field exists on the `coaches` table and all infrastructure is in place, but no payment flow or plan enforcement is implemented. This will be added once beta coaches validate the product.

**2026-06-15 — `session_series` generates concrete `sessions` rows**
Rather than computing recurrence on the fly at query time, concrete `sessions` rows are generated upfront (on series creation or per-week on demand). This keeps the `sessions` table as the single source of truth for all calendar queries — no special-casing needed in the UI, attendance, or plan linking logic. The `series_id + series_index` fields on `sessions` enable scope-based edits without complexity.

**2026-06-15 — Polymorphic target for training plans**
`training_plans` uses `target_type + target_id` instead of two nullable FKs (`series_id`, `player_id`). This is slightly less SQL-safe (no FK constraint on `target_id`) but keeps the schema flat and extensible — a third target type (e.g. `tournament`) can be added without a migration. The tradeoff is acceptable because plan data is never queried by joining on `target_id` directly; it's always resolved through the application layer.

**2026-06-15 — `raw_payload JSONB` on `playtomic_bookings`**
Playtomic's API schema is not under our control. Storing the full response in `raw_payload` means historical imports survive schema changes on their side. The mapped columns (`court_name`, `start_at`, etc.) are derived from this payload at sync time. If Playtomic adds or renames fields, we re-map from the stored payload rather than re-fetching.

**2026-06-15 — Separate migration files per phase**
One migration file per phase instead of one growing file. Keeps git history readable, makes rollback targeted, and allows applying phases independently on staging before production.

**2026-06-15 — Scalability principle**
Every table introduced is designed to be extended, not replaced. New phases add columns or new tables — they do not restructure existing ones. The `coaches` table already has `org_id` and `plan` for future multi-tenancy and billing. The `sessions` table already has `series_id` even before series exist. This forward-compatibility is intentional: the cost of adding an unused nullable column now is zero; the cost of backfilling it later with production data is not.
