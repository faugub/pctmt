-- pctmt Phase 5 — tactical whiteboard
-- Run this in Supabase SQL editor or via: npx supabase db push
-- Apply AFTER 20260615000004_phase4c_playtomic.sql

-- ─────────────────────────────────────────
-- tactic_boards (drag/drop court diagrams: tokens + lines)
-- ─────────────────────────────────────────
create table tactic_boards (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references coaches(id) on delete cascade,
  strategy_id   uuid references strategies(id) on delete set null,
  title         text not null,
  -- board_data shape: { tokens: [{id,x,y,team,label}], lines: [{id,x1,y1,x2,y2,dashed}] }
  -- x/y and x1/y1/x2/y2 are percentages (0-100) of court width/height, so the
  -- board renders correctly at any screen size without re-scaling stored data.
  board_data    jsonb not null default '{"tokens": [], "lines": []}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index tactic_boards_coach_id_idx on tactic_boards(coach_id);
create index tactic_boards_strategy_id_idx on tactic_boards(strategy_id);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────
alter table tactic_boards enable row level security;

create policy "coach: own tactic_boards" on tactic_boards
  for all using (coach_id = auth.uid());
