import { useState } from "react";
import { setPasscode, verifyPasscode, clearPasscode } from "../lib/auth";

export default function Lock({ mode, onUnlock, onCancel }) {
  const creating = mode === "create";
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (creating) {
      if (code.length < 4) {
        setError("Use at least 4 characters.");
        return;
      }
      if (code !== confirm) {
        setError("Passcodes don't match.");
        return;
      }
      setBusy(true);
      await setPasscode(code);
      setBusy(false);
      onUnlock();
    } else {
      setBusy(true);
      const ok = await verifyPasscode(code);
      setBusy(false);
      if (ok) {
        onUnlock();
      } else {
        setError("Incorrect passcode.");
        setCode("");
      }
    }
  }

  function reset() {
    // Local deterrent only — clearing the passcode keeps your tasks intact.
    clearPasscode();
    onUnlock();
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">✦</div>
        <h1>{creating ? "Set a passcode" : "Welcome back"}</h1>
        <p className="muted">
          {creating
            ? "You'll need this to open your dashboard."
            : "Enter your passcode to unlock the dashboard."}
        </p>

        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            placeholder="Passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {creating && (
            <input
              type="password"
              placeholder="Confirm passcode"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}
          {error && <p className="lock-error">{error}</p>}
          <button className="btn primary lock-submit" type="submit" disabled={busy}>
            {creating ? "Set passcode & continue" : "Unlock"}
          </button>
        </form>

        {creating && onCancel && (
          <button className="lock-link" onClick={onCancel}>
            Not now
          </button>
        )}
        {!creating && (
          <button className="lock-link" onClick={reset}>
            Forgot passcode? Reset (keeps your tasks)
          </button>
        )}

        <p className="lock-note">
          This is a local lock to deter casual access — it doesn't encrypt your
          data.
        </p>
      </div>
    </div>
  );
}
