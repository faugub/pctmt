-- pctmt Phase 5 — session block completion tracking
-- Run this in Supabase SQL editor or via: npx supabase db push
-- Apply AFTER 20260622000005_tactic_boards.sql
--
-- session_blocks already existed (Phase 4A) but nothing in the app ever
-- attached blocks to a session — the library had no consumer. This adds
-- the one missing piece needed for a live-session checklist: marking a
-- block done as the coach works through it on a tablet.

alter table session_blocks
  add column completed boolean not null default false;
