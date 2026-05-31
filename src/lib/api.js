// Client-side data layer: talks to the gated /api routes and stores the
// access key (the shared secret) in localStorage so it can be sent on each
// request. The key is validated server-side on every call.

const KEY = "task-dashboard.key";

export function getKey() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}
export function setKey(k) {
  try {
    localStorage.setItem(KEY, k);
  } catch {
    // ignore
  }
}
export function clearKey() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
export function hasKey() {
  return !!getKey();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function req(path, opts = {}) {
  let res;
  try {
    res = await fetch("/api" + path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        "x-app-secret": getKey(),
        ...(opts.headers || {}),
      },
    });
  } catch {
    throw new ApiError("Network error — is the server running?", 0);
  }
  if (res.status === 401) throw new ApiError("Unauthorized", 401);
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(msg, res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const listTasks = () => req("/tasks");
export const createTask = (data) =>
  req("/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id, patch) =>
  req(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
export const deleteTask = (id) => req(`/tasks/${id}`, { method: "DELETE" });

export const listProjects = () => req("/projects");
export const createProject = (name) =>
  req("/projects", { method: "POST", body: JSON.stringify({ name }) });
