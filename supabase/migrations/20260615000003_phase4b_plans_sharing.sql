-- pctmt Phase 4B — training plans + shareable player profile
-- Run this in Supabase SQL editor or via: npx supabase db push
-- Apply AFTER 20260615000002_phase4a_calendar_blocks.sql

-- ─────────────────────────────────────────
-- training_plans (multi-session plan for a group or an individual player)
-- ─────────────────────────────────────────
create table training_plans (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid not null references coaches(id) on delete cascade,
  title             text not null,
  description       text,
  target_type       text not null check (target_type in ('group', 'individual')),
  target_id         uuid not null,                 -- session_series.id when 'group', players.id when 'individual'
  total_sessions    int not null,
  status            text not null default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  starts_on         date not null,
  goal_description  text,
  created_at        timestamptz not null default now()
);

-- target_id is intentionally not a foreign key — it is polymorphic (session_series OR players).
-- Integrity is enforced in the application layer (see architecture.md "Polymorphic target pattern").

-- ─────────────────────────────────────────
-- plan_phases (optional groupings within a plan)
-- ─────────────────────────────────────────
create table plan_phases (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references training_plans(id) on delete cascade,
  title          text not null,                    -- e.g. 'Fase física', 'Fase técnica'
  sort_order     int not null default 0,
  session_count  int not null default 0,
  objectives     text,
  notes          text,
  color          text                              -- hex or token for the plan timeline UI
);

-- ─────────────────────────────────────────
-- plan_sessions (planned session slots; bridges plan ↔ real sessions)
-- ─────────────────────────────────────────
create table plan_sessions (
  id               uuid primary key default gen_random_uuid(),
  plan_id          uuid not null references training_plans(id) on delete cascade,
  phase_id         uuid references plan_phases(id) on delete set null,
  session_number   int not null,                   -- 1..total_sessions
  session_id       uuid references sessions(id) on delete set null,  -- null until the real session occurs
  block_ids        uuid[] not null default '{}',    -- planned training_blocks for this slot
  notes            text,
  status           text not null default 'planned' check (status in ('planned', 'done', 'skipped'))
);

-- ─────────────────────────────────────────
-- extend players: shareable read-only profile link
-- ─────────────────────────────────────────
alter table players
  add column share_token    uuid not null default gen_random_uuid(),
  add column share_enabled  boolean not null default false;

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────
alter table training_plans  enable row level security;
alter table plan_phases     enable row level security;
alter table plan_sessions   enable row level security;

-- training_plans: own plans
create policy "coach: own plans" on training_plans
  for all using (coach_id = auth.uid());

-- plan_phases: via plan ownership
create policy "coach: own plan_phases" on plan_phases
  for all using (
    plan_id in (select id from training_plans where coach_id = auth.uid())
  );

-- plan_sessions: via plan ownership
create policy "coach: own plan_sessions" on plan_sessions
  for all using (
    plan_id in (select id from training_plans where coach_id = auth.uid())
  );

-- players: public read-only access for shared profiles (no auth.uid() check)
-- Restrict exposed columns in the application query, not here — RLS controls rows, not columns.
create policy "public: shared player profile" on players
  for select using (share_enabled = true);
