# pctmt — Architecture

Technical design, database schema, and engineering decisions.

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.9 | App Router, TypeScript |
| Styling | Tailwind CSS | latest | Utility-first CSS |
| Database | Supabase (PostgreSQL) | cloud | Hosted, free tier to start |
| Auth | Supabase Auth | via `@supabase/ssr` | Cookie-based sessions |
| Payments | Stripe | — | Phase 3 |
| Deploy | Vercel | — | Phase 2 |
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
| `players` | Coach's players | `full_name`, `birth_date`, `dominant_hand`, `level`, `weight_kg`, `height_cm` |
| `player_snapshots` | Physical + performance at a point in time | `recorded_at`, `weight_kg`, `height_cm`, `endurance_score`, `speed_score`, `strength_score`, `technique_score` |
| `sessions` | Training sessions | `title`, `session_date`, `duration_min`, `session_type`, `objectives`, `notes` |
| `session_players` | Attendance per player per session | `session_id`, `player_id`, `attended` |
| `tournaments` | Registered tournaments | `name`, `start_date`, `end_date`, `location`, `category` |
| `tournament_results` | Results per player per tournament | `player_id`, `partner_name`, `final_round`, `sets_won`, `sets_lost` |
| `strategies` | Coach's play library | `title`, `court_zone`, `description`, `tags[]` |

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

Auth mutations are handled via Next.js Server Actions in `src/app/actions/auth.ts`:

| Action | Description |
|---|---|
| `login(formData)` | Calls `signInWithPassword`, redirects to `/dashboard` |
| `register(formData)` | Calls `signUp`, inserts row into `coaches`, redirects to `/dashboard` |
| `logout()` | Calls `signOut`, redirects to `/login` |

Supabase client files:

| File | Used in | Purpose |
|---|---|---|
| `src/lib/supabase/client.ts` | Client components | Browser-side queries |
| `src/lib/supabase/server.ts` | Server components, API routes | Server-side queries |
| `src/lib/supabase/middleware.ts` | `src/middleware.ts` | Session refresh on every request |

---

## Design Decisions

**2026-06-12 — Coach as the primary unit**
The coach is the paying customer, not the academy. `organizations` is modeled but fully optional — a coach can sign up and operate independently. This simplifies the MVP and enables selling to individual coaches from day one. Academy support is added in phase 4 without requiring schema changes.

**2026-06-12 — player_snapshots separate from players**
Physical metrics (weight, height) and performance scores change over time. Keeping them in a separate table with a `recorded_at` date enables progress charts over months — a core differentiator vs a notebook or spreadsheet. The `players` table holds only stable identity data.

**2026-06-12 — PWA first, native later**
The app works on any device from the first deploy without App Store approval or native build pipelines. React Native is added in phase 4 once real users are validating the product and the API is stable.

**2026-06-12 — Supabase RLS as the security boundary**
Access control lives at the database level, not only in application code. Even if a bug exists in the Next.js layer, RLS policies prevent a coach from reading another coach's data. This is non-negotiable for a multi-tenant SaaS handling personal athlete data.

**2026-06-15 — Server Actions for auth mutations**
Login, register, and logout are implemented as Next.js Server Actions rather than API routes. This avoids boilerplate, keeps auth logic server-side, and works seamlessly with the App Router redirect model.
