import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import socket from "../services/socket";
const tones={CRITICAL:"#ff687d",HIGH:"#f6a56b",MEDIUM:"#e7c16d",LOW:"#5ed0bb"};
const fmt=v=>v?new Date(v).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Australia/Sydney"}):new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Australia/Sydney"});
export default function LiveAlerts(){
 const [items,setItems]=useState([]);
 useEffect(()=>{const handle=a=>{if(a?.workspaceId!==localStorage.getItem("siem.workspaceId"))return;setItems(old=>[{...a,receivedAt:new Date().toISOString()},...old].slice(0,30));};socket.on("security-alert",handle);return()=>socket.off("security-alert",handle);},[]);
 return <div style={{display:"grid",gap:12}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#91a5bf"}}><span><span style={{color:socket.connected?"#65d5b6":"#e4b56c"}}>●</span> {socket.connected?"Monitoring live events":"Awaiting live connection"}</span><span>{items.length} recent</span></div>
 <div aria-live="polite" style={{display:"grid",gap:8,maxHeight:470,overflowY:"auto",paddingRight:4}}>
 {!items.length&&<div style={{padding:"42px 16px",textAlign:"center",border:"1px dashed #344760",borderRadius:10,color:"#9eb0c7"}}><div style={{fontSize:25,marginBottom:9}}>◉</div><strong style={{color:"#e8f2ff"}}>No new alerts</strong><div style={{fontSize:12,marginTop:6}}>Incoming detections appear here automatically.</div></div>}
 {items.map((a,i)=>{const severity=String(a.severity||"LOW").toUpperCase(),tone=tones[severity]||tones.LOW;return <div key={a.id??i} style={{background:"#0b1626",border:"1px solid #283a52",borderLeft:`3px solid ${tone}`,borderRadius:9,padding:"13px 14px"}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:tone,letterSpacing:".05em"}}>● {severity}</span><span style={{fontSize:11,color:"#8297b2"}}>{fmt(a.createdAt||a.receivedAt)} Sydney</span></div>
 <div style={{fontSize:13,fontWeight:700,color:"#edf4ff",margin:"8px 0 9px",overflowWrap:"anywhere"}}>{a.title||String(a.attackType||"Security event").replaceAll("_"," ")}</div>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:12,color:"#9fb1c8"}}><span>Source <strong style={{color:"#dce9f7"}}>{a.sourceIP||"—"}</strong></span><span>Risk <strong style={{color:tone}}>{a.riskScore??"—"}/100</strong></span></div>
 {a.incidentId!=null&&<Link to={`/incidents/${a.incidentId}`} style={{display:"inline-block",marginTop:10,fontSize:12,color:"#75d7e2",textDecoration:"none",fontWeight:700}}>Open incident #{a.incidentId} →</Link>}
 </div>})}</div></div>;
}
