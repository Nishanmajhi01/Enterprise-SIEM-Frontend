import { useEffect, useState } from "react";
import api from "../services/api";

const empty = { username: "", email: "", password: "", role: "VIEWER" };

export default function Users() {
  const [members, setMembers] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/auth/workspace-members");
      setMembers(Array.isArray(data.members) ? data.members : []);
      setAuthorized(true);
      setError("");
    } catch (err) {
      setAuthorized(false);
      setMembers([]);
      setError(err.response?.data?.message || "Unable to load members. Confirm the backend is updated and you have workspace ADMIN access.");
    }
  }
  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault();
    if (busy || !authorized) return;
    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      await api.post("/auth/workspace-members", form);
      setForm(empty);
      setConfirmPassword("");
      setNotice("Account created and assigned to this workspace.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Account creation failed.");
    } finally { setBusy(false); }
  }

  return <div style={{color:"#eaf3ff",maxWidth:1050}}>
    <h1>Workspace Users</h1>
    <p style={{color:"#9eb0c7",marginBottom:24}}>Manage accounts in your currently selected workspace. Only workspace administrators can access this API.</p>
    {error && <p role="alert" style={{color:"#ffb6b6"}}>{error}</p>}
    {notice && <p role="status" style={{color:"#8de0bd"}}>{notice}</p>}
    {authorized && <section style={{padding:22,background:"#101b2b",border:"1px solid #293c55",borderRadius:12,marginBottom:25}}>
      <h2 style={{fontSize:18,marginBottom:18}}>Create workspace account</h2>
      <form onSubmit={create} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        <label>Username<input required minLength={3} maxLength={100} autoComplete="off" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={{display:"block",width:"100%",marginTop:7,padding:10}} /></label>
        <label>Email<input required type="email" maxLength={254} autoComplete="off" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{display:"block",width:"100%",marginTop:7,padding:10}} /></label>
        <label>Temporary password<input required type="password" minLength={12} maxLength={72} autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{display:"block",width:"100%",marginTop:7,padding:10}} /></label>
        <label>Confirm temporary password<input required type="password" minLength={12} maxLength={72} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{display:"block",width:"100%",marginTop:7,padding:10}} /></label>
        <label>Workspace role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{display:"block",width:"100%",marginTop:7,padding:10}}>
          <option value="VIEWER">Viewer</option><option value="ANALYST">Analyst</option><option value="ADMIN">Administrator</option>
        </select></label>
        <div style={{gridColumn:"1/-1"}}><button disabled={busy} type="submit" style={{background:"#167888",color:"white",border:0,borderRadius:8,padding:"12px 20px",opacity:busy?.6:1}}>{busy?"Creating…":"Create account"}</button></div>
      </form>
      <p style={{fontSize:12,color:"#8da4bc",marginTop:15}}>New email addresses only. Existing accounts cannot be added through this form. Share credentials securely and require a password change before production use.</p>
    </section>}
    {authorized && <section style={{padding:22,background:"#101b2b",border:"1px solid #293c55",borderRadius:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}><h2 style={{fontSize:18}}>Workspace members ({members.length})</h2><button onClick={load} style={{background:"#17263a",color:"white",border:"1px solid #344760",borderRadius:8,padding:"9px 14px"}}>Refresh</button></div>
      <div style={{overflowX:"auto"}}><table><thead><tr><th>Username</th><th>Email</th><th>Workspace role</th><th>Status</th></tr></thead><tbody>
        {members.map(m=><tr key={m.membershipId}><td>{m.user?.username}</td><td>{m.user?.email}</td><td>{m.role}</td><td>{m.status}</td></tr>)}
      </tbody></table></div>
    </section>}
  </div>;
}
