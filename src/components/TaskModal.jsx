import { useState } from "react";
import { STATUSES, PRIORITIES } from "../lib/tasks";

export default function TaskModal({ task, projects, saving, onClose, onSave }) {
  const isNew = !task.id;
  const [form, setForm] = useState({
    title: task.title || "",
    notes: task.notes || "",
    status: task.status || "todo",
    priority: task.priority || "medium",
    project: task.project || projects[0] || "Personal",
    due: task.due || "",
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    // Build a clean payload. The server assigns id/createdAt and derives
    // completedAt from the status, so we only send the editable fields
    // (plus the id when editing an existing task).
    const payload = {
      ...form,
      title: form.title.trim(),
      project: form.project.trim(),
    };
    if (task.id) payload.id = task.id;
    onSave(payload);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{isNew ? "New task" : "Edit task"}</h2>
        <form onSubmit={submit}>
          <label>
            Title
            <input
              autoFocus
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="What needs doing?"
            />
          </label>
          <label>
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Optional details"
            />
          </label>
          <div className="row">
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              Project
              <input
                list="project-list"
                value={form.project}
                onChange={(e) => update("project", e.target.value)}
                placeholder="Type or pick"
              />
              <datalist id="project-list">
                {projects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={form.due}
                onChange={(e) => update("due", e.target.value)}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add task" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
