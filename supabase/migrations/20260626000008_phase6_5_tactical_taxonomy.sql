-- pctmt Phase 6.5 — Track B: tactical taxonomy
-- Run this in Supabase SQL editor or via: npx supabase db push
--
-- Structured tactical tagging for strategies and training_blocks, layered
-- on top of (not replacing) the existing free-text `tags` column. Two new
-- dimensions, seeded from the glossary in docs/voz-del-entrenador.md:
--   - concept_tags:  tactical concept the play/drill works on
--                    (paralelo, diagonal, transición, ...)
--   - decision_tags: type of decision it trains
--                    (técnica, táctica, bajo presión)
--
-- Deliberately plain text[] columns, not enums — voz-del-entrenador.md is
-- explicit that this glossary should grow with real use ("cada vez que un
-- coach necesite un concepto que no está en la lista, esa es la señal de
-- que hay que agregarlo"). An enum would mean a migration every time a
-- coach needs a new concept; a free array lets the UI seed sensible
-- defaults while still accepting anything the coach types.

alter table strategies
  add column concept_tags text[] not null default '{}',
  add column decision_tags text[] not null default '{}';

alter table training_blocks
  add column concept_tags text[] not null default '{}',
  add column decision_tags text[] not null default '{}';
