import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const signedIn = Boolean(localStorage.getItem("token"));
  const valid = /^[a-f0-9]{64}$/.test(token);

  async function accept(event) {
    event.preventDefault();
    if (busy || !valid) return;
    if (!signedIn && password !== confirm) { setError("Passwords do not match."); return; }
    if (!signedIn && new TextEncoder().encode(password).length > 72) { setError("Password must not exceed 72 UTF-8 bytes."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const path = signedIn ? "/workspace-invitations/accept-existing" : "/workspace-invitations/accept-new";
      const { data } = await api.post(path, signedIn ? {token} : {token, username:username.trim(), password});
      setMessage(data.message || "Invitation accepted.");
      setPassword(""); setConfirm("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to accept invitation.");
    } finally { setBusy(false); }
  }

  const field = {width:"100%",boxSizing:"border-box",padding:12,background:"#17263a",border:"1px solid #425775",borderRadius:8,color:"white",marginTop:6};
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#080d19",color:"#edf5ff",fontFamily:"system-ui",padding:24}}>
    <section style={{maxWidth:480,width:"100%",background:"#101b30",padding:32,borderRadius:16,border:"1px solid #30465d"}}>
      <p style={{color:"#65d7dc",fontWeight:800}}>ENTERPRISE SIEM</p>
      <h1>Accept workspace invitation</h1>
      {!valid ? <p role="alert">This invitation link is invalid.</p> :
        <form onSubmit={accept}>
          <p style={{color:"#aebfd5",lineHeight:1.6}}>{signedIn ? "Accept this invitation using your signed-in account. The invited email must match your account email." : "New here? Set up your account below. If you already have a SIEM account, sign in first and reopen this invitation link."}</p>
          {!signedIn && <>
            <label style={{display:"block",marginBottom:15}}>Your name<input style={field} value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} maxLength={100} /></label>
            <label style={{display:"block",marginBottom:15}}>Password (at least 12 characters)<input style={field} type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={12} autoComplete="new-password" /></label>
            <label style={{display:"block",marginBottom:15}}>Confirm password<input style={field} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={12} autoComplete="new-password" /></label>
          </>}
          {error && <p role="alert" style={{color:"#ffb8be"}}>{error}</p>}
          {message && <p role="status" style={{color:"#8de0bd"}}>{message}</p>}
          <button type="submit" disabled={busy || Boolean(message)} style={{background:"#55c9d3",border:0,borderRadius:8,padding:"12px 20px",fontWeight:800}}>{busy?"Accepting…":"Accept invitation"}</button>
        </form>}
      <p><Link to={signedIn?"/dashboard":"/login"} style={{color:"#65d7dc"}}>{signedIn?"Return to dashboard":"Sign in"}</Link></p>
    </section>
  </main>;
}
