# React + Supabase Dashboard

A single-page React dashboard backed entirely by [Supabase](https://supabase.com) — **no self-hosted backend**. Authentication, the database, and row-level authorization all run on Supabase; the frontend talks to it directly with `@supabase/supabase-js`.

> This project was converted from the *Full Stack FastAPI Template*. The FastAPI backend, PostgreSQL container, Docker Compose, and Traefik configuration have been removed in favor of a pure Supabase architecture (Option B).

## Technology Stack and Features

- 🚀 [React](https://react.dev) + TypeScript, [Vite](https://vitejs.dev), and a modern frontend stack.
  - 🎨 [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) components.
  - 🧭 [TanStack Router](https://tanstack.com/router) + [TanStack Query](https://tanstack.com/query).
  - 🦇 Dark mode support.
- 🟢 [Supabase](https://supabase.com) as the entire backend:
  - 🔑 Email + password authentication and password recovery (`supabase.auth`).
  - 💾 Postgres `items` table queried directly from the client.
  - 🔒 Row Level Security so users can only read/write their own rows.
- ▲ Deployed as a static site on [Vercel](https://vercel.com).

## Architecture

| Concern            | Implementation                                                            |
| ------------------ | ------------------------------------------------------------------------- |
| Auth               | `supabase.auth` (sign up, sign in, password recovery/reset, sign out)     |
| Current user       | `supabase.auth.getUser()` — profile stored in the user's `user_metadata`  |
| Data (`items`)     | `supabase.from("items")` CRUD, guarded by Row Level Security              |
| Account deletion   | `delete_user()` Postgres RPC (`SECURITY DEFINER`, deletes the caller's row) |
| Client entry point | [`frontend/src/lib/supabase.ts`](frontend/src/lib/supabase.ts)            |

## Supabase Setup

If you are starting from a fresh Supabase project, apply the schema once. The full
script lives at [`supabase/schema.sql`](supabase/schema.sql) — paste it into the
Supabase Dashboard **SQL Editor** and run it (or `supabase db execute --file supabase/schema.sql`).
It creates the `items` table, its RLS policies, and the self-service account-deletion
function:

```sql
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 255),
  description text check (description is null or char_length(description) <= 255),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists items_owner_id_idx on public.items (owner_id);

alter table public.items enable row level security;

create policy "Users can view their own items"
  on public.items for select to authenticated using (auth.uid() = owner_id);
create policy "Users can insert their own items"
  on public.items for insert to authenticated with check (auth.uid() = owner_id);
create policy "Users can update their own items"
  on public.items for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users can delete their own items"
  on public.items for delete to authenticated using (auth.uid() = owner_id);

create or replace function public.delete_user()
returns void language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
```

### Auth configuration

- **Email auth** is enabled by default (Dashboard → **Authentication → Providers → Email**).
  For a friction-free local flow you may disable "Confirm email"; keep it enabled in production.
- **Password recovery** works out of the box. Set the **Site URL** and add your deployment
  origin plus `http://localhost:5173/reset-password` under
  **Authentication → URL Configuration → Redirect URLs**, so the recovery link returns users
  to the `/reset-password` page.

## Local Development

Requirements: Node.js 20+ and a Supabase project.

```bash
cd frontend
cp .env.example .env      # then fill in the two values below
npm install
npm run dev               # http://localhost:5173
```

### Environment variables

The frontend needs exactly two variables (find them in the Supabase Dashboard under
**Project Settings → API**):

| Variable                 | Description                          |
| ------------------------ | ------------------------------------ |
| `VITE_SUPABASE_URL`      | Project URL, e.g. `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Project **anon / public** API key    |

They live in `frontend/.env` for local development. A `frontend/.env.example`
(and a repo-root `.env.example`) document them.

### Useful scripts

```bash
npm run dev       # start the dev server
npm run build     # type-check (tsc) and build for production
npm run preview   # preview the production build locally
npm run lint      # Biome lint + format
```

## Deploy to Vercel

The app is a static Vite site — no server runtime required.

1. Push this repository to GitHub/GitLab/Bitbucket and **import it into Vercel**.
2. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (Build Command `npm run build`, Output Directory `dist` — Vercel infers these)
3. Add the environment variables (**Settings → Environment Variables**), for Production and Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy.** Vercel serves `dist/` as a static SPA.
5. Back in Supabase, add your Vercel domain (e.g. `https://your-app.vercel.app`) to
   **Authentication → URL Configuration** as the Site URL and a Redirect URL
   (`https://your-app.vercel.app/reset-password`).

> SPA routing note: TanStack Router handles client-side routes. If you ever host the
> `dist/` output somewhere other than Vercel, add a catch-all rewrite to `index.html`.

## License

This project is licensed under the terms of the [MIT license](LICENSE).
