import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveToken } from "../auth/auth";

export default function Register() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("ORGANIZATION");
  const [username, setUsername] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const { data } = await api.post("/public-signup", {
        accountType, username: username.trim(), organizationName: organizationName.trim(),
        email: email.trim(), password
      });
      if (!data?.token || !data?.workspace?.id) throw new Error("Incomplete signup response");
      localStorage.setItem("siem.workspaceId", data.workspace.id);
      saveToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
    } finally { setLoading(false); }
  }

  const field = { width: "100%", boxSizing: "border-box", padding: "13px 14px", background: "#142138", border: "1px solid #38516a", borderRadius: 9, color: "#f2f7ff", fontSize: 14 };
  const label = { display: "block", fontSize: 13, fontWeight: 650, marginBottom: 7, color: "#c7d6e8" };
  const group = { marginBottom: 18 };
  return <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 10% 15%,#193451,#080d19 65%)", color: "#edf5ff", fontFamily: "Inter,system-ui,sans-serif", display: "grid", placeItems: "center", padding: 24 }}>
    <section style={{ width: "100%", maxWidth: 490, background: "#0d1729", border: "1px solid #29425c", borderRadius: 18, padding: "32px", boxSizing: "border-box" }}>
      <div style={{ color: "#6edce3", letterSpacing: 2, fontSize: 12, fontWeight: 800 }}>◇ ENTERPRISE SIEM</div>
      <h1 style={{ fontSize: 31, marginBottom: 8 }}>Create your workspace</h1>
      <p style={{ color: "#9bb1ca", lineHeight: 1.6, fontSize: 14 }}>Set up a secure SOC workspace for yourself or your organisation.</p>
      <form onSubmit={submit}>
        <div style={group}><label style={label} htmlFor="account-type">Account type</label>
          <select id="account-type" style={field} value={accountType} onChange={e => setAccountType(e.target.value)}>
            <option value="ORGANIZATION">Company / Organisation</option>
            <option value="PERSONAL">Individual</option>
          </select></div>
        {accountType === "ORGANIZATION" && <div style={group}><label style={label} htmlFor="org">Organisation name</label>
          <input id="org" style={field} value={organizationName} onChange={e => setOrganizationName(e.target.value)} minLength={2} maxLength={120} required /></div>}
        <div style={group}><label style={label} htmlFor="name">Your name</label>
          <input id="name" style={field} value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={100} autoComplete="name" required /></div>
        <div style={group}><label style={label} htmlFor="email">Work email</label>
          <input id="email" type="email" style={field} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div style={group}><label style={label} htmlFor="password">Password (at least 12 characters)</label>
          <input id="password" type="password" style={field} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={12} required /></div>
        <div style={group}><label style={label} htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" style={field} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" minLength={12} required /></div>
        {error && <p role="alert" style={{ color: "#ffb8be", background: "#42202b", padding: 12, borderRadius: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...field, background: "#55c9d3", color: "#071522", border: 0, fontWeight: 800, cursor: loading ? "wait" : "pointer" }}>{loading ? "Creating workspace…" : "Create account →"}</button>
      </form>
      <p style={{ textAlign: "center", color: "#9bb1ca", fontSize: 13, marginTop: 22 }}>Already have an account? <Link to="/login" style={{ color: "#72dfe7" }}>Sign in</Link></p>
    </section>
  </main>;
}
