import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";

export default function useRecentAlerts(limit) {
  const workspaceId = localStorage.getItem("siem.workspaceId");
  const [state, setState] = useState({ workspaceId, items: [] });
  useEffect(() => {
    let active = true;
    const merge = incoming => {
      if (!active || localStorage.getItem("siem.workspaceId") !== workspaceId) return;
      setState(old => {
        const records = new Map();
        for (const a of [...(old.workspaceId === workspaceId ? old.items : []), ...incoming]) {
          if (a.workspaceId !== workspaceId || a.id == null) continue;
          const key = String(a.id);
          records.set(key, { ...records.get(key), ...a });
        }
        return { workspaceId, items: [...records.values()].sort((a,b) => new Date(b.createdAt || b.receivedAt) - new Date(a.createdAt || a.receivedAt)).slice(0,limit) };
      });
    };
    const handle = a => merge([{...a, receivedAt: new Date().toISOString()}]);
    const load = async () => {
      try {
        const {data} = await api.get("/alerts");
        if (Array.isArray(data.alerts)) merge(data.alerts);
      } catch (error) { console.warn("Recent alerts could not be loaded", error.message); }
    };
    socket.on("security-alert", handle);
    socket.on("connect", load);
    if (workspaceId) load();
    return () => { active = false; socket.off("security-alert", handle); socket.off("connect", load); };
  }, [workspaceId, limit]);
  return state.workspaceId === workspaceId ? state.items : [];
}
