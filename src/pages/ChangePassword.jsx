import { useState } from "react";
import api from "../services/api";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Choose a different password.");
      return;
    }
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("New password must be at most 72 UTF-8 bytes.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password changed successfully. Use the new password next time you sign in.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = { display: "block", width: "100%", marginTop: 8, padding: 12 };
  return <div style={{ color: "#eaf3ff", maxWidth: 640 }}>
    <h1>Change Password</h1>
    <p style={{ color: "#9eb0c7" }}>Update your own account password. Your current password is required.</p>
    {error && <p role="alert" style={{ color: "#ffb6b6" }}>{error}</p>}
    {notice && <p role="status" style={{ color: "#8de0bd" }}>{notice}</p>}
    <form onSubmit={submit} style={{ padding: 24, background: "#101b2b", border: "1px solid #293c55", borderRadius: 12, display: "grid", gap: 18 }}>
      <label>Current password<input type="password" required autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} /></label>
      <label>New password<input type="password" required minLength={12} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} /></label>
      <label>Confirm new password<input type="password" required minLength={12} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} /></label>
      <button type="submit" disabled={busy} style={{ background: "#167888", color: "white", border: 0, borderRadius: 8, padding: "12px 20px", opacity: busy ? 0.6 : 1 }}>{busy ? "Updating…" : "Update password"}</button>
    </form>
  </div>;
}
