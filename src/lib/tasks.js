// Domain model, constants, and analytics for the task dashboard.
// Persistence now lives in the database (see lib/api.js + the /api routes).

export const STATUSES = [
  { id: "todo", label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export const PRIORITIES = [
  { id: "high", label: "High", rank: 0, color: "#ef4444" },
  { id: "medium", label: "Medium", rank: 1, color: "#f59e0b" },
  { id: "low", label: "Low", rank: 2, color: "#22c55e" },
];

export const STATUS_COLORS = {
  todo: "#94a3b8",
  inprogress: "#6366f1",
  done: "#22c55e",
};

// Palette assigned to projects in order of creation, so each gets a stable dot.
export const PROJECT_COLORS = [
  "#8b5cf6",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#14b8a6",
];

export const DEFAULT_PROJECTS = ["Personal", "Work", "Errands"];

export function priorityRank(id) {
  const p = PRIORITIES.find((x) => x.id === id);
  return p ? p.rank : 99;
}

export function projectColor(projects, name) {
  const i = projects.indexOf(name);
  return PROJECT_COLORS[(i < 0 ? 0 : i) % PROJECT_COLORS.length];
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Apply a status change, maintaining the completedAt timestamp.
export function applyStatus(task, status) {
  if (status === "done") {
    return { ...task, status, completedAt: task.completedAt || Date.now() };
  }
  return { ...task, status, completedAt: null };
}

// Derive the project list from the tasks, unioned with the defaults so the
// board always offers somewhere to file a task even when the DB is empty.
export function deriveProjects(tasks) {
  const set = new Set(DEFAULT_PROJECTS);
  for (const t of tasks) {
    if (t.project) set.add(t.project);
  }
  return [...set];
}

/* ---------------- date helpers ---------------- */

export function isoDay(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysUntil(due) {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  return Math.round((d - today) / 86400000);
}

export function dueLabel(due) {
  const n = daysUntil(due);
  if (n === null) return null;
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  return `Due in ${n}d`;
}

export function isOverdue(task) {
  if (task.status === "done") return false;
  const n = daysUntil(task.due);
  return n !== null && n < 0;
}

/* ---------------- analytics ---------------- */

export function statusCounts(tasks) {
  return {
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
}

export function priorityCounts(tasks) {
  return PRIORITIES.map((p) => ({
    ...p,
    value: tasks.filter((t) => t.priority === p.id).length,
  }));
}

export function projectCounts(tasks, projects) {
  return projects
    .map((name) => ({
      name,
      value: tasks.filter((t) => t.project === name).length,
      done: tasks.filter((t) => t.project === name && t.status === "done")
        .length,
      color: projectColor(projects, name),
    }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
}

// Count items whose timestamp (from `field`) falls in [start, end).
function countInRange(tasks, field, start, end) {
  return tasks.filter((t) => t[field] && t[field] >= start && t[field] < end)
    .length;
}

// Returns { total, done, inprogress, overdue, completionPct, createdDelta, doneDelta }.
export function headlineStats(tasks) {
  const now = Date.now();
  const week = 7 * 86400000;
  const total = tasks.length;
  const sc = statusCounts(tasks);
  const overdue = tasks.filter(isOverdue).length;
  const completionPct = total ? Math.round((sc.done / total) * 100) : 0;

  const createdThis = countInRange(tasks, "createdAt", now - week, now + 1);
  const createdPrev = countInRange(tasks, "createdAt", now - 2 * week, now - week);
  const doneThis = countInRange(tasks, "completedAt", now - week, now + 1);
  const donePrev = countInRange(tasks, "completedAt", now - 2 * week, now - week);

  return {
    total,
    done: sc.done,
    inprogress: sc.inprogress,
    todo: sc.todo,
    overdue,
    completionPct,
    createdThisWeek: createdThis,
    doneThisWeek: doneThis,
    createdDelta: pctDelta(createdThis, createdPrev),
    doneDelta: pctDelta(doneThis, donePrev),
  };
}

function pctDelta(cur, prev) {
  if (!prev) return cur ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

// Weekly created vs completed for the last `weeks` weeks (oldest first).
export function weeklySeries(tasks, weeks = 8) {
  const week = 7 * 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align to start of current week (Sunday).
  const startOfThisWeek = today.getTime() - today.getDay() * 86400000;
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = startOfThisWeek - i * week;
    const end = start + week;
    out.push({
      label: new Date(start).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      created: countInRange(tasks, "createdAt", start, end),
      completed: countInRange(tasks, "completedAt", start, end),
    });
  }
  return out;
}

// GitHub-style activity grid of completions over the last `weeks` weeks.
export function activityHeatmap(tasks, weeks = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - (today.getDay() + (weeks - 1) * 7) * 86400000;
  const counts = {};
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const key = isoDay(t.completedAt);
    counts[key] = (counts[key] || 0) + 1;
  }
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const ts = start + (w * 7 + d) * 86400000;
      const date = new Date(ts);
      const future = ts > today.getTime();
      col.push({
        key: isoDay(ts),
        count: counts[isoDay(ts)] || 0,
        future,
        month: date.getMonth(),
      });
    }
    cols.push(col);
  }
  const max = Math.max(1, ...Object.values(counts));
  return { cols, max };
}
