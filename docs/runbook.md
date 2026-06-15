# pctmt — Runbook

Operational procedures, environment setup, and credentials reference.

---

## Production

| Item | Value |
|---|---|
| URL | https://pctmt-azure.vercel.app |
| Platform | Vercel |
| Deploy trigger | Push to `main` — auto-deploy |
| Build region | Washington D.C., USA (iad1) |

Every push to `main` triggers a production deploy automatically. No manual steps needed.

---

## Development Environment

| Component | Detail |
|---|---|
| OS | Fedora 42 (WSL2 on Windows) |
| Node.js | v20.20.2 (via fnm) |
| Package manager | npm |
| Test browser | Chrome on Windows → localhost:3000 |
| Editor | VS Code with Remote - WSL extension |

### Start the dev server

```bash
cd ~/pctmt
npm run dev
# Open http://localhost:3000
```

### Open in VS Code (from WSL terminal)

```bash
cd ~/pctmt
code .
```

Requires the **Remote - WSL** extension installed in VS Code.

---

## Repository

| Item | Value |
|---|---|
| GitHub | https://github.com/faugub/pctmt |
| Main branch | `main` |
| Direct push to main | Yes |

### Commit and push

```bash
cd ~/pctmt
git add .
git commit -m "type: short description"
git push origin main
```

**Commit types:** `feat` `fix` `docs` `chore`

### GitHub token rotation

Token expires every 90 days. Generate a new one at https://github.com/settings/tokens (scope: `repo`) and run:

```bash
git remote set-url origin https://faugub:NEW_TOKEN@github.com/faugub/pctmt.git
```

Also update the token in **claude.ai → Settings → Integrations → GitHub** so the MCP can write to the repo.

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

File: `~/pctmt/.env.local` — never committed to GitHub.

