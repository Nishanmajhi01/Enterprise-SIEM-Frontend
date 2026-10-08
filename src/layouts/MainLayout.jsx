import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const groups = [
  { title: "MONITOR", links: [["Overview", "/dashboard", "◫"], ["Alert Center", "/alerts", "◉"], ["Incidents", "/incidents", "▤"]] },
  { title: "INTELLIGENCE", links: [["Threat Intelligence", "/threat-intel", "◎"], ["IOC Database", "/ioc", "◇"]] },
  { title: "RESPONSE & ADMIN", links: [["Playbooks", "/playbooks", "⚙"], ["Log Sources", "/devices", "▣"]] }
];
const css = `
.soc-shell{min-height:100vh;background:#080e19;color:#e8eef8;font-family:Inter,ui-sans-serif,system-ui,sans-serif;display:flex}
.soc-shell *{box-sizing:border-box}
.soc-sidebar{width:252px;flex:0 0 252px;background:#0d1625;border-right:1px solid #233148;min-height:100vh;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;z-index:30}
.soc-brand{display:flex;gap:12px;align-items:center;padding:25px 22px;border-bottom:1px solid #233148}
.soc-brand-icon{display:grid;place-items:center;width:39px;height:39px;border:1px solid #28798b;background:#103447;color:#80e6e8;border-radius:10px;font-size:25px}
.soc-brand-name{font-size:13px;letter-spacing:.11em;font-weight:800}.soc-brand-sub{font-size:10px;color:#8296b1;margin-top:4px;letter-spacing:.08em}
.soc-menu{padding:21px 13px;flex:1;overflow:auto}.soc-group{margin-bottom:25px}.soc-group-title{font-size:10px;letter-spacing:.18em;color:#647b9b;font-weight:800;padding:0 13px;margin-bottom:10px}
.soc-nav-link{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:8px;color:#9eafc8;text-decoration:none;font-size:13px;font-weight:550;margin-bottom:3px;border:1px solid transparent}
.soc-nav-link:hover{background:#17253a;color:#fff}.soc-nav-link.active{background:#123343;color:#86e1e8;border-color:#225365}
.soc-nav-icon{width:22px;font-size:19px;text-align:center}.soc-sidebar-foot{border-top:1px solid #233148;padding:18px 22px;color:#7489a4;font-size:11px}
.soc-main-wrap{min-width:0;flex:1}.soc-topbar{height:74px;border-bottom:1px solid #223047;background:#0c1523;display:flex;justify-content:space-between;align-items:center;padding:0 clamp(18px,3vw,42px);gap:15px}
.soc-topbar-title{font-weight:700;font-size:15px}.soc-topbar-sub{font-size:11px;color:#8295af;margin-top:5px}
.soc-topbar-right{display:flex;align-items:center;gap:17px}.soc-environment{font-size:11px;color:#85dbcd;border:1px solid #27554e;background:#14322e;padding:7px 11px;border-radius:99px}.soc-signout{background:#17263a;color:#d7e4f2;border:1px solid #33465e;border-radius:8px;padding:9px 13px;cursor:pointer;font-size:12px}.soc-signout:hover{background:#243b55}
.soc-main{padding:clamp(18px,3vw,42px);max-width:1800px;margin:0 auto;min-width:0}
.soc-main h1{font-size:clamp(25px,2.5vw,33px);letter-spacing:-.04em;font-weight:750;color:#f0f6ff}
.soc-main input,.soc-main select{color-scheme:dark}
.soc-mobile-toggle{display:none;background:#17263a;border:1px solid #33465e;border-radius:8px;color:#fff;padding:9px 12px}
@media(max-width:900px){.soc-sidebar{position:fixed;transform:translateX(-100%);transition:transform .2s}.soc-sidebar.open{transform:translateX(0)}.soc-mobile-toggle{display:block}.soc-topbar{height:66px}.soc-environment{display:none}.soc-main{padding:20px}}
`;
export default function MainLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const page = groups.flatMap(group => group.links).find(([,path]) => location.pathname === path || (path === "/incidents" && location.pathname.startsWith("/incidents/")));
  function signOut(){ localStorage.removeItem("token"); navigate("/login",{replace:true}); }
  return <div className="soc-shell">
    <style>{css}</style>
    <aside className={`soc-sidebar ${menuOpen ? "open" : ""}`}>
      <div className="soc-brand"><span className="soc-brand-icon">◇</span><div><div className="soc-brand-name">ENTERPRISE SIEM</div><div className="soc-brand-sub">SECURITY OPERATIONS</div></div></div>
      <nav className="soc-menu" aria-label="Main navigation">{groups.map(group=><div className="soc-group" key={group.title}><div className="soc-group-title">{group.title}</div>{group.links.map(([name,path,icon])=><NavLink key={path} to={path} onClick={()=>setMenuOpen(false)} className={({isActive})=>`soc-nav-link ${isActive ? "active" : ""}`}><span className="soc-nav-icon" aria-hidden="true">{icon}</span>{name}</NavLink>)}</div>)}</nav>
      <div className="soc-sidebar-foot">SIEM Operations Console · v1.0</div>
    </aside>
    <div className="soc-main-wrap">
      <header className="soc-topbar"><div style={{display:"flex",alignItems:"center",gap:12}}><button className="soc-mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMenuOpen(v=>!v)}>☰</button><div><div className="soc-topbar-title">{page?.[0] || "Investigation Workspace"}</div><div className="soc-topbar-sub">Security operations / {page?.[0] || "Investigation"}</div></div></div><div className="soc-topbar-right"><span className="soc-environment">● SOC Workspace</span><button className="soc-signout" onClick={signOut}>Sign out ↗</button></div></header>
      <main className="soc-main">{children}</main>
    </div>
  </div>;
}
