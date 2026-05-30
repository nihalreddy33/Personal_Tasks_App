// Client-side passcode gate.
//
// IMPORTANT: this is a *deterrent*, not real security. The app is fully
// client-side, so the task data in localStorage stays readable to anyone with
// DevTools access regardless of this lock. We never store the passcode itself —
// only a salted SHA-256 hash — so the code can't be read back from storage, but
// that's the limit of what a no-backend gate can offer. For real protection use
// the encrypted-vault or backend-auth approach instead.

const AUTH_KEY = "task-dashboard.auth";
const SESSION_KEY = "task-dashboard.unlocked";

export function hasPasscode() {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

function toHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSalt() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return toHex(a);
}

async function hashCode(code, salt) {
  const data = new TextEncoder().encode(`${salt}:${code}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(buf));
}

export async function setPasscode(code) {
  const salt = randomSalt();
  const hash = await hashCode(code, salt);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ salt, hash, v: 1 }));
  setUnlocked(true);
}

export async function verifyPasscode(code) {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { salt, hash } = JSON.parse(raw);
    const calc = await hashCode(code, salt);
    return calc === hash;
  } catch {
    return false;
  }
}

export function clearPasscode() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
  setUnlocked(false);
}

// Unlocked state lives in sessionStorage: it survives reloads within the same
// tab/session but clears when the tab is closed, so a fresh visit re-prompts.
export function isUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
