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

Payments via Stripe. Subscription billed monthly, cancel anytime.

---

## Core Modules

| Module | Description | Phase |
|---|---|---|
| **Players** | Full profiles, physical snapshots, progress over time | 2 |
| **Sessions** | Plan classes, set objectives, log attendance | 2 |
| **Tournaments** | Register events, record results per player and pair | 2 |
| **Strategies** | Court diagrams, notes, tagged by zone and play type | 3 |
| **Dashboard** | Progress charts, attendance stats, tournament history | 3 |

---

## Roadmap

### Phase 1 — Foundations (Weeks 1–3)
Goal: working development environment, database designed, auth in place, app running locally.

- [x] GitHub repo and project scaffold
- [x] WSL dev environment (Fedora 42 + Node 20)
- [x] Next.js 16 + TypeScript + Tailwind
- [x] Supabase connected (database + auth)
- [x] Route protection middleware
- [x] Login page (static UI)
- [x] Database schema (10 tables, RLS)
- [x] SQL migration written
- [ ] SQL migration applied in Supabase
- [ ] Functional login + register (Supabase Auth)
- [ ] Basic post-login dashboard shell

### Phase 2 — Functional MVP (Weeks 4–10)
Goal: a real coach can sign up, add players, log sessions, and record tournament results.

- [ ] Register + onboarding flow
- [ ] Players module (create, view, edit, delete)
- [ ] Physical snapshots (log weight, height, scores)
- [ ] Sessions module (create, add players, mark attendance)
- [ ] Tournaments module (register, add results per player)
- [ ] Deploy on Vercel (public URL)
- [ ] 2–3 beta coaches testing the product

### Phase 3 — Full Product (Weeks 11–18)
Goal: complete feature set, monetization live.

- [ ] Strategies module (notes, court zones, tags)
- [ ] Dashboard with progress charts
- [ ] Stripe integration (free + pro plans)
- [ ] Email notifications (session reminders, tournament alerts)
- [ ] PWA manifest + offline support

### Phase 4 — Scale (Month 5–6+)
Goal: native app, multiple markets, academy accounts.

- [ ] React Native app (iOS + Android)
- [ ] Multi-language (Spanish + English)
- [ ] Academy support (one org, multiple coaches)
- [ ] App Store + Play Store publish

---

## Key Differentiators

**vs a notebook:** Progress is searchable, shareable, and chartable. A coach can show a player exactly how their endurance score improved over 6 months.

**vs a generic tool (Notion, spreadsheet):** Built specifically for padel. Session types, tournament categories, court zones, dominant hand — the data model speaks the coach's language.

**vs other coaching apps:** Focused on padel first. Simpler and cheaper than broad sports management platforms aimed at academies or clubs.
