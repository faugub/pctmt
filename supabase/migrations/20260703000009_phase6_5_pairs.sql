-- pctmt Phase 6.5 — pairs (sociedades)
-- The pair is the fundamental unit of analysis in pádel.
-- Source: docs/voz-del-entrenador.md (Crosetti / Pratto section).
-- Apply AFTER 20260626000008_phase6_5_tactical_taxonomy.sql

create table pairs (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references coaches(id) on delete cascade,
  player1_id  uuid not null references players(id) on delete cascade,
  player2_id  uuid not null references players(id) on delete cascade,
  name        text,    -- optional nickname, e.g. "Los Cracks"
  notes       text,    -- coach notes: complementarity, tactical patterns, evolution
  created_at  timestamptz not null default now(),
  constraint pairs_no_self_pair check (player1_id != player2_id)
);

-- Pair is stored directionally (player1, player2) but queried with OR
-- (player1_id = X OR player2_id = X) to retrieve both directions.
-- Preventing symmetric duplicates (A+B = B+A) is left to coach discipline
-- for now — adding a btree index on least()/greatest() UUIDs can be a
-- follow-up if the data shows coaches creating duplicate societies.

alter table pairs enable row level security;

create policy "coach: own pairs" on pairs
  for all using (coach_id = auth.uid());
