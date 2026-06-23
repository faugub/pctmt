-- Phase 6: theming, language, and per-coach branding

alter table coaches
  add column if not exists brand_name text,
  add column if not exists brand_logo_url text,
  add column if not exists brand_primary_color text not null default '#16a34a';

comment on column coaches.brand_name is 'Display name shown instead of "pctmt" on dashboard header and shared player profiles';
comment on column coaches.brand_logo_url is 'Optional logo URL shown instead of the pctmt wordmark';
comment on column coaches.brand_primary_color is 'Hex color used as the accent/primary color across the coach''s dashboard and shared pages';

-- Public, narrow lookup for the share pages: only branding fields, only for
-- coaches who have at least one share-enabled player matching the given
-- token. Avoids exposing the full coaches row (email, plan, etc.) to
-- anonymous visitors, since RLS is row-level and can't restrict columns.
-- share_token is uuid on players, so it's cast to text here to compare
-- against the text param coming from the route's [token] segment.
create or replace function get_share_branding(p_token text)
returns table (
  brand_name text,
  brand_logo_url text,
  brand_primary_color text
)
language sql
security definer
set search_path = public
as $$
  select c.brand_name, c.brand_logo_url, c.brand_primary_color
  from coaches c
  join players p on p.coach_id = c.id
  where p.share_token::text = p_token
    and p.share_enabled = true
  limit 1;
$$;

grant execute on function get_share_branding(text) to anon, authenticated;
