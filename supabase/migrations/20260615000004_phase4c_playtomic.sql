-- pctmt Phase 4C — Playtomic integration (read-only booking sync)
-- Run this in Supabase SQL editor or via: npx supabase db push
-- Apply AFTER 20260615000003_phase4b_plans_sharing.sql
--
-- IMPORTANT — client_secret encryption:
-- client_secret is encrypted at the application layer (AES via PLAYTOMIC_ENCRYPTION_KEY,
-- see runbook.md) BEFORE it reaches this table. Postgres stores ciphertext as text.
-- Never write a plaintext client_secret from a Server Action or Route Handler.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- playtomic_connections (one per coach — OAuth credentials for their club)
-- ─────────────────────────────────────────
create table playtomic_connections (
  id                 uuid primary key default gen_random_uuid(),
  coach_id           uuid not null unique references coaches(id) on delete cascade,
  client_id          text not null,
  client_secret      text not null,                -- encrypted ciphertext, see note above
  access_token       text,                          -- short-lived (~1h), refreshed by the sync job
  token_expires_at   timestamptz,
  club_id            text,
  club_name          text,
  last_sync_at       timestamptz,
  sync_status        text not null default 'pending' check (sync_status in ('pending', 'ok', 'error')),
  sync_error         text,                          -- last error message, for troubleshooting in Settings UI
  created_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- playtomic_bookings (raw bookings imported from the Playtomic API)
-- ─────────────────────────────────────────
create table playtomic_bookings (
  id                     uuid primary key default gen_random_uuid(),
  coach_id               uuid not null references coaches(id) on delete cascade,
  playtomic_booking_id   text not null,             -- Playtomic's own booking ID, used for upsert dedup
  court_name             text,
  start_at               timestamptz not null,
  end_at                 timestamptz not null,
  player_names           text[] not null default '{}',
  player_emails          text[] not null default '{}',
  session_id             uuid references sessions(id) on delete set null,  -- filled when coach converts to a session
  raw_payload            jsonb not null,             -- full API response, protects against upstream schema changes
  synced_at              timestamptz not null default now(),

  unique (coach_id, playtomic_booking_id)
);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────
alter table playtomic_connections  enable row level security;
alter table playtomic_bookings     enable row level security;

-- playtomic_connections: own connection only
create policy "coach: own playtomic connection" on playtomic_connections
  for all using (coach_id = auth.uid());

-- playtomic_bookings: own bookings only
create policy "coach: own playtomic bookings" on playtomic_bookings
  for all using (coach_id = auth.uid());

-- Note: the hourly sync job (src/app/api/playtomic/sync/route.ts) runs with the
-- Supabase service role key, which bypasses RLS by design — it writes on behalf
-- of every connected coach in a single cron invocation. The service role key
-- must never be exposed to the client; it lives only in Vercel's server environment.
