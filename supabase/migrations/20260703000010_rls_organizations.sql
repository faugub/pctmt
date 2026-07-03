-- Track C: RLS audit — organizations table was missing RLS
--
-- Full audit of all tables across all migrations revealed a single gap:
-- `organizations` was created in 20260611000001_initial_schema.sql without
-- `enable row level security` or any policy, leaving it accessible to any
-- authenticated Supabase user.
--
-- Policy logic:
--   - The org owner (owner_id = auth.uid()) has full access.
--   - Any coach who belongs to the org (coaches.org_id = this org's id)
--     also has full access — forward-compatible with Phase 7 multi-coach orgs.
--
-- Note: `organizations` is not yet queried by the app (Phase 7 stub),
-- but the table is live in production so the gap needs closing now.

alter table organizations enable row level security;

create policy "coach: own or member organization" on organizations
  for all using (
    owner_id = auth.uid()
    or id in (
      select org_id from coaches
      where id = auth.uid()
        and org_id is not null
    )
  );
