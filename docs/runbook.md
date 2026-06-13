# pctmt — Runbook

Technical decisions, environment setup, and operational procedures.

---

## Development Environment

| Component | Detail |
|---|---|
| OS | Fedora 42 (WSL2 on Windows) |
| Node.js | v20.20.2 (via fnm) |
| Package manager | npm |
| Test browser | Chrome on Windows → localhost:3000 |

### Start the development server

```bash
cd ~/pctmt
npm run dev
# Open http://localhost:3000
```

### Stop the server

```bash
Ctrl+C
```

---

## Repository

| Item | Value |
|---|---|
| GitHub | https://github.com/faugub/pctmt |
| Main branch | `main` |
| Direct push to main | Yes (for now, phase 1) |

### Commit and push

```bash
cd ~/pctmt
git add .
git commit -m "type: short description"
git push origin main
```

**Commit types:**
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — config, dependencies

### Git credentials (GitHub token)

The remote is configured with a PAT token embedded in the URL. If it expires (90 days), generate a new token at https://github.com/settings/tokens and run:

```bash
git remote set-url origin https://faugub:NEW_TOKEN@github.com/faugub/pctmt.git
```

---

## Supabase

| Item | Value |
|---|---|
| Project | pctmt |
| Project ID | rwngpdgycmzqyiqlqvdn |
| Region | us-east-1 (East US, North Virginia) |
| Dashboard | https://supabase.com/dashboard/project/rwngpdgycmzqyiqlqvdn |
| URL | https://rwngpdgycmzqyiqlqvdn.supabase.co |

### Local environment variables

File: `~/pctmt/.env.local` (never committed to GitHub)

```
NEXT_PUBLIC_SUPABASE_URL=[https://rwngpdgycmzqyiqlqvdn.supabase.co](https://<project-id>.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

If `.env.local` is lost, recreate it with the values above.

### Running SQL migrations

Migrations are in `supabase/migrations/`. To apply them:
1. Go to the Supabase dashboard → **SQL Editor**
2. Copy the migration file contents
3. Run

> Pending: configure Supabase CLI to run migrations from the terminal.

---

## Database

Schema designed in Phase 1. 10 core tables:

| Table | Description |
|---|---|
| `coaches` | The paying user of the system |
| `organizations` | Academy (optional, phase 4) |
| `players` | Coach's players |
| `player_snapshots` | Player physical/performance history over time |
| `sessions` | Training sessions |
| `session_players` | Attendance per player per session |
| `tournaments` | Registered tournaments |
| `tournament_results` | Results per player per tournament |
| `strategies` | Coach's play library |

Row Level Security (RLS) enabled on all tables. Each coach can only access their own data.

Migration file: `supabase/migrations/20260611000001_initial_schema.sql`

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.9 |
| Language | TypeScript | latest |
| Styling | Tailwind CSS | latest |
| Database | Supabase (PostgreSQL) | cloud |
| Auth | Supabase Auth | via @supabase/ssr |
| Payments | Stripe | phase 3 |
| Deploy | Vercel | phase 2 |
| Native app | React Native (Expo) | phase 4 |

---

## Project Structure

```
pctmt/
├── docs/                          # Project documentation
│   └── runbook.md                 # This file
├── public/                        # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/             # Login page ✅
│   │   │   └── register/          # Register page (pending)
│   │   ├── (dashboard)/
│   │   │   ├── players/           # Players module (pending)
│   │   │   ├── sessions/          # Sessions module (pending)
│   │   │   ├── tournaments/       # Tournaments module (pending)
│   │   │   └── strategies/        # Strategies module (pending)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/                    # Shared components (pending)
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts          # Browser client ✅
│   │       ├── server.ts          # Server client ✅
│   │       └── middleware.ts      # Session refresh ✅
│   └── middleware.ts              # Route protection ✅
├── supabase/
│   └── migrations/
│       └── 20260611000001_initial_schema.sql  ✅
├── .env.example                   # Variable template (no real values)
├── .env.local                     # Real variables (NOT in git)
└── README.md
```

---

## Phase Progress

### Phase 1 — Foundations ✅ (in progress)
- [x] GitHub repo created (`faugub/pctmt`)
- [x] WSL Fedora 42 environment configured
- [x] Node.js 20 installed via fnm
- [x] Next.js 16 + TypeScript + Tailwind scaffold
- [x] Supabase installed and connected
- [x] Auth middleware (route protection)
- [x] Login page (static UI)
- [x] Database schema designed
- [x] SQL migration written
- [ ] SQL migration applied in Supabase
- [ ] Functional login (connected to Supabase Auth)
- [ ] Functional register
- [ ] Basic post-login dashboard

### Phase 2 — Functional MVP
- [ ] Players module (full CRUD)
- [ ] Sessions module
- [ ] Tournaments module
- [ ] Deploy on Vercel

### Phase 3 — Full Product
- [ ] Strategies module
- [ ] Dashboard with analytics
- [ ] Stripe — subscriptions

### Phase 4 — Scale
- [ ] React Native app
- [ ] Multi-language support
- [ ] Academy support (organizations)

---

## Design Decisions

**2026-06-12 — Coach as the primary unit**
The coach is the paying customer, not the academy. The `organizations` table exists but is optional. A coach can operate independently. This simplifies the MVP and enables selling to individual coaches from day one.

**2026-06-12 — player_snapshots separate from players**
Weight, height, and performance metrics change over time. Storing them as snapshots enables progress charts — the key differentiator vs a notebook.

**2026-06-12 — PWA first, native later**
The app works on any device from the first deploy without needing the App Store. React Native is added in phase 4 once real users are validating the product.