```
NEXT_PUBLIC_SUPABASE_URL=https://rwngpdgycmzqyiqlqvdn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

If `.env.local` is lost, recreate it from the Supabase dashboard under **Settings → API Keys**.

### Vercel environment variables

Same two variables set in **Vercel → Project Settings → Environment Variables** (Production + Preview + Development).

When Phase 4C (Playtomic) is implemented, add:

```
PLAYTOMIC_ENCRYPTION_KEY=<random-32-byte-hex>   # for encrypting client_secret in DB
CRON_SECRET=<random-string>                      # validates Vercel Cron calls to /api/playtomic/sync
```

### Auth settings

- **Email confirmation:** disabled (re-enable before public launch)
- **Auth provider:** Email + Password only
- **Site URL:** https://pctmt-azure.vercel.app
- **Redirect URLs:** https://pctmt-azure.vercel.app/**

### Running SQL migrations

```
1. Supabase dashboard → SQL Editor
2. Open the target migration file from supabase/migrations/
3. Copy contents and run
```

**Migration files and status:**

| File | Phase | Status |
|---|---|---|
| `20260611000001_initial_schema.sql` | Phases 1–3 | ✅ Applied 2026-06-15 |
| `20260615000002_phase4a_calendar_blocks.sql` | Phase 4A | ⏳ Pending |
| `20260615000003_phase4b_plans_sharing.sql` | Phase 4B | ⏳ Pending |
| `20260615000004_phase4c_playtomic.sql` | Phase 4C | ⏳ Pending |

Always apply migrations in order. Never skip a file.

---

## Vercel Cron (Phase 4C — Playtomic sync)

Configured in `vercel.json` at the project root:

```json
{
  "crons": [
    {
      "path": "/api/playtomic/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

The cron runs every hour on the hour. The route handler at `src/app/api/playtomic/sync/route.ts` validates the `Authorization: Bearer $CRON_SECRET` header before processing — this prevents unauthorized calls to the endpoint.

To test the sync manually during development:

```bash
curl -X POST http://localhost:3000/api/playtomic/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Project Structure

```
pctmt/
├── docs/
│   ├── runbook.md           # This file — operational reference
│   ├── architecture.md      # Stack, schema, patterns, decisions
│   └── product.md           # Vision, roadmap, pricing
├── public/
├── supabase/
│   └── migrations/
│       ├── 20260611000001_initial_schema.sql           # ✅ applied
│       ├── 20260615000002_phase4a_calendar_blocks.sql  # ⏳ pending
│       ├── 20260615000003_phase4b_plans_sharing.sql    # ⏳ pending
│       └── 20260615000004_phase4c_playtomic.sql        # ⏳ pending
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/           # ✅
│   │   │   └── register/        # ✅
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/       # Stats, chart, recent activity ✅
│   │   │   ├── players/         # CRUD + snapshots + attendance history ✅
│   │   │   ├── sessions/        # CRUD + attendance toggle ✅
│   │   │   ├── tournaments/     # CRUD + results per player ✅
│   │   │   ├── strategies/      # CRUD + zone filter + tags ✅
│   │   │   ├── calendar/        # Weekly view + series management ⏳ Phase 4A
│   │   │   ├── blocks/          # Training block library ⏳ Phase 4A
│   │   │   ├── plans/           # Training plans + phase timeline ⏳ Phase 4B
│   │   │   └── settings/        # Integrations (Playtomic connect) ⏳ Phase 4C
│   │   ├── share/
│   │   │   └── player/[token]/  # Public player profile (no auth) ⏳ Phase 4B
│   │   ├── api/
│   │   │   └── playtomic/
│   │   │       ├── sync/        # Vercel Cron handler ⏳ Phase 4C
│   │   │       └── connect/     # Save + validate credentials ⏳ Phase 4C
│   │   ├── actions/
│   │   │   ├── auth.ts          # login, register, logout ✅
│   │   │   ├── players.ts       # create, update, delete ✅
│   │   │   ├── snapshots.ts     # create, delete ✅
│   │   │   ├── sessions.ts      # create, update, attendance, delete ✅
│   │   │   ├── tournaments.ts   # create, update, results, delete ✅
│   │   │   ├── strategies.ts    # create, update, delete ✅
│   │   │   ├── series.ts        # create, update, delete, generate ⏳ Phase 4A
│   │   │   ├── blocks.ts        # create, update, delete ⏳ Phase 4A
│   │   │   ├── sessionBlocks.ts # add, reorder, remove ⏳ Phase 4A
│   │   │   ├── plans.ts         # create, update, delete, link ⏳ Phase 4B
│   │   │   └── sharing.ts       # enable, disable, regenerate token ⏳ Phase 4B
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── PlayerForm.tsx
│   │       ├── DeletePlayerButton.tsx
│   │       ├── SnapshotForm.tsx
│   │       ├── DeleteSnapshotButton.tsx
│   │       ├── SessionForm.tsx
│   │       ├── AttendanceToggle.tsx
│   │       ├── DeleteSessionButton.tsx
│   │       ├── TournamentForm.tsx
│   │       ├── ResultForm.tsx
│   │       ├── DeleteResultButton.tsx
│   │       ├── DeleteTournamentButton.tsx
│   │       ├── StrategyForm.tsx
│   │       ├── DeleteStrategyButton.tsx
│   │       ├── ProgressChart.tsx
│   │       ├── WeeklyCalendar.tsx    # ⏳ Phase 4A
│   │       ├── SeriesForm.tsx        # ⏳ Phase 4A
│   │       ├── BlockLibraryPanel.tsx # ⏳ Phase 4A
│   │       ├── SessionBlockList.tsx  # ⏳ Phase 4A
│   │       ├── PlanTimeline.tsx      # ⏳ Phase 4B
│   │       └── PlaytomicBadge.tsx    # ⏳ Phase 4C
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   └── middleware.ts
├── vercel.json              # Cron config (Phase 4C)
├── .env.local               # NOT in git
└── package.json
```

---

## Known Warnings

**`middleware.ts` deprecation warning** — Next.js 16 recommends renaming `middleware.ts` to `proxy.ts`. This is a warning only; the app builds and runs correctly. Will be resolved in a future chore commit.
