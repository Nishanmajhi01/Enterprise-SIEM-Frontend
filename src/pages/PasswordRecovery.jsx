import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const shell = { minHeight: "100vh", background: "#080d19", color: "#edf5ff", fontFamily: "Inter,system-ui,sans-serif", display: "grid", placeItems: "center", padding: 24 };
const panel = { width: "100%", maxWidth: 440, boxSizing: "border-box", background: "#0d1729", border: "1px solid #29425c", borderRadius: 18, padding: 32 };
const field = { width: "100%", boxSizing: "border-box", padding: 13, margin: "12px 0", background: "#142138", border: "1px solid #38516a", borderRadius: 9, color: "#fff" };
const button = { ...field, background: "#55c9d3", color: "#071522", border: 0, fontWeight: 800, cursor: "pointer" };

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMessage("");
    try {
      const { data } = await api.post("/email-account/forgot-password", { email });
      setMessage(data.message || "If the account is eligible, an email will be sent.");
    } catch (error) {
      setMessage(error.response?.status === 429 ? "Too many requests. Please try again later." : "Unable to process request. Please try again.");
    } finally { setBusy(false); }
  }
  return <main style={shell}><section style={panel}>
    <h1>Reset your password</h1>
    <p>Enter your account email. If eligible, you'll receive a link valid for 30 minutes.</p>
    <form onSubmit={submit}><label htmlFor="reset-email">Email address</label>
      <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} style={field} />
      <button type="submit" disabled={busy} style={button}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>
    {message && <p role="status">{message}</p>}
    <Link to="/login" style={{ color: "#71dce5" }}>Back to sign in</Link>
  </section></main>;
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    setBusy(true); setMessage("");
    try {
      const { data } = await api.post("/email-account/reset-password", { token, password });
      setComplete(true);
      setMessage(data.message || "Password updated. Please sign in.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to reset password.");
    } finally { setBusy(false); }
  }
  return <main style={shell}><section style={panel}>
    <h1>Choose a new password</h1>
    {!token ? <p role="alert">This reset link is missing its token.</p> :
      !complete && <form onSubmit={submit}>
        <label htmlFor="new-password">New password (minimum 12 characters)</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} style={field} />
        <label htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)} style={field} />
        <button type="submit" disabled={busy} style={button}>{busy ? "Updating…" : "Update password"}</button>
      </form>}
    {message && <p role="status">{message}</p>}
    <Link to="/login" style={{ color: "#71dce5" }}>Back to sign in</Link>
  </section></main>;
}
