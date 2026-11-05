import { useEffect, useState } from "react";
import api from "../services/api";
import { connectWorkspaceSocket } from "../services/socket";

const KEY = "siem.workspaceId";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function WorkspaceSelector({ onRoleChange }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(localStorage.getItem(KEY) || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/auth/workspaces")
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data?.workspaces) ? data.workspaces.filter(w => UUID.test(w.id)) : [];
        setWorkspaces(list);
        const stored = localStorage.getItem(KEY);
        const validStored = list.some(w => w.id === stored);
        const next = validStored ? stored : (list.length === 1 ? list[0].id : "");
        if (next) localStorage.setItem(KEY, next);
        else localStorage.removeItem(KEY);
        setSelected(next);
        connectWorkspaceSocket(next);
        onRoleChange?.(list.find(w => w.id === next)?.role || null);
        setError("");
      })
      .catch(() => {
        if (active) { connectWorkspaceSocket(null); setError("Workspace list unavailable"); onRoleChange?.(null); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function selectWorkspace(event) {
    const next = event.target.value;
    if (next && !workspaces.some(w => w.id === next)) return;
    if (next) localStorage.setItem(KEY, next);
    else localStorage.removeItem(KEY);
    connectWorkspaceSocket(null);
    setSelected(next);
    // Clear stale workspace data by reloading all workspace-scoped pages.
    window.location.reload();
  }

  if (loading) return <span style={{fontSize:11,color:"#8295af"}}>Loading workspaces…</span>;
  if (error) return <span title="Workspace selection requires the new backend endpoint" style={{fontSize:11,color:"#f4bd86"}}>{error}</span>;
  if (!workspaces.length) return <span style={{fontSize:11,color:"#f4bd86"}}>No active workspace</span>;

  return <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#9db4ca"}}>
    <span>Workspace</span>
    <select aria-label="Active workspace" value={selected} onChange={selectWorkspace}
      style={{maxWidth:220,minWidth:130,background:"#15253a",color:"#eaf4ff",border:"1px solid #34506c",borderRadius:8,padding:"8px 10px"}}>
      {workspaces.length > 1 && <option value="">Select workspace</option>}
      {workspaces.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
    </select>
  </label>;
}
