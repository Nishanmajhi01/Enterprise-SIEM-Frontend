import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import LiveAlerts from "../components/LiveAlerts";
import LiveThreatFeed from "../components/LiveThreatFeed";
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip} from "recharts";

const panel = {background:"#101b2b",border:"1px solid #25364d",borderRadius:12,padding:22};
const label = {color:"#8da2bd",fontSize:12,fontWeight:600};
export default function Dashboard(){
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [lastUpdated,setLastUpdated]=useState(null);
  const load=useCallback(async()=>{
    try{
      const res=await api.get("/dashboard");
      setStats(res.data);setError("");setLastUpdated(new Date());
    }catch(err){setError(err.response ? "Dashboard data could not be loaded." : "Cannot reach the SIEM backend.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();const id=setInterval(load,30000);return()=>clearInterval(id);},[load]);
  const cards=[
    ["Total IOCs",stats?.ioc?.totalIOCs],
    ["Malicious IOCs",stats?.ioc?.maliciousIOCs],
    ["Total Incidents",stats?.incidents?.totalIncidents],
    ["Open Incidents",stats?.incidents?.openIncidents],
    ["High-Risk Events",stats?.highRiskEvents]
  ];
  const attackTypes=(Array.isArray(stats?.attackTypes)?stats.attackTypes:[]).map(x=>({name:String(x.attackType||"UNKNOWN").replaceAll("_"," "),count:Number(x.count||0)})).sort((a,b)=>b.count-a.count).slice(0,8);
  const sources=(Array.isArray(stats?.topAttackers)?stats.topAttackers:[]).map(x=>({name:x.sourceIP||"Unknown",count:Number(x.count||0)})).slice(0,5);
  return <div style={{display:"grid",gap:24}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:15,flexWrap:"wrap"}}>
      <div><div style={{color:"#70d8d8",fontSize:11,letterSpacing:2,fontWeight:800,marginBottom:10}}>SECURITY OPERATIONS / OVERVIEW</div><h1 style={{margin:0}}>Security Overview</h1><p style={{color:"#92a4bc",fontSize:13,marginTop:9}}>Operational metrics and live security telemetry from the connected SIEM backend.</p></div>
      <button onClick={load} style={{background:"#153949",color:"#8ee6e8",border:"1px solid #286879",padding:"11px 16px",borderRadius:8,cursor:"pointer"}}>↻ Refresh data</button>
    </div>
    {error&&<div role="alert" style={{border:"1px solid #84424b",background:"#3b1e29",color:"#ffd0d4",borderRadius:8,padding:14}}>{error} {stats&&"Showing the last successfully loaded values."}</div>}
    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",color:"#8298b2",fontSize:12}}><span style={{color:error?"#f6b5b8":"#86dfd2"}}>● {error?"Backend connection issue":stats?"Backend data loaded":"Connecting"}</span><span>·</span><span>Last updated: {lastUpdated?lastUpdated.toLocaleTimeString():"Not yet available"}</span><span>·</span><span>Auto-refresh: 30 seconds</span></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:14}}>{cards.map(([name,value])=><div key={name} style={panel}><div style={label}>{name}</div><div style={{fontSize:32,fontWeight:780,letterSpacing:"-.04em",marginTop:13,color:name==="Open Incidents"?"#f4bd86":"#eaf4ff"}}>{loading?"…":value??"—"}</div><div style={{fontSize:11,color:"#69839e",marginTop:10}}>Backend metric</div></div>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:16}}>
      {[[ "Events by Attack Type",attackTypes,"#56c8d2" ],["Top Source IPs (Event Volume)",sources,"#a69ce9"]].map(([heading,data,color])=><section key={heading} style={panel}>
        <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 8px"}}>{heading}</h2>
        <p style={{fontSize:12,color:"#8da2bd",margin:"0 0 18px"}}>Actual backend aggregate · all recorded events</p>
        {data.length?<div style={{height:280,width:"100%"}}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{top:0,right:15,bottom:0,left:0}}><XAxis type="number" tick={{fill:"#9cb0c7",fontSize:11}}/><YAxis type="category" dataKey="name" width={120} tick={{fill:"#9cb0c7",fontSize:10}}/><Tooltip contentStyle={{background:"#142238",border:"1px solid #34506c",color:"#fff"}}/><Bar dataKey="count" fill={color} radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>:<p style={{color:"#8da2bd"}}>No data available.</p>}
      </section>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,alignItems:"start"}}>
      <section style={panel}><h2 style={{fontSize:16,margin:"0 0 8px",fontWeight:700}}>Live Alerts</h2><p style={{color:"#8297b1",fontSize:12,margin:"0 0 18px"}}>Incoming detection alerts</p><LiveAlerts /></section>
      <section style={panel}><h2 style={{fontSize:16,margin:"0 0 8px",fontWeight:700}}>Threat Activity Feed</h2><p style={{color:"#8297b1",fontSize:12,margin:"0 0 18px"}}>Live security activity and intelligence</p><LiveThreatFeed /></section>
    </div>
    <p style={{fontSize:11,color:"#69829f",margin:0}}>Charts show real backend aggregates. Historical time-series require a timestamp-based analytics endpoint.</p>
  </div>;
}
