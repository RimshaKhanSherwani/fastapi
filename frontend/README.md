# Frontend — React + Supabase

The frontend is built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [TanStack Query](https://tanstack.com/query), [TanStack Router](https://tanstack.com/router), [Tailwind CSS](https://tailwindcss.com/), and [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript). There is **no separate backend** — the app talks to Supabase directly for auth and data.

See the [repository README](../README.md) for the full architecture, Supabase SQL setup, and Vercel deploy instructions.

## Requirements

- [Node.js](https://nodejs.org/) 20+ (or [Bun](https://bun.sh/))
- A [Supabase](https://supabase.com) project

## Quick Start

```bash
cp .env.example .env    # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev             # http://localhost:5173/
```

## Environment variables

| Variable                 | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL (Project Settings → API)      |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon / public API key (Project Settings → API) |

## Scripts

```bash
npm run dev       # start the dev server
npm run build     # type-check (tsc) then build for production into dist/
npm run preview   # preview the production build
npm run lint      # Biome lint + format
```

## Code Structure

- `frontend/src` — the main frontend code.
- `frontend/src/lib/supabase.ts` — the configured Supabase client (reads the env vars).
- `frontend/src/lib/database.types.ts` — Supabase-generated database types.
- `frontend/src/types.ts` — app-facing domain types (replaces the old generated API client).
- `frontend/src/hooks` — custom hooks, including `useAuth` (wraps `supabase.auth`).
- `frontend/src/components` — UI components (items CRUD, user settings, sidebar, shadcn/ui).
- `frontend/src/routes` — file-based routes/pages (login, signup, recover/reset password, dashboard, items, settings).

## End-to-End Testing with Playwright

```bash
npm run test        # bunx playwright test
npm run test:ui     # interactive UI mode
```

> Note: the Playwright tests were written against the previous FastAPI backend and its
> seeded users. They need updating for the Supabase auth flows before they will pass.

For more information, refer to the official [Playwright documentation](https://playwright.dev/docs/intro).
