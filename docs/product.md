# pctmt — Product

Vision, target customer, roadmap, and pricing.

---

## What is pctmt?

**pctmt** is a SaaS platform built for padel coaches who want to digitize their work. It replaces notebooks and spreadsheets with a purpose-built tool for managing players, planning training sessions, tracking tournament results, and building a strategy library.

The core value proposition: a coach can show a player their progress over months — physical metrics, tournament history, session attendance — in a way that a notebook never could.

---

## Target Customer

**Primary:** Individual padel coaches operating independently or attached to an academy.

The coach is the buyer — not the academy. A coach signs up, pays, and owns their data. They can work solo or, in a later phase, join an academy account.

**Profile:**
- Manages 10–40 active players
- Runs group and individual sessions
- Participates in local and regional tournaments
- Currently tracks everything in WhatsApp, notes apps, or paper

---

## Business Model

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | Up to 5 players, basic session log |
| **Pro** | ~$15–20/month | Unlimited players, all modules, progress charts |

> Pricing to be validated with beta users before locking in.

Payments via Stripe. Subscription billed monthly, cancel anytime. Stripe integration deferred post-MVP.

---

## Core Modules

| Module | Description | Status |
|---|---|---|
| **Players** | Full profiles, physical snapshots, progress chart, session history | ✅ Live |
| **Sessions** | Plan classes, set objectives, log attendance | ✅ Live |
| **Tournaments** | Register events, record results per player and pair | ✅ Live |
| **Strategies** | Play library with court zones and tags | ✅ Live |
| **Dashboard** | Stats, progress chart, recent sessions, upcoming tournaments | ✅ Live |
| **Stripe** | Free + pro plans, subscription billing | ⏳ Deferred |
| **PWA** | Offline support, installable on mobile | ⏳ Deferred |

---

## Roadmap

### Phase 1 — Foundations ✅ COMPLETE (2026-06-15)

- [x] GitHub repo and project scaffold
- [x] WSL dev environment (Fedora 42 + Node 20)
- [x] Next.js 16 + TypeScript + Tailwind
- [x] Supabase connected (database + auth)
- [x] Route protection middleware
- [x] Database schema (10 tables, RLS)
- [x] SQL migration applied in Supabase
- [x] Functional login + register (Supabase Auth)
- [x] Basic post-login dashboard shell

### Phase 2 — Functional MVP ✅ COMPLETE (2026-06-15)

- [x] Players module — create, view, edit, delete
- [x] Physical snapshots — log weight, height, scores per date
- [x] Sessions module — create, edit, delete, add players, mark attendance
- [x] Tournaments module — create, edit, delete, add results per player
- [x] Deploy on Vercel — https://pctmt-azure.vercel.app

### Phase 3 — Full Product ✅ COMPLETE (2026-06-15)

- [x] Strategies module — CRUD, court zone filter, tags
- [x] Dashboard with real stats, progress chart, recent activity
- [x] Progress chart on individual player profile
- [x] Session attendance history on player profile
- [x] Edit session and tournament (closes CRUD gap)
- [ ] Stripe integration — deferred
- [ ] Email notifications — deferred
- [ ] PWA manifest + offline support — deferred

### Phase 4 — Scale

- [ ] React Native app (iOS + Android)
- [ ] Multi-language (Spanish + English)
- [ ] Academy support (one org, multiple coaches)
- [ ] App Store + Play Store publish

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. A coach can show a player exactly how their endurance score improved over 6 months.

**vs a generic tool (Notion, spreadsheet):** Built specifically for padel. Session types, tournament categories, court zones, dominant hand — the data model speaks the coach’s language.

**vs other coaching apps:** Focused on padel first. Simpler and cheaper than broad sports management platforms aimed at academies or clubs.
