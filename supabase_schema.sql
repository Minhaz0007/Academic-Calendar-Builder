-- Academic Calendar Builder – Supabase Schema
-- Run this entire script once in your Supabase SQL Editor.
-- Dashboard → SQL Editor → New query → paste → Run

create table if not exists public.calendars (
  session_key      text primary key,
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

-- Allow anonymous (unauthenticated) reads and writes so the app works
-- without requiring user accounts.  Each browser is identified by its
-- own session_key UUID stored in localStorage, so users can only ever
-- read/write their own row.
alter table public.calendars enable row level security;

drop policy if exists "Anyone can upsert their own session" on public.calendars;
create policy "Anyone can upsert their own session"
  on public.calendars
  for all
  using (true)
  with check (true);
