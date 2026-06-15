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
| Payments | Stripe | — | Deferred post-MVP |
| Deploy | Vercel | — | Auto-deploy on push to `main` |
| Native app | React Native (Expo) | — | Phase 4 |

---

## Database Schema

### Entity Hierarchy

```
organizations          (optional — phase 4, multi-coach academies)
└── coaches            (primary unit — the paying customer)
    ├── players
    │   ├── player_snapshots    (physical + performance history over time)
    │   └── tournament_results  (results per player per tournament)
    ├── sessions
    │   └── session_players     (many-to-many: players ↔ sessions + attendance)
    ├── tournaments
    │   └── tournament_results  (results per player per tournament)
    └── strategies
```

### Table Reference

| Table | Description | Key fields |
|---|---|---|
| `coaches` | The paying user of the system | `email`, `full_name`, `plan`, `org_id` |
| `organizations` | Academy grouping coaches (optional) | `name`, `owner_id` |
| `players` | Coach’s players | `full_name`, `birth_date`, `dominant_hand`, `level`, `weight_kg`, `height_cm` |
| `player_snapshots` | Physical + performance at a point in time | `recorded_at`, `weight_kg`, `height_cm`, `endurance_score`, `speed_score`, `strength_score`, `technique_score` |
| `sessions` | Training sessions | `title`, `session_date`, `duration_min`, `session_type`, `objectives`, `notes` |
| `session_players` | Attendance per player per session | `session_id`, `player_id`, `attended` |
| `tournaments` | Registered tournaments | `name`, `start_date`, `end_date`, `location`, `category` |
| `tournament_results` | Results per player per tournament | `player_id`, `partner_name`, `final_round`, `sets_won`, `sets_lost` |
| `strategies` | Coach’s play library | `title`, `court_zone`, `description`, `tags[]` |

### Row Level Security

RLS is enabled on all tables. Every policy is scoped to `auth.uid()` so a coach can only read and write their own data. This is enforced at the database level — application bugs cannot cause cross-coach data leakage.

**Note:** The `coaches` table requires two separate policies: `for all using` (covers SELECT/UPDATE/DELETE) and `for insert with check` (covers INSERT on registration). Both are applied in Supabase.

Migration file: `supabase/migrations/20260611000001_initial_schema.sql`

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

### Server Actions

All data mutations are handled via Next.js Server Actions. No API routes.

| File | Actions |
|---|---|
| `src/app/actions/auth.ts` | `login`, `register`, `logout` |
| `src/app/actions/players.ts` | `createPlayer`, `updatePlayer`, `deletePlayer` |
| `src/app/actions/snapshots.ts` | `createSnapshot`, `deleteSnapshot` |
| `src/app/actions/sessions.ts` | `createSession`, `updateSession`, `updateAttendance`, `deleteSession` |
| `src/app/actions/tournaments.ts` | `createTournament`, `updateTournament`, `addResult`, `deleteResult`, `deleteTournament` |
| `src/app/actions/strategies.ts` | `createStrategy`, `updateStrategy`, `deleteStrategy` |

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

---

## Design Decisions

**2026-06-12 — Coach as the primary unit**
The coach is the paying customer, not the academy. `organizations` is modeled but fully optional — a coach can sign up and operate independently. This simplifies the MVP and enables selling to individual coaches from day one.

**2026-06-12 — player_snapshots separate from players**
Physical metrics (weight, height) and performance scores change over time. Keeping them in a separate table with a `recorded_at` date enables progress charts over months — a core differentiator vs a notebook or spreadsheet.

**2026-06-12 — PWA first, native later**
The app works on any device from the first deploy without App Store approval or native build pipelines. React Native is added in phase 4 once real users are validating the product.

**2026-06-12 — Supabase RLS as the security boundary**
Access control lives at the database level, not only in application code. Even if a bug exists in the Next.js layer, RLS policies prevent a coach from reading another coach’s data.

**2026-06-15 — Server Actions for all mutations**
All create/update/delete operations use Next.js Server Actions instead of API routes. This avoids boilerplate, keeps logic server-side, and integrates cleanly with the App Router redirect model.

**2026-06-15 — No Stripe yet**
Stripe integration is deferred. The `plan` field exists on the `coaches` table and all infrastructure is in place, but no payment flow or plan enforcement is implemented. This will be added once beta coaches validate the product.
