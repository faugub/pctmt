# pctmt

> SaaS platform for padel coaches — player management, sessions, tournaments & strategy

## What is this?

**pctmt** is a web-based platform designed for padel coaches who want to digitize their work. It lets coaches manage their players, plan and track training sessions, log tournament results, and build a library of strategies — all from any device.

Built as a Progressive Web App (PWA) first, with native iOS/Android planned for a later phase.

---

## Core modules

| Module | Description |
|---|---|
| Players | Full player profiles with physical snapshots over time |
| Sessions | Plan classes, track attendance, log objectives and notes |
| Tournaments | Register events, record results per player and pair |
| Strategies | Court diagrams, notes, tagged by zone and play type |
| Dashboard | Progress charts, attendance stats, tournament history |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe |
| Deployment | Vercel |
| Native (phase 4) | React Native (Expo) |

---

## Project structure

```
pctmt/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login, register, onboarding
│   ├── (dashboard)/      # Main app — protected routes
│   │   ├── players/
│   │   ├── sessions/
│   │   ├── tournaments/
│   │   └── strategies/
│   └── api/              # API route handlers
├── components/           # Shared UI components
├── lib/                  # Supabase client, helpers, types
├── supabase/
│   └── migrations/       # SQL migration files
└── public/               # Static assets
```

---

## Getting started (development)

> Prerequisites: Node.js 20+, a Supabase project, a Vercel account

```bash
# 1. Clone the repo
git clone https://github.com/faugub/pctmt.git
cd pctmt

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and Stripe keys

# 4. Run database migrations
npx supabase db push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema

See [`supabase/migrations/`](./supabase/migrations/) for the full schema.

Core entities: `coaches` → `players` → `player_snapshots`, `sessions` ↔ `session_players`, `tournaments` → `tournament_results`, `strategies`.

Organizations (multi-coach academies) are modeled but optional — a coach can operate independently.

---

## Roadmap

- [x] Database schema design
- [ ] Project scaffolding (Next.js + Supabase)
- [ ] Auth flow (register, login, onboarding)
- [ ] Players module
- [ ] Sessions module
- [ ] Tournaments module
- [ ] Strategies module
- [ ] Dashboard & analytics
- [ ] Stripe subscription integration
- [ ] PWA manifest + offline support
- [ ] React Native app (iOS + Android)

---

## License

MIT — see [LICENSE](./LICENSE).
