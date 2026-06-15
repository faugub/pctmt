-- pctmt initial schema
-- Run this in Supabase SQL editor or via: npx supabase db push

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- organizations (optional — phase 4)
-- ─────────────────────────────────────────
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid,                        -- set after coaches table exists
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- coaches (the paying customer)
-- ─────────────────────────────────────────
create table coaches (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  full_name       text not null,
  avatar_url      text,
  plan            text not null default 'free',   -- free | pro
  org_id          uuid references organizations(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Add FK from organizations to coaches now that coaches exists
alter table organizations
  add constraint fk_org_owner
  foreign key (owner_id) references coaches(id) on delete set null;

-- ─────────────────────────────────────────
-- players
-- ─────────────────────────────────────────
create table players (
  id              uuid primary key default gen_random_uuid(),
  coach_id        uuid not null references coaches(id) on delete cascade,
  full_name       text not null,
  birth_date      date,
  dominant_hand   text check (dominant_hand in ('right', 'left', 'ambidextrous')),
  level           text,                          -- e.g. 'iniciacion', '4a', '3a', '2a', '1a', 'nacional'
  weight_kg       numeric(5,2),
  height_cm       numeric(5,2),
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- player_snapshots (physical + performance over time)
-- ─────────────────────────────────────────
create table player_snapshots (
  id               uuid primary key default gen_random_uuid(),
  player_id        uuid not null references players(id) on delete cascade,
  recorded_at      date not null default current_date,
  weight_kg        numeric(5,2),
  height_cm        numeric(5,2),
  endurance_score  int check (endurance_score between 1 and 10),
  speed_score      int check (speed_score between 1 and 10),
  strength_score   int check (strength_score between 1 and 10),
  technique_score  int check (technique_score between 1 and 10),
  notes            text
);

-- ─────────────────────────────────────────
-- sessions (training classes)
-- ─────────────────────────────────────────
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references coaches(id) on delete cascade,
  title         text not null,
  session_date  date not null,
  duration_min  int,
  session_type  text check (session_type in ('technical', 'physical', 'tactical', 'match', 'mixed')),
  objectives    text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- session_players (many-to-many + attendance)
-- ─────────────────────────────────────────
create table session_players (
  session_id  uuid not null references sessions(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  attended    boolean not null default true,
  notes       text,
  primary key (session_id, player_id)
);

-- ─────────────────────────────────────────
-- tournaments
-- ─────────────────────────────────────────
create table tournaments (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references coaches(id) on delete cascade,
  name        text not null,
  start_date  date not null,
  end_date    date,
  location    text,
  category    text,                        -- e.g. 'masculino 3a', 'femenino 4a', 'mixto'
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- tournament_results (per player per tournament)
-- ─────────────────────────────────────────
create table tournament_results (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references tournaments(id) on delete cascade,
  player_id       uuid not null references players(id) on delete cascade,
  partner_name    text,                    -- the pair partner (may not be in the system)
  final_round     text,                    -- e.g. 'winner', 'final', 'semifinal', 'quarterfinal', 'groups'
  sets_won        int default 0,
  sets_lost       int default 0,
  notes           text
);

-- ─────────────────────────────────────────
-- strategies
-- ─────────────────────────────────────────
create table strategies (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references coaches(id) on delete cascade,
  title       text not null,
  court_zone  text,                        -- e.g. 'red', 'midcourt', 'back', 'full'
  description text,
  tags        text[],                      -- e.g. ARRAY['smash', 'bandeja', 'volley']
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- Coaches can only see their own data
-- ─────────────────────────────────────────
alter table coaches           enable row level security;
alter table players           enable row level security;
alter table player_snapshots  enable row level security;
alter table sessions          enable row level security;
alter table session_players   enable row level security;
alter table tournaments       enable row level security;
alter table tournament_results enable row level security;
alter table strategies        enable row level security;

-- coaches: own row only
create policy "coach: own row" on coaches
  for all using (auth.uid() = id);

-- players: coach sees their own players
create policy "coach: own players" on players
  for all using (
    coach_id = (select id from coaches where id = auth.uid())
  );

-- player_snapshots: via player ownership
create policy "coach: own snapshots" on player_snapshots
  for all using (
    player_id in (select id from players where coach_id = auth.uid())
  );

-- sessions: own sessions
create policy "coach: own sessions" on sessions
  for all using (coach_id = auth.uid());

-- session_players: via session ownership
create policy "coach: own session_players" on session_players
  for all using (
    session_id in (select id from sessions where coach_id = auth.uid())
  );

-- tournaments: own tournaments
create policy "coach: own tournaments" on tournaments
  for all using (coach_id = auth.uid());

-- tournament_results: via tournament ownership
create policy "coach: own results" on tournament_results
  for all using (
    tournament_id in (select id from tournaments where coach_id = auth.uid())
  );

-- strategies: own strategies
create policy "coach: own strategies" on strategies
  for all using (coach_id = auth.uid());

-- coaches: allow insert on registration
create policy "coach: insert own row" on coaches
  for insert with check (auth.uid() = id);
