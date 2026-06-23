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

**Commit types:** `feat` `fix` `docs` `chore` `refactor`

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

**Not yet set — needed when Phase 4C (Playtomic) sync logic is built:**

```
PLAYTOMIC_ENCRYPTION_KEY=<random-32-byte-hex>   # for encrypting client_secret in DB
CRON_SECRET=<random-string>                      # validates Vercel Cron calls to /api/playtomic/sync
```

**Also missing — used by `SharePanel.tsx` today as a hardcoded fallback:**

```
NEXT_PUBLIC_SITE_URL=https://pctmt-azure.vercel.app
```

`src/components/ui/SharePanel.tsx` currently hardcodes `https://pctmt-azure.vercel.app` directly in the component (see the `SITE_URL` constant with a `TODO` comment). Move this to an env var before the domain changes, or the shared links will silently point to the wrong place.

**No new env vars needed for Phase 6** (theme/language/branding) — theme and locale are `localStorage`/cookie only, and branding reads/writes through the existing Supabase client.

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
| `20260615000002_phase4a_calendar_blocks.sql` | Phase 4A | ✅ Applied 2026-06-20 |
| `20260615000003_phase4b_plans_sharing.sql` | Phase 4B | ✅ Applied 2026-06-20 |
| `20260615000004_phase4c_playtomic.sql` | Phase 4C | ✅ Applied 2026-06-20 (schema only — no sync code uses these tables yet) |
| `20260622000005_tactic_boards.sql` | Phase 5 | ✅ Applied |
| `20260623000006_session_blocks_completed.sql` | Phase 5 | ✅ Applied |
| `20260623000007_phase6_theming_branding.sql` | Phase 6 | ✅ Applied 2026-06-23 — adds `coaches.brand_name/brand_logo_url/brand_primary_color` + `get_share_branding()`. The first version had a `uuid = text` comparison bug in `get_share_branding`; fixed (cast `share_token::text`) before being re-run successfully |

Always apply migrations in order. Never skip a file. All seven files above are confirmed applied in production as of 2026-06-23.

---

## Vercel Cron (Phase 4C — Playtomic sync) — not yet built

This section describes the planned setup. None of it exists in the repo yet — `vercel.json`, the route handler, and the env vars above are all still to be created.

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

The cron would run every hour on the hour. The route handler at `src/app/api/playtomic/sync/route.ts` would validate an `Authorization: Bearer $CRON_SECRET` header before processing.

