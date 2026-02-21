-- Academic Calendar Builder – Supabase Schema
-- Run this entire script ONCE in your Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
--
-- Design: single-tenant.  The app stores exactly ONE calendar row
-- identified by the fixed key 'main'.  Every visitor to the URL
-- reads and writes the same row — no user accounts or localStorage needed.

create table if not exists public.calendars (
  session_key      text primary key,   -- always 'main' for this deployment
  institution_name text,
  subtitle         text,
  logo_url         text,
  start_year       integer,
  settings         jsonb,
  day_colors       jsonb,
  legend_items     jsonb,
  important_dates  jsonb,
  updated_at       timestamptz default now()
);

-- Keep updated_at current on every upsert
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists calendars_set_updated_at on public.calendars;
create trigger calendars_set_updated_at
  before update on public.calendars
  for each row execute procedure public.set_updated_at();

-- Allow anonymous reads and writes (no auth required).
-- The table holds only one row so there is nothing sensitive to protect.
alter table public.calendars enable row level security;

drop policy if exists "Anyone can upsert their own session" on public.calendars;
drop policy if exists "Public read/write for single calendar row" on public.calendars;
create policy "Public read/write for single calendar row"
  on public.calendars
  for all
  using (true)
  with check (true);
