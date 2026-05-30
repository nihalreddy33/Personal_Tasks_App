# Task Dashboard

A personal task tracker — kanban board with due dates, priorities, projects, and progress stats. Everything is stored locally in your browser (localStorage); no account or backend.

## Run it

```bash
./start.sh
```

Then open http://localhost:5173. (The script uses the Node runtime installed under `../.tools/`, so it works even though Node isn't on your global PATH.)

To build a static production bundle instead:

```bash
export PATH="/Users/nihalreddygurrala/Workspace/.tools/node-v22.14.0-darwin-arm64/bin:$PATH"
npm run build      # outputs to dist/
npm run preview    # serves the built bundle
```

## Features

The app has three views, reachable from the left sidebar:

- **Dashboard** — headline stat cards (with week-over-week trend badges), a weekly created-vs-completed activity chart, per-project workload, an overall completion ring, and upcoming due dates.
- **Task Board** — the kanban: To Do / In Progress / Done. Drag a card between columns to change its status; search and filter by project or priority.
- **Performance** — deeper analytics: task performance over the last 10 weeks, status and priority donut breakdowns, project workload, and a GitHub-style activity heatmap of completions.

Across all views:

- **Due dates & priority** — High / Medium / Low priority and an optional due date. Cards sort by priority, then by soonest due. Overdue items are highlighted.
- **Projects** — group tasks by project; type a new project name in the task form and it's remembered, with a stable colored dot.
- **Light & dark theme** — toggle with the ☾/☀ button in the top bar; your choice is saved.
- **Passcode lock** — the 🔓 button in the top bar lets you set a passcode; once set, the app prompts for it on each new session and the 🔒 button locks it on demand.

### Tips

- Click **+ Add Task** to create a task; double-click a card or the ✎ icon to edit it.
- All charts are derived from your real task data (no mock numbers). Completing a task stamps it so it shows up in the weekly trends and activity heatmap.
- Data lives in your browser under the `task-dashboard.v1` key — clearing site data resets it.

### About the passcode lock

The passcode is a **local deterrent, not encryption**. Because the app is fully client-side, your task data stays readable to anyone with browser DevTools access regardless of the lock. The passcode itself is never stored — only a salted SHA-256 hash is kept — so the code can't be read back, but the data is not encrypted. If you need real protection (encrypted-at-rest data, or true accounts with multi-device sync), that requires the encrypted-vault or backend-auth approach instead.

## Project layout

- `src/App.jsx` — app shell: sidebar, top bar, view routing, theme, lock gate, and task state.
- `src/views/` — `Dashboard.jsx`, `Board.jsx`, `Performance.jsx`.
- `src/components/` — `Sidebar.jsx`, `TaskModal.jsx`, `Lock.jsx`, and `charts.jsx` (dependency-free SVG charts).
- `src/lib/tasks.js` — data model, constants, date helpers, persistence, and analytics.
- `src/lib/auth.js` — passcode hashing and lock/unlock session state.
- `src/App.css` / `src/index.css` — styling and light/dark theme variables.
