# Task Dashboard

A personal task tracker — kanban board with due dates, priorities, projects, and progress stats. Built with **Next.js** and backed by **Prisma Postgres**, with the API gated behind a shared-secret access key.

```
Browser (React)  →  /api/tasks (Next.js, shared-secret gate)  →  Prisma  →  Prisma Postgres
```

## Quick start (local)

1. **Set up environment variables.** Copy the template and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — your Prisma Postgres connection string (Vercel → your project → **Storage** → the Prisma Postgres store → `.env` tab). It looks like `prisma+postgres://accelerate.prisma-data.net/?api_key=...`.
   - `APP_SECRET` — a long random string you choose. This is the **access key** you'll type into the app's lock screen. Generate one with `openssl rand -hex 24`.

2. **Create the database table** (one time, and after any schema change):

   ```bash
   npm run db:push      # = prisma db push
   ```

3. **Run it:**

   ```bash
   ./start.sh           # or: npm run dev
   ```

   Open http://localhost:5173 (or http://localhost:3000 with `npm run dev`) and enter your `APP_SECRET` on the lock screen.

> The `start.sh` script uses the Node runtime under `../.tools/`, so it works even though Node isn't on your global PATH.

## Deploy to Vercel

1. Push to GitHub (already connected) — Vercel builds on push. The build runs `prisma generate && next build` automatically.
2. In your Vercel project → **Settings → Environment Variables**, make sure both are set:
   - `DATABASE_URL` — usually added automatically when you attach the Prisma Postgres store; confirm it's there.
   - `APP_SECRET` — add the same secret you use locally (or a fresh one for production).
3. Run `npm run db:push` once against the production `DATABASE_URL` (or use a Prisma migration) so the table exists.
4. Redeploy. Visit the site, enter the `APP_SECRET`, and your tasks now persist in Postgres.

## Features

The app has three views, reachable from the left sidebar:

- **Dashboard** — headline stat cards (with week-over-week trend badges), a weekly created-vs-completed activity chart, per-project workload, an overall completion ring, and upcoming due dates.
- **Task Board** — the kanban: To Do / In Progress / Done. Drag a card between columns to change its status; search and filter by project or priority.
- **Performance** — deeper analytics: task performance over the last 10 weeks, status and priority donut breakdowns, project workload, and a GitHub-style activity heatmap of completions.

Across all views:

- **Due dates & priority** — High / Medium / Low priority and an optional due date. Cards sort by priority, then by soonest due. Overdue items are highlighted.
- **Projects** — group tasks by project; type a new project name in the task form and it's remembered, with a stable colored dot.
- **Light & dark theme** — toggle with the ☾/☀ button in the top bar; your choice is saved (in the browser).
- **Access-key lock** — the app prompts for the access key (`APP_SECRET`) on the lock screen; the 🔒 button locks it on demand. Tasks are stored in Postgres and synced across any device that knows the key.

### Tips

- Click **+ Add Task** to create a task; double-click a card or the ✎ icon to edit it.
- All charts are derived from your real task data (no mock numbers). Completing a task stamps it so it shows up in the weekly trends and activity heatmap.
- Tasks live in your Prisma Postgres database. Only the theme preference and the entered access key are kept in the browser.

### Security model

The API (`/api/tasks`) checks the `x-app-secret` header against `APP_SECRET` on **every** request — no key or wrong key returns `401`. The secret lives only in server-side environment variables and is never shipped to the browser bundle. This is single-user, shared-secret protection: anyone who knows the key has full read/write access. For separate per-user accounts, you'd add real auth (e.g. Auth.js or Clerk) on top.

## Project layout

- `src/app/` — Next.js App Router: `layout.jsx`, `page.jsx`, and the `api/tasks` route handlers.
- `src/App.jsx` — client app shell: sidebar, top bar, view routing, theme, lock gate, and data orchestration.
- `src/views/` — `Dashboard.jsx`, `Board.jsx`, `Performance.jsx`.
- `src/components/` — `Sidebar.jsx`, `TaskModal.jsx`, `Lock.jsx` (access-key screen), and `charts.jsx`.
- `src/lib/tasks.js` — constants, date helpers, and analytics (pure, no persistence).
- `src/lib/api.js` — client fetch helpers + access-key storage.
- `src/lib/prisma.js` — Prisma client singleton (Accelerate extension).
- `src/lib/server.js` — server-side auth check, field sanitization, and serialization.
- `prisma/schema.prisma` — the `Task` model.
- `src/App.css` / `src/index.css` — styling and light/dark theme variables.
