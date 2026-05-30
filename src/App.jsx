import { useEffect, useState } from "react";
import { loadState, saveState, applyStatus } from "./lib/tasks";
import { hasPasscode, isUnlocked, setUnlocked } from "./lib/auth";
import Sidebar from "./components/Sidebar";
import Lock from "./components/Lock";
import TaskModal from "./components/TaskModal";
import Dashboard from "./views/Dashboard";
import Board from "./views/Board";
import Performance from "./views/Performance";
import "./App.css";

const TITLES = {
  dashboard: { h: "Dashboard", sub: "Track and manage your tasks at a glance" },
  board: { h: "Task Board", sub: "Drag cards between columns to update status" },
  performance: { h: "Performance", sub: "Insights and trends from your task activity" },
};

export default function App() {
  const [state, setState] = useState(loadState);
  const { tasks, projects, theme } = state;

  const [view, setView] = useState("dashboard");
  const [editing, setEditing] = useState(null);

  // Passcode gate: locked when a passcode exists and this session isn't unlocked.
  const [unlocked, setUnlockedState] = useState(() =>
    hasPasscode() ? isUnlocked() : true
  );
  const [authMode, setAuthMode] = useState(null); // null | 'create'

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function upsertTask(task) {
    setState((s) => {
      const exists = s.tasks.some((t) => t.id === task.id);
      const tasks = exists
        ? s.tasks.map((t) => (t.id === task.id ? task : t))
        : [...s.tasks, task];
      const projects =
        task.project && !s.projects.includes(task.project)
          ? [...s.projects, task.project]
          : s.projects;
      return { ...s, tasks, projects };
    });
  }

  function deleteTask(id) {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }

  function setStatus(id, status) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? applyStatus(t, status) : t)),
    }));
  }

  function toggleTheme() {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }

  function handleLockButton() {
    if (hasPasscode()) {
      // Lock immediately.
      setUnlocked(false);
      setUnlockedState(false);
    } else {
      // Prompt to set one up.
      setAuthMode("create");
    }
  }

  // Gate the whole app behind the lock screen when required.
  if (hasPasscode() && !unlocked) {
    return (
      <Lock
        mode="unlock"
        onUnlock={() => {
          setUnlocked(true);
          setUnlockedState(true);
        }}
      />
    );
  }
  if (authMode === "create") {
    return (
      <Lock
        mode="create"
        onUnlock={() => {
          setUnlockedState(true);
          setAuthMode(null);
        }}
        onCancel={() => setAuthMode(null)}
      />
    );
  }

  const t = TITLES[view];

  return (
    <div className="layout">
      <Sidebar
        view={view}
        onNavigate={setView}
        projects={projects}
        onAddTask={() => setEditing({})}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-brand">
            <span className="sb-logo">✦</span>
            <span className="sb-name">TaskFlow</span>
          </div>
          <div className="topbar-search">
            <span className="search-ico">⌕</span>
            <input placeholder="Search anything…" disabled />
          </div>
          <div className="topbar-actions">
            <button
              className="round-btn"
              onClick={handleLockButton}
              title={hasPasscode() ? "Lock now" : "Set a passcode"}
            >
              {hasPasscode() ? "🔒" : "🔓"}
            </button>
            <button className="round-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <button className="btn primary" onClick={() => setEditing({})}>
              + Add Task
            </button>
          </div>
        </header>

        <div className="page">
          <div className="page-head">
            <div>
              <h1>{t.h}</h1>
              <p className="muted">{t.sub}</p>
            </div>
          </div>

          {view === "dashboard" && (
            <Dashboard
              tasks={tasks}
              projects={projects}
              onEdit={setEditing}
              onGoPerformance={() => setView("performance")}
            />
          )}
          {view === "board" && (
            <Board
              tasks={tasks}
              projects={projects}
              onEdit={setEditing}
              onDelete={deleteTask}
              onSetStatus={setStatus}
            />
          )}
          {view === "performance" && (
            <Performance tasks={tasks} projects={projects} />
          )}
        </div>
      </main>

      {editing && (
        <TaskModal
          task={editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSave={(task) => {
            upsertTask(task);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
