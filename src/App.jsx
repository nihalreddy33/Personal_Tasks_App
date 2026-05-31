"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deriveProjects, applyStatus } from "./lib/tasks";
import * as api from "./lib/api";
import Sidebar from "./components/Sidebar";
import Lock from "./components/Lock";
import TaskModal from "./components/TaskModal";
import Dashboard from "./views/Dashboard";
import Board from "./views/Board";
import Performance from "./views/Performance";
import "./App.css";

const THEME_KEY = "task-dashboard.theme";

const TITLES = {
  dashboard: { h: "Dashboard", sub: "Track and manage your tasks at a glance" },
  board: { h: "Task Board", sub: "Drag cards between columns to update status" },
  performance: { h: "Performance", sub: "Insights and trends from your task activity" },
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [theme, setTheme] = useState("light");

  // Theme is a client-only preference, kept in localStorage.
  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") setTheme(t);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Projects shown = defaults ∪ projects referenced by tasks ∪ stored projects.
  const projects = useMemo(() => {
    const set = new Set(deriveProjects(tasks));
    for (const p of dbProjects) set.add(p);
    return [...set];
  }, [tasks, dbProjects]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskData, projData] = await Promise.all([
        api.listTasks(),
        api.listProjects(),
      ]);
      setTasks(taskData);
      setDbProjects(projData.map((p) => p.name));
      setAuthed(true);
    } catch (e) {
      // 401 (bad/expired key) or any error → fall back to the lock screen.
      if (e.status === 401) api.clearKey();
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (api.hasKey()) load();
    else setLoading(false);
  }, [load]);

  // Called by the lock screen; throws on failure so Lock can show the error.
  async function handleUnlock(key) {
    api.setKey(key);
    try {
      const [taskData, projData] = await Promise.all([
        api.listTasks(),
        api.listProjects(),
      ]);
      setTasks(taskData);
      setDbProjects(projData.map((p) => p.name));
      setAuthed(true);
    } catch (e) {
      api.clearKey();
      throw e;
    }
  }

  function lockNow() {
    api.clearKey();
    setAuthed(false);
    setTasks([]);
    setDbProjects([]);
  }

  async function addProject(name) {
    const clean = name.trim();
    if (!clean || projects.includes(clean)) return;
    setDbProjects((ps) => [...ps, clean]); // optimistic
    try {
      await api.createProject(clean);
    } catch (e) {
      setDbProjects((ps) => ps.filter((p) => p !== clean)); // revert
      if (e.status === 401) lockNow();
      else alert("Couldn't add project: " + e.message);
    }
  }

  async function saveTask(payload) {
    setSaving(true);
    try {
      if (payload.id) {
        const updated = await api.updateTask(payload.id, payload);
        setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await api.createTask(payload);
        setTasks((ts) => [...ts, created]);
      }
      setEditing(null);
    } catch (e) {
      if (e.status === 401) lockNow();
      else alert("Couldn't save: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id) {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== id)); // optimistic
    try {
      await api.deleteTask(id);
    } catch (e) {
      setTasks(prev); // revert
      if (e.status === 401) lockNow();
    }
  }

  async function setStatus(id, status) {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === id ? applyStatus(t, status) : t)));
    try {
      const updated = await api.updateTask(id, { status });
      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setTasks(prev);
      if (e.status === 401) lockNow();
    }
  }

  function toggleTheme() {
    setTheme((th) => (th === "dark" ? "light" : "dark"));
  }

  if (loading) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-logo">✦</div>
          <h1>Loading…</h1>
          <p className="muted">Connecting to your tasks.</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Lock onUnlock={handleUnlock} />;
  }

  const t = TITLES[view];

  return (
    <div className="layout">
      <Sidebar
        view={view}
        onNavigate={setView}
        projects={projects}
        onAddProject={addProject}
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
            <button className="round-btn" onClick={lockNow} title="Lock (sign out)">
              🔒
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
              onDelete={removeTask}
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
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={saveTask}
        />
      )}
    </div>
  );
}
