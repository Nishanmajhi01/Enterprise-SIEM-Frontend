import { useState } from "react";
import useRecentAlerts from "./useRecentAlerts";
import { Link } from "react-router-dom";
import socket from "../services/socket";
const tones={CRITICAL:"#ff687d",HIGH:"#f6a56b",MEDIUM:"#e7c16d",LOW:"#5ed0bb"};
export default function LiveThreatFeed(){
 const items=useRecentAlerts(20),[expanded,setExpanded]=useState({});
 return <div style={{display:"grid",gap:12}}>
 <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#91a5bf"}}><span>NETWORK & DETECTION ACTIVITY</span><span>{items.length} recent</span></div>
 <div style={{maxHeight:470,overflowY:"auto",paddingRight:4}}>
 {!items.length&&<div style={{padding:"42px 16px",textAlign:"center",border:"1px dashed #344760",borderRadius:10,color:"#9eb0c7"}}><div style={{fontSize:25,marginBottom:9}}>⌁</div><strong style={{color:"#e8f2ff"}}>Activity stream is clear</strong><div style={{fontSize:12,marginTop:6}}>New security telemetry will appear as it arrives.</div></div>}
 {items.map((a,i)=>{const sev=String(a.severity||"LOW").toUpperCase(),tone=tones[sev]||tones.LOW,key=String(a.id??i),open=!!expanded[key],time=new Date(a.createdAt||a.receivedAt);return <article key={key} style={{display:"grid",gridTemplateColumns:"14px minmax(0,1fr)",gap:11}}>
 <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:9,height:9,borderRadius:"50%",background:tone,marginTop:17,flexShrink:0}}/><span style={{width:1,background:"#2d4158",flex:1,minHeight:15}}/></div>
 <div style={{padding:"12px 0 16px",borderBottom:"1px solid #29384c",minWidth:0}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><strong style={{fontSize:12,color:"#e9f2ff"}}>{String(a.attackType||"SECURITY_EVENT").replaceAll("_"," ")}</strong><span style={{fontSize:11,color:"#8fa4bf",whiteSpace:"nowrap"}}>{Number.isNaN(time.getTime())?"—":time.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",timeZone:"Australia/Sydney"})}</span></div>
 <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",fontSize:12,marginTop:9,color:"#d5e3f3"}}><code style={{color:"#8edce1"}}>{a.sourceIP||"Unknown source"}</code><span style={{color:"#7189a6"}}>→</span><code>{a.destinationIP||"Unknown destination"}</code>{a.detection?.ports?.length>0&&<span style={{color:"#9aafc8"}}>:{a.detection.ports.slice(0,3).join(", ")}</span>}</div>
 <div style={{display:"flex",alignItems:"center",gap:10,marginTop:9,flexWrap:"wrap",fontSize:11}}><span style={{color:tone,fontWeight:800}}>{sev}</span><span style={{color:"#91a6bf"}}>Risk {a.riskScore??"—"}/100</span><button type="button" onClick={()=>setExpanded(old=>({...old,[key]:!old[key]}))} aria-expanded={open} style={{border:0,background:"none",color:"#7dd9e2",cursor:"pointer",fontSize:11,padding:0,marginLeft:"auto"}}>{open?"Hide details ↑":"Details ↓"}</button></div>
 {open&&<div style={{marginTop:12,padding:12,background:"#0b1626",border:"1px solid #2b4058",borderRadius:8,fontSize:12,color:"#aebfd3",display:"grid",gap:7}}>
 <div>MITRE: {a.mitreTechnique||"Not mapped"} {a.tactic? `· ${a.tactic}`:""}</div>
 {(a.scanType||a.detection?.scanType)&&<div>Scan: {a.detection?.scanType||a.scanType}</div>}
 {a.detection?.ports?.length>0&&<div>Ports: {a.detection.ports.join(", ")}</div>}
 {a.detection?.hosts?.length>0&&<div>Hosts: {a.detection.hosts.join(", ")}</div>}
 {a.incidentId!=null&&<Link to={`/incidents/${a.incidentId}`} style={{color:"#7dd9e2"}}>View incident #{a.incidentId} →</Link>}
 </div>}</div></article>})}</div></div>;
}
