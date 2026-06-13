# pctmt — Runbook

Operational procedures, environment setup, and credentials reference.

---

## Development Environment

| Component | Detail |
|---|---|
| OS | Fedora 42 (WSL2 on Windows) |
| Node.js | v20.20.2 (via fnm) |
| Package manager | npm |
| Test browser | Chrome on Windows → localhost:3000 |

### Start the dev server

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
| Direct push to main | Yes (phase 1 only) |

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
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

If `.env.local` is lost, recreate it with values from the Supabase dashboard under Settings → API Keys.

### Running SQL migrations

```
1. Supabase dashboard → SQL Editor
2. Open supabase/migrations/20260611000001_initial_schema.sql
3. Copy contents and run
```

> Pending: set up Supabase CLI for terminal-based migrations.

---

## Project Structure

```
pctmt/
├── docs/
│   ├── runbook.md          # This file — operational reference
│   ├── architecture.md     # Database schema, tech stack, design decisions
│   └── product.md          # Product vision, roadmap, pricing
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/      # Login page ✅
│   │   │   └── register/   # Register page (pending)
│   │   ├── (dashboard)/
│   │   │   ├── players/    # Players module (pending)
│   │   │   ├── sessions/   # Sessions module (pending)
│   │   │   ├── tournaments/ # Tournaments module (pending)
│   │   │   └── strategies/ # Strategies module (pending)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/             # Shared UI components (pending)
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts   # Browser client ✅
│   │       ├── server.ts   # Server client ✅
│   │       └── middleware.ts # Session refresh ✅
│   └── middleware.ts       # Route protection ✅
├── supabase/
│   └── migrations/
│       └── 20260611000001_initial_schema.sql ✅
├── .env.example
├── .env.local              # NOT in git
└── README.md
```
