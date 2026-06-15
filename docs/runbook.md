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

### Auth settings

- **Email confirmation:** disabled (re-enable before public launch)
- **Auth provider:** Email + Password only
- **Site URL:** https://pctmt-azure.vercel.app
- **Redirect URLs:** https://pctmt-azure.vercel.app/**

### Running SQL migrations

```
1. Supabase dashboard → SQL Editor
2. Open supabase/migrations/20260611000001_initial_schema.sql
3. Copy contents and run
```

Migration status: ✅ applied 2026-06-15

---

## Project Structure

```
pctmt/
├── docs/
│   ├── runbook.md           # This file — operational reference
│   ├── architecture.md      # Stack, schema, patterns, decisions
│   └── product.md           # Vision, roadmap, pricing
├── public/
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
│   │   │   └── strategies/      # CRUD + zone filter + tags ✅
│   │   ├── actions/
│   │   │   ├── auth.ts          # login, register, logout ✅
│   │   │   ├── players.ts       # create, update, delete ✅
│   │   │   ├── snapshots.ts     # create, delete ✅
│   │   │   ├── sessions.ts      # create, update, attendance, delete ✅
│   │   │   ├── tournaments.ts   # create, update, results, delete ✅
│   │   │   └── strategies.ts    # create, update, delete ✅
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
│   │       └── ProgressChart.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       └── 20260611000001_initial_schema.sql ✅
├── .env.local              # NOT in git
└── package.json
```

---

## Known Warnings

**`middleware.ts` deprecation warning** — Next.js 16 recommends renaming `middleware.ts` to `proxy.ts`. This is a warning only; the app builds and runs correctly. Will be resolved in a future chore commit.
