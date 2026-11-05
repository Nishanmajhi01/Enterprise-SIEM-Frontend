import { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [members, setMembers] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ANALYST");
  const [busy, setBusy] = useState(false);
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
      setError(err.response?.data?.message || "Unable to load workspace members.");
    }
  }
  useEffect(() => { load(); }, []);

  async function invite(event) {
    event.preventDefault();
    if (busy || !authorized) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data } = await api.post("/workspace-invitations", { email: email.trim(), role });
      setNotice(data.message || "Invitation requested.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send invitation. A verified email domain may be required.");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {display:"block",width:"100%",boxSizing:"border-box",marginTop:8,padding:12,borderRadius:8,background:"#17263a",border:"1px solid #425775",color:"#fff"};
  return <div style={{color:"#eaf3ff",maxWidth:1050}}>
    <h1>Workspace Users</h1>
    <p style={{color:"#9eb0c7",marginBottom:24}}>Invite team members into your selected workspace. Only workspace administrators can send invitations.</p>
    {error && <p role="alert" style={{color:"#ffb6b6"}}>{error}</p>}
    {notice && <p role="status" style={{color:"#8de0bd"}}>{notice}</p>}
    {authorized && <section style={{padding:22,background:"#101b2b",border:"1px solid #293c55",borderRadius:12,marginBottom:25}}>
      <h2 style={{fontSize:18,marginBottom:18}}>Invite a team member</h2>
      <form onSubmit={invite} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        <label>Email address<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} /></label>
        <label>Workspace role<select value={role} onChange={e=>setRole(e.target.value)} style={inputStyle}>
          <option value="ANALYST">Analyst</option><option value="VIEWER">Viewer</option><option value="ADMIN">Administrator</option>
        </select></label>
        <div style={{gridColumn:"1/-1"}}><button disabled={busy} type="submit" style={{background:"#167888",color:"white",border:0,borderRadius:8,padding:"12px 20px",opacity:busy?.6:1}}>{busy?"Sending…":"Send invitation"}</button></div>
      </form>
      <p style={{fontSize:12,color:"#8da4bc",marginTop:15}}>Invitation links expire after 48 hours and can be used once. New members choose their own password. Until a sending domain is verified in Resend, invitations to other addresses may fail.</p>
    </section>}
    {authorized && <section style={{padding:22,background:"#101b2b",border:"1px solid #293c55",borderRadius:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}><h2 style={{fontSize:18}}>Workspace members ({members.length})</h2><button onClick={load} style={{background:"#17263a",color:"white",border:"1px solid #344760",borderRadius:8,padding:"9px 14px"}}>Refresh</button></div>
      <div style={{overflowX:"auto"}}><table><thead><tr><th>Username</th><th>Email</th><th>Workspace role</th><th>Status</th></tr></thead><tbody>
        {members.map(m=><tr key={m.membershipId}><td>{m.user?.username}</td><td>{m.user?.email}</td><td>{m.role}</td><td>{m.status}</td></tr>)}
      </tbody></table></div>
    </section>}
  </div>;
}
