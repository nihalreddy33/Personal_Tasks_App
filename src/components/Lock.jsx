"use client";

import { useState } from "react";

export default function Lock({ onUnlock }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!key.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onUnlock(key.trim());
    } catch (err) {
      if (err.status === 401) setError("Incorrect access key.");
      else if (err.status === 0) setError("Can't reach the server.");
      else setError(err.message || "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">✦</div>
        <h1>TaskFlow</h1>
        <p className="muted">Enter your access key to open the dashboard.</p>

        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            placeholder="Access key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          {error && <p className="lock-error">{error}</p>}
          <button className="btn primary lock-submit" type="submit" disabled={busy}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>

        <p className="lock-note">
          The access key is the shared secret set on the server (APP_SECRET). It's
          verified on every request, so only people who know it can read or change
          your tasks.
        </p>
      </div>
    </div>
  );
}
