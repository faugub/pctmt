-- pctmt Phase 4A — calendar + recurring series + training blocks
-- Run this in Supabase SQL editor or via: npx supabase db push
-- Apply AFTER 20260611000001_initial_schema.sql

-- ─────────────────────────────────────────
-- session_series (recurring schedule template)
-- ─────────────────────────────────────────
create table session_series (
  id               uuid primary key default gen_random_uuid(),
  coach_id         uuid not null references coaches(id) on delete cascade,
  title            text not null,
  session_type     text not null check (session_type in ('academy', 'individual', 'pairs')),
  category         text,                          -- e.g. 'masculino 3a', 'femenino 4a', 'mixto'
  level            text,                          -- e.g. 'iniciacion', '4a', '3a', '2a', '1a', 'nacional'
  recurrence_days  int[] not null,                -- 0=sunday .. 6=saturday, e.g. {2,4} = tue+thu
  start_time       time not null,
  duration_min     int not null default 60,
  starts_on        date not null,
  ends_on          date,                          -- null = open-ended
  player_ids       uuid[] not null default '{}',  -- default roster for generated sessions
  notes            text,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- extend sessions: link concrete instances back to their series
-- ─────────────────────────────────────────
alter table sessions
  add column series_id     uuid references session_series(id) on delete set null,
  add column series_index  int;

-- backfill-safe: existing sessions keep series_id/series_index null (one-off sessions)

-- ─────────────────────────────────────────
-- training_blocks (reusable exercise library per coach)
-- ─────────────────────────────────────────
create table training_blocks (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references coaches(id) on delete cascade,
  title         text not null,
  block_type    text not null check (block_type in ('warmup', 'technique', 'physical', 'tactical', 'match', 'cooldown')),
  description   text,
  duration_min  int,
  tags          text[],                           -- e.g. ARRAY['volea', 'red', 'reaccion']
  strategy_id   uuid references strategies(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- session_blocks (ordered blocks assigned to a session)
-- ─────────────────────────────────────────
create table session_blocks (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references sessions(id) on delete cascade,
  block_id           uuid references training_blocks(id) on delete set null,  -- null = inline/custom block
  strategy_id        uuid references strategies(id) on delete set null,
  sort_order         int not null default 0,
  custom_notes       text,
  duration_override  int                            -- overrides block's default duration_min for this instance
);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────
alter table session_series   enable row level security;
alter table training_blocks  enable row level security;
alter table session_blocks   enable row level security;

-- session_series: own series
create policy "coach: own series" on session_series
  for all using (coach_id = auth.uid());

-- training_blocks: own blocks
create policy "coach: own blocks" on training_blocks
  for all using (coach_id = auth.uid());

-- session_blocks: via session ownership
create policy "coach: own session_blocks" on session_blocks
  for all using (
    session_id in (select id from sessions where coach_id = auth.uid())
  );
