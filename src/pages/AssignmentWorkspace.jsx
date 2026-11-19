import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function receiptKey() {
  const token = localStorage.getItem("token") || "";
  let id = "unknown";
  try { id = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).id || "unknown"; } catch {}
  return `siem.assignmentReads:${id}:${localStorage.getItem("siem.workspaceId") || "none"}`;
}
function readReceipts() { try { return JSON.parse(localStorage.getItem(receiptKey()) || "[]"); } catch { return []; } }
const completed = status => ["RESOLVED", "CLOSED"].includes(String(status || "").toUpperCase());
function activeNotifications(data) {
  const statuses = new Map((data.tasks || []).map(task => [Number(task.id), task.status]));
  return (data.notifications || []).filter(n => !completed(statuses.get(Number(n.incidentId))));
}
export function useAssignmentInbox() {
  const [data, setData] = useState({ tasks: [], notifications: [], overview: null });
  const [error, setError] = useState("");
  const [reads, setReads] = useState(readReceipts);
  const refresh = useCallback(async () => {
    if (!localStorage.getItem("siem.workspaceId")) return;
    try { const response = await api.get("/incidents/assignment-inbox"); setData(response.data); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Unable to load assignment inbox"); }
  }, []);
  useEffect(() => {
    refresh();
    const onAssignment = payload => { if (payload?.workspaceId === localStorage.getItem("siem.workspaceId")) refresh(); };
    socket.on("incident-assigned", onAssignment);
    socket.on("connect", refresh);
    const timer = setInterval(refresh, 30000);
    return () => { socket.off("incident-assigned", onAssignment); socket.off("connect", refresh); clearInterval(timer); };
  }, [refresh]);
  const markRead = id => {
    setReads(previous => {
      const next = [...new Set([...previous, id])];
      localStorage.setItem(receiptKey(), JSON.stringify(next));
      return next;
    });
  };
  return { ...data, error, reads, markRead, refresh, unread: activeNotifications(data).filter(n => !reads.includes(n.id)).length };
}
const panel = { background:"#101b2b",border:"1px solid #293c55",borderRadius:12,padding:20 };
const link = { color:"#78dce5",textDecoration:"none" };
export function AssignmentBell() {
  const { notifications, tasks, unread, markRead, error } = useAssignmentInbox();
  const visibleNotifications = activeNotifications({ notifications, tasks });
  const [open, setOpen] = useState(false);
  return <div style={{position:"relative"}}>
    <button type="button" aria-label={`Assignment notifications, ${unread} unread`} aria-expanded={open} onClick={() => setOpen(v => !v)} style={{background:"#17263a",border:"1px solid #344760",color:"#eaf3ff",padding:"9px 12px",borderRadius:8,cursor:"pointer"}}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign:"middle"}}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>{unread > 0 && <span style={{marginLeft:7,fontWeight:600}}>{unread}</span>}</button>
    {open && <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:"min(360px,90vw)",maxHeight:440,overflowY:"auto",background:"#101b2b",border:"1px solid #344760",borderRadius:12,padding:14,zIndex:60,boxShadow:"0 15px 35px #0009"}}>
      <strong>Incident assignments</strong>
      {error && <p style={{color:"#f5b7b7"}}>{error}</p>}
      {!visibleNotifications.length && <p style={{color:"#9eafc8"}}>No active assignment notifications.</p>}
      {visibleNotifications.slice(0,12).map(n => <div key={n.id} style={{padding:"12px 0",borderBottom:"1px solid #29384c"}}>
        <Link to={`/incidents/${n.incidentId}`} onClick={() => { markRead(n.id); setOpen(false); }} style={link}><strong>{!readReceipts().includes(n.id) ? "● " : ""}#{n.incidentId} {n.title}</strong></Link>
        <div style={{fontSize:12,color:"#9eb0c7"}}>{n.severity} · Assigned by {n.assignedBy}</div>
        <div style={{fontSize:11,color:"#8198b1"}}>{n.time ? new Date(n.time).toLocaleString("en-AU",{timeZone:"Australia/Sydney"}) : "Date unavailable"}</div>
      </div>)}
      <Link to="/my-incidents" onClick={() => setOpen(false)} style={{...link,display:"block",marginTop:12}}>View my assignments →</Link>
    </div>}
  </div>;
}
export default function AssignmentWorkspace() {
  const { tasks, notifications, overview, reads, markRead, error, refresh } = useAssignmentInbox();
  const visibleNotifications = activeNotifications({tasks, notifications});
  const activeTasks = tasks.filter(i => !["RESOLVED","CLOSED"].includes(String(i.status).toUpperCase()));
  const completedTasks = tasks.filter(i => ["RESOLVED","CLOSED"].includes(String(i.status).toUpperCase()));
  const [members, setMembers] = useState([]);
  useEffect(() => { if (overview) api.get("/auth/assignable-members").then(r => setMembers(r.data.members || [])).catch(() => {}); }, [overview !== null]);
  const memberName = id => members.find(m => Number(m.id) === Number(id))?.username || (id ? `User #${id}` : "Unassigned");
  return <div style={{display:"grid",gap:20}}>
    <header><h1>My Assigned Incidents</h1><p style={{color:"#9eb0c7"}}>Your current SOC workload and assignment notifications.</p><button onClick={refresh} style={{color:"#eaf3ff",background:"#17263a",border:"1px solid #344760",padding:10,borderRadius:8}}>Refresh</button></header>
    {error && <div role="alert" style={{color:"#ffc6cb"}}>{error}</div>}
    <section style={panel}><h2>Active tasks ({activeTasks.length})</h2><p style={{color:"#9eb0c7"}}>{tasks.length} total assigned · {completedTasks.length} resolved / closed · {visibleNotifications.filter(n=>!reads.includes(n.id)).length} unread notifications</p><div style={{overflowX:"auto"}}><table style={{width:"100%"}}><thead><tr>{["Incident","Severity","Status","Assigned","Open"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{activeTasks.map(i=><tr key={i.id}><td>#{i.id} {i.title}</td><td>{i.severity}</td><td>{i.status}</td><td>{i.assignedAt ? new Date(i.assignedAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"}) : "Previously assigned"}</td><td><Link style={link} to={`/incidents/${i.id}`}>Open case →</Link></td></tr>)}{!activeTasks.length && <tr><td colSpan={5}>No incidents currently assigned to you.</td></tr>}</tbody></table></div></section>
    <section style={panel}><h2>Completed / resolved ({completedTasks.length})</h2><div style={{overflowX:"auto"}}><table><thead><tr><th>Incident</th><th>Severity</th><th>Status</th><th>Open</th></tr></thead><tbody>{completedTasks.map(i=><tr key={i.id}><td>#{i.id} {i.title}</td><td>{i.severity}</td><td>{i.status}</td><td><Link style={link} to={`/incidents/${i.id}`}>View case →</Link></td></tr>)}{!completedTasks.length && <tr><td colSpan={4}>No completed incidents yet.</td></tr>}</tbody></table></div></section>
    <section style={panel}><h2>Assignment notifications ({visibleNotifications.filter(n=>!reads.includes(n.id)).length} unread · {notifications.length} historical total)</h2>{visibleNotifications.map(n=><div key={n.id} style={{padding:"10px 0",borderBottom:"1px solid #29384c"}}><Link style={link} onClick={() => markRead(n.id)} to={`/incidents/${n.incidentId}`}>{!reads.includes(n.id) ? "● " : ""}#{n.incidentId} {n.title}</Link><span style={{color:"#9eb0c7"}}> · Assigned by {n.assignedBy}</span> <button onClick={()=>markRead(n.id)} disabled={reads.includes(n.id)} style={{marginLeft:8}}>Mark read</button></div>)}{!visibleNotifications.length && <p>No active assignment notifications. Completed incident notifications are excluded from the active inbox.</p>}</section>
    {overview && <section style={panel}><h2>Administrator assignment overview</h2><p style={{color:"#9eb0c7"}}>Workspace incidents and current owners. {overview.filter(i=>!i.assignedTo).length} unassigned.</p><div style={{overflowX:"auto"}}><table style={{width:"100%"}}><thead><tr>{["Incident","Severity","Status","Assigned to","Open"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{overview.map(i=><tr key={i.id}><td>#{i.id} {i.title}</td><td>{i.severity}</td><td>{i.status}</td><td>{memberName(i.assignedTo)}</td><td><Link style={link} to={`/incidents/${i.id}`}>Open case →</Link></td></tr>)}</tbody></table></div></section>}
  </div>;
}
