# pctmt

> SaaS platform for padel coaches — calendar, sessions, training content, player development, and competition tracking

**Live:** https://pctmt-azure.vercel.app
**Repo:** https://github.com/faugub/pctmt

## What is this?

**pctmt** is a web-based platform for padel coaches who want to digitize their work. It replaces notebooks, spreadsheets, and WhatsApp threads with a purpose-built tool: a recurring-class calendar, a reusable training block library, multi-session plans, a tactical whiteboard, player progress tracking, and a shareable player profile coaches can show mid-session on their phone.

The product is built mobile/tablet-first — coaches use it courtside, often on a tablet, between or during classes.

---

## Core modules

| Module | Description |
|---|---|
| **Calendar** | Week and month views, recurring class series with scoped edit/delete (this occurrence / future / entire series) |
| **Sessions** | Plan classes, attach training blocks as a live checklist, track attendance |
| **Training blocks** | Reusable exercise library (warmup, technique, physical, tactical, match, cooldown), optionally linked to a strategy |
| **Training plans** | Multi-session plans with phases, for a group (recurring series) or an individual player |
| **Strategies** | Play library tagged by court zone, linkable to a tactical whiteboard |
| **Tactical whiteboard** | Drag-and-drop court diagram — players, ball, and shot lines, autosaved |
| **Players** | Full profiles with physical/performance snapshots over time and a progress chart |
| **Shareable player profile** | Public read-only link a coach can send a player — progress chart, attendance, competition results, no login required |
| **Competencias** | Tracks where a player competed externally and what they achieved (not a bracket organizer — the coach doesn't run the tournament) |
| **Dashboard** | Coach utilization (hours coached per month), recent sessions, upcoming competitions |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Backend / DB | Supabase (PostgreSQL + Auth, RLS-enforced) |
| Deployment | Vercel (auto-deploy on push to `main`) |

No payments integration yet — see [`docs/product.md`](./docs/product.md) for the roadmap.

---

## Project structure

```
pctmt/
├── docs/                     # Architecture, product, runbook, QA script — read these first
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, register
│   │   ├── (dashboard)/      # Main app — protected routes
│   │   │   ├── players/
│   │   │   ├── sessions/
│   │   │   ├── calendar/
│   │   │   ├── series/       # Recurring series create/edit
│   │   │   ├── blocks/       # Training block library
│   │   │   ├── plans/
│   │   │   ├── strategies/
│   │   │   ├── boards/       # Tactical whiteboard
│   │   │   └── tournaments/  # "Competencias" — UI copy reframed, routes/table names unchanged
│   │   ├── share/player/[token]/  # Public profile, no auth
│   │   └── actions/          # Server Actions, one file per domain
│   ├── components/ui/        # Client components (forms, toggles, the whiteboard editor, etc.)
│   └── lib/supabase/         # Client/server Supabase helpers + middleware
├── supabase/
│   └── migrations/           # SQL, applied manually in order — see docs/runbook.md
└── public/
```

See [`docs/architecture.md`](./docs/architecture.md) for the full schema and design decisions.

---

## Getting started (development)

> Prerequisites: Node.js 20+, a Supabase project

```bash
git clone https://github.com/faugub/pctmt.git
cd pctmt
npm install

cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

Migrations live in `supabase/migrations/` and are **not** applied automatically — run each one in order via the Supabase SQL editor or `npx supabase db push`. See [`docs/runbook.md`](./docs/runbook.md) for the current list and which ones are applied in production.

---

## Documentation

| Doc | Contents |
|---|---|
| [`docs/product.md`](./docs/product.md) | Vision, target customer, roadmap by phase |
| [`docs/architecture.md`](./docs/architecture.md) | Schema, RLS, component patterns, design decisions |
| [`docs/runbook.md`](./docs/runbook.md) | Deploy info, env vars, project structure, known gaps |
| [`docs/qa-runbook.md`](./docs/qa-runbook.md) | Manual end-to-end test script |

---

## License

MIT — see [LICENSE](./LICENSE).