To test manually once built:

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
│   ├── product.md           # Vision, roadmap, pricing
│   └── qa-runbook.md        # End-to-end manual QA script
├── public/
├── supabase/
│   └── migrations/
│       ├── 20260611000001_initial_schema.sql            # ✅ applied
│       ├── 20260615000002_phase4a_calendar_blocks.sql   # ✅ applied
│       ├── 20260615000003_phase4b_plans_sharing.sql     # ✅ applied
│       ├── 20260615000004_phase4c_playtomic.sql         # ✅ applied (schema only)
│       ├── 20260622000005_tactic_boards.sql             # ✅ applied
│       ├── 20260623000006_session_blocks_completed.sql  # ✅ applied
│       └── 20260623000007_phase6_theming_branding.sql   # ✅ applied
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/           # ✅
│   │   │   └── register/        # ✅
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # ✅ Phase 6 — shared sidebar + topbar (theme/language/branding), wraps every route below
│   │   │   ├── dashboard/       # Stats, coach utilization chart, recent activity ✅
│   │   │   ├── players/         # CRUD + snapshots + attendance history + SharePanel ✅
│   │   │   ├── sessions/        # CRUD + attendance toggle + SessionBlocksPanel ✅
│   │   │   ├── tournaments/     # CRUD + results per player — UI copy says "Competencias" ✅
│   │   │   ├── strategies/      # CRUD + zone filter + tags + linked tactic_boards ✅
│   │   │   ├── calendar/        # Week + month views + series list ✅
│   │   │   ├── blocks/          # Training block library, CRUD + type filter ✅
│   │   │   ├── boards/          # Tactical whiteboard — list, new, editor ✅
│   │   │   ├── series/
│   │   │   │   ├── new/         # Create recurring series ✅
│   │   │   │   └── [id]/edit/   # Scoped edit (this/future/all) ✅
│   │   │   ├── plans/           # List, create, detail with phases + timeline ✅
│   │   │   └── settings/        # ✅ Phase 6 — branding (name/logo/color); theme + language live in the topbar instead
│   │   ├── share/
│   │   │   └── player/[token]/  # Public player profile, no auth — renders coach branding (Phase 6) ✅
│   │   ├── api/
│   │   │   └── playtomic/       # ⏳ not built (Phase 4C)
│   │   │       ├── sync/
│   │   │       └── connect/
│   │   ├── actions/
│   │   │   ├── auth.ts          # login, register, logout ✅
│   │   │   ├── players.ts       # create, update, delete ✅
│   │   │   ├── snapshots.ts     # create, delete ✅
│   │   │   ├── sessions.ts      # create, update, attendance ✅ — deleteSession is dead code, see architecture.md
│   │   │   ├── tournaments.ts   # create, update, results, delete ✅
│   │   │   ├── strategies.ts    # create, update, delete ✅
│   │   │   ├── blocks.ts        # create, update, delete ✅
│   │   │   ├── series.ts        # createSeries, generateSessionsForSeries, updateSeries, updateSingleSessionInSeries, deleteSeries(cascade), deleteSeriesOccurrence(scope) ✅
│   │   │   ├── plans.ts         # createPlan, updatePlan, deletePlan, addPhase, deletePhase, updatePlanSession, linkSessionToPlan, markPlanSessionSkipped ✅
│   │   │   ├── sharing.ts       # enablePlayerShare, disablePlayerShare, regenerateShareToken ✅
│   │   │   ├── boards.ts        # createBoard, saveBoardData, renameBoard, deleteBoard ✅
│   │   │   ├── sessionBlocks.ts # addBlockToSession, removeSessionBlock, toggleSessionBlockCompleted, reorderSessionBlock ✅
│   │   │   ├── preferences.ts   # ✅ Phase 6 — setLocale(locale) → cookie, no DB write
│   │   │   └── branding.ts      # ✅ Phase 6 — updateBranding(formData) → coaches.brand_*
│   │   ├── globals.css          # ✅ Phase 6 — semantic light/dark CSS variables (background/card/border/muted/primary)
│   │   ├── layout.tsx           # ✅ Phase 6 — no-flash theme init script, reads locale cookie for <html lang>
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/                            # ✅ Phase 6 — the (dashboard) chrome
│   │   │   ├── Sidebar.tsx                    # grouped nav, usePathname for active state
│   │   │   ├── TopBar.tsx                     # brand, language switcher, theme toggle, logout
│   │   │   └── MobileNav.tsx                  # hamburger + drawer for small screens
│   │   └── ui/
│   │       ├── PlayerForm.tsx
│   │       ├── DeletePlayerButton.tsx
│   │       ├── SnapshotForm.tsx
│   │       ├── DeleteSnapshotButton.tsx
│   │       ├── SessionForm.tsx
│   │       ├── AttendanceToggle.tsx
│   │       ├── DeleteSessionButton.tsx        # ✅ — scoped (this/future/all) when session is in a series
│   │       ├── TournamentForm.tsx
│   │       ├── ResultForm.tsx
│   │       ├── DeleteResultButton.tsx
│   │       ├── DeleteTournamentButton.tsx
│   │       ├── StrategyForm.tsx
│   │       ├── DeleteStrategyButton.tsx
│   │       ├── ProgressChart.tsx
│   │       ├── CoachHoursChart.tsx            # ✅ — Recharts bar chart, dashboard
│   │       ├── BlockForm.tsx
│   │       ├── DeleteBlockButton.tsx
│   │       ├── SeriesForm.tsx                 # extraActions for scoped edits
│   │       ├── DeleteSeriesButton.tsx         # ✅ — two scopes: template-only vs cascade
│   │       ├── PlanForm.tsx                   # group/individual target toggle
│   │       ├── AddPhaseForm.tsx               # collapsible inline form
│   │       ├── DeletePlanButton.tsx
│   │       ├── SharePanel.tsx                 # toggle, copy link, regenerate token
│   │       ├── TacticBoardEditor.tsx          # ✅ — SVG drag/drop court, pointer-capture pattern
│   │       ├── DeleteBoardButton.tsx          # ✅
│   │       ├── SessionBlocksPanel.tsx         # ✅ — tap-to-add checklist, optimistic state
│   │       ├── ThemeToggle.tsx                # ✅ Phase 6 — localStorage + classList, no context/provider
│   │       └── LanguageSwitcher.tsx           # ✅ Phase 6 — setLocale Server Action + router.refresh()
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts          # public routes: /login, /register, /share
│   │   └── i18n/                               # ✅ Phase 6
│   │       ├── dictionaries.ts                # es/en dictionaries + Dictionary interface
│   │       └── getLocale.ts                   # reads pctmt-lang cookie, server-only
│   └── middleware.ts
├── vercel.json              # ⏳ not yet created (needed for Phase 4C cron)
├── .env.local               # NOT in git
└── package.json
```

---

## Known Warnings

**`middleware.ts` deprecation warning** — Next.js 16 recommends renaming `middleware.ts` to `proxy.ts`. This is a warning only; the app builds and runs correctly. Will be resolved in a future chore commit.

## Known Gaps (tracked, not yet fixed)

- **No UI to link a real session to a plan slot.** `linkSessionToPlan()` exists as a Server Action but nothing calls it — a coach can't yet mark "session #3 of this plan = this real session" from the UI.
- **`SharePanel.tsx` hardcodes the production URL** instead of reading an env var (see Vercel environment variables section above).
- **Playtomic tables have no sync logic.** Schema is applied; everything else in Phase 4C is unbuilt.
- **`players` has no `email` column**, which Phase 4C's player-matching-by-email design assumes. Will need a small migration when that phase starts.
- **`deleteSession()` in `actions/sessions.ts` is unused dead code** — superseded by `deleteSeriesOccurrence()` in `actions/series.ts` (Phase 5), which handles both one-off and series sessions through a single scoped function. Safe to delete in a future cleanup pass, just not removed yet to keep the Phase 5 diff focused.
- **`/tournaments` routes and `Tournament*`-named files are internal-only inconsistencies**, not bugs: the UI says "Competencias" everywhere, but the URL, the database table, and component/action names still say "tournament." See `architecture.md` Phase 5 design decisions for why this wasn't renamed.
- **Language switcher only covers navigation, chrome, and `/settings`.** Every other page's UI text is still hardcoded Spanish — the dictionary infra (`src/lib/i18n/`) is in place to extend coverage incrementally, see `product.md` Phase 7.
- **Form components in `components/ui/` still use literal `gray-*`/`white`/colored-pill Tailwind classes**, not the semantic tokens introduced in Phase 6. They render fine inside the new `bg-card` page containers (light cards on either a light or dark page background), but haven't been retrofitted to fully theme-match in dark mode the way the page-level chrome now does.
- **No logo upload** — `/settings` branding only accepts a logo *URL* (e.g. an image already hosted elsewhere), not a file upload. Acceptable for now since most coaches already have a logo hosted somewhere (Instagram, a personal site); revisit if that assumption proves wrong.

**Closed in Phase 5 (previously listed here):**
- ~~No UI to attach training blocks to a session~~ — closed by `SessionBlocksPanel`.
- ~~Deleting a series leaves orphaned sessions behind~~ — closed by `deleteSeries(id, cascade)`.
- ~~No way to delete "this and future" occurrences of a recurring session~~ — closed by `deleteSeriesOccurrence(sessionId, scope)`.

**Closed in Phase 6 (previously listed here):**
- ~~No dark mode, no way for a coach to brand the product, every page repeats its own header~~ — closed by the shared `(dashboard)/layout.tsx`, `ThemeToggle`, `LanguageSwitcher`, and `/settings` branding form.
