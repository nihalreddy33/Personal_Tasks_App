// Server-only helpers for the API routes: shared-secret auth + serialization.

// Timing-safe-ish comparison of the request's secret against APP_SECRET.
export function authorized(request) {
  const secret = process.env.APP_SECRET;
  if (!secret) return false; // refuse all access if the server isn't configured
  const provided = request.headers.get("x-app-secret") || "";
  if (provided.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) {
    diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// Convert a Prisma Task row into the shape the client expects.
// Dates are emitted as epoch-millisecond numbers (matching the original
// localStorage model and the analytics helpers).
export function serialize(task) {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes ?? "",
    status: task.status,
    priority: task.priority,
    project: task.project,
    due: task.due ?? "",
    createdAt: task.createdAt ? task.createdAt.getTime() : Date.now(),
    completedAt: task.completedAt ? task.completedAt.getTime() : null,
  };
}

const STATUSES = ["todo", "inprogress", "done"];
const PRIORITIES = ["high", "medium", "low"];

// Whitelist + coerce incoming fields so the client can't write arbitrary data.
export function sanitize(body, { partial = false } = {}) {
  const out = {};
  if (body.title !== undefined) out.title = String(body.title).slice(0, 500);
  if (body.notes !== undefined) out.notes = String(body.notes).slice(0, 5000);
  if (body.status !== undefined && STATUSES.includes(body.status))
    out.status = body.status;
  if (body.priority !== undefined && PRIORITIES.includes(body.priority))
    out.priority = body.priority;
  if (body.project !== undefined) out.project = String(body.project).slice(0, 120);
  if (body.due !== undefined) out.due = String(body.due).slice(0, 20);

  // Maintain completedAt based on status transitions.
  if (out.status === "done") out.completedAt = new Date();
  else if (out.status !== undefined) out.completedAt = null;

  if (!partial && out.title === undefined) {
    throw new Error("title is required");
  }
  return out;
}
