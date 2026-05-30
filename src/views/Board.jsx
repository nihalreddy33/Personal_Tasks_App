import { useMemo, useState } from "react";
import {
  STATUSES,
  PRIORITIES,
  priorityRank,
  daysUntil,
  dueLabel,
  isOverdue,
  projectColor,
} from "../lib/tasks";

export default function Board({ tasks, projects, onEdit, onDelete, onSetStatus }) {
  const [filterProject, setFilterProject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => filterProject === "all" || t.project === filterProject)
      .filter((t) => filterPriority === "all" || t.priority === filterPriority)
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q)
      );
  }, [tasks, filterProject, filterPriority, search]);

  function onDrop(status) {
    if (dragId) onSetStatus(dragId, status);
    setDragId(null);
  }

  return (
    <>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="board">
        {STATUSES.map((col) => {
          const cards = filtered
            .filter((t) => t.status === col.id)
            .sort((a, b) => {
              const pr = priorityRank(a.priority) - priorityRank(b.priority);
              if (pr !== 0) return pr;
              const da = daysUntil(a.due);
              const db = daysUntil(b.due);
              if (da === null) return db === null ? 0 : 1;
              if (db === null) return -1;
              return da - db;
            });
          return (
            <section
              key={col.id}
              className={"column" + (dragId ? " droppable" : "")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
            >
              <div className="column-head">
                <span className={"col-dot " + col.id} />
                <h2>{col.label}</h2>
                <span className="count">{cards.length}</span>
              </div>
              <div className="cards">
                {cards.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projects={projects}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t.id)}
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
                {cards.length === 0 && <p className="empty">Nothing here</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function TaskCard({ task, projects, onEdit, onDelete, onDragStart, onDragEnd }) {
  const dl = dueLabel(task.due);
  const overdue = isOverdue(task);
  return (
    <article
      className="card"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onEdit}
    >
      <div className="card-top">
        <span className={"pill prio-" + task.priority}>{task.priority}</span>
        {task.project && (
          <span className="pill project">
            <span
              className="dot"
              style={{ background: projectColor(projects, task.project) }}
            />
            {task.project}
          </span>
        )}
      </div>
      <h3 className="card-title">{task.title}</h3>
      {task.notes && <p className="card-notes">{task.notes}</p>}
      <div className="card-bottom">
        {dl && <span className={"due" + (overdue ? " overdue" : "")}>{dl}</span>}
        <div className="card-actions">
          <button className="icon" title="Edit" onClick={onEdit}>
            ✎
          </button>
          <button className="icon" title="Delete" onClick={onDelete}>
            🗑
          </button>
        </div>
      </div>
    </article>
  );
}
