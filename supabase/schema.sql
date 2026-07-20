-- ============================================================================
-- Supabase schema for the React + Supabase dashboard.
--
-- Run this ONCE against your Supabase project (ludvhokcrqhdpgkvmwct):
--   Dashboard -> SQL Editor -> New query -> paste -> Run
-- or with the CLI:  supabase db execute --file supabase/schema.sql
--
-- It creates the `items` table, its Row Level Security policies, and a
-- self-service account-deletion function. Safe to re-run (idempotent).
-- ============================================================================

-- Items table: mirrors the former SQLModel Item (id, title, description,
-- owner_id) plus created_at. owner_id defaults to the caller's auth.uid().
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 255),
  description text check (description is null or char_length(description) <= 255),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists items_owner_id_idx on public.items (owner_id);

-- Row Level Security: users may only CRUD their own items.
alter table public.items enable row level security;

drop policy if exists "Users can view their own items" on public.items;
create policy "Users can view their own items"
  on public.items for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own items" on public.items;
create policy "Users can insert their own items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own items" on public.items;
create policy "Users can update their own items"
  on public.items for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own items" on public.items;
create policy "Users can delete their own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = owner_id);

-- Lets a signed-in user delete their own auth account from the browser
-- (equivalent of the old DELETE /users/me endpoint), since the client has
-- no service_role key.
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
