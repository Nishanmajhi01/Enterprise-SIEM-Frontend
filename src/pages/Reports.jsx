import {useState,useEffect} from "react";
import api from "../services/api";
const panel={background:"#101b2b",border:"1px solid #25364d",borderRadius:12,padding:22};
const label={color:"#8da2bd",fontSize:12,fontWeight:600};
export default function Reports(){
  const [stats,setStats]=useState(null);
  useEffect(()=>{let active=true;api.get("/dashboard").then(r=>{if(active)setStats(r.data);}).catch(()=>{});return()=>{active=false;};},[]);
  const [filters,setFilters]=useState({from:"",to:"",attackType:"",severity:"",status:""});
  const [downloading,setDownloading]=useState(false);
  const [reportError,setReportError]=useState("");
  async function downloadReport(){
    setReportError("");
    if(filters.from && filters.to && filters.from>filters.to){setReportError("Start date must precede end date.");return;}
    setDownloading(true);
    try{
      const params=Object.fromEntries(Object.entries(filters).filter(([,v])=>v));
      const res=await api.get("/dashboard/report/pdf",{params,responseType:"blob",timeout:60000});
      if(!res.headers["content-type"]?.includes("application/pdf")) throw new Error("Invalid PDF response");
      const url=URL.createObjectURL(res.data);
      const a=document.createElement("a");a.href=url;a.download="siem-security-report.pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(err){setReportError(err.response?.status===403?"Only administrators and analysts can download reports.":"Report download failed. Check backend connection and permissions.");}
    finally{setDownloading(false);}
  }

  return <div style={{display:"grid",gap:24}}><h1>Security Reports</h1>
    <section style={panel}>
      <h2 style={{fontSize:16,margin:"0 0 8px"}}>Security Reports</h2>
      <p style={{color:"#92a4bc",fontSize:13}}>Download workspace incident details and alert statistics. Dates use UTC. Leave dates empty to include all historical records.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:16,alignItems:"end"}}>
        {[["from","From"],["to","To"]].map(([key,name])=><label key={key} style={label}>{name}<input type="date" value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{display:"block",width:"100%",minWidth:0,marginTop:6,padding:8,colorScheme:"dark"}}/></label>)}
        {[["attackType","Threat type",Array.from(new Set([...['BRUTE_FORCE','PORT_SCAN','DDOS','PHISHING','MALWARE'],...(stats?.attackTypes||[]).map(x=>x.attackType).filter(Boolean)]))],["severity","Severity",["LOW","MEDIUM","HIGH","CRITICAL"]],["status","Incident status",["OPEN","ACKNOWLEDGED","INVESTIGATING","CONTAINED","RESOLVED","CLOSED"]]].map(([key,name,options])=><label key={key} style={label}>{name}<select value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{display:"block",width:"100%",minWidth:0,marginTop:6,padding:8,colorScheme:"dark"}}><option value="">All</option>{options.map(v=><option key={v} value={v}>{v.replaceAll("_"," ")}</option>)}</select></label>)}
        <button disabled={downloading} onClick={downloadReport} style={{background:"#153949",color:"#8ee6e8",border:"1px solid #286879",padding:"11px 16px",borderRadius:8,cursor:downloading?"wait":"pointer"}}>{downloading?"Generating…":"Download PDF Report"}</button>
      </div>
      {reportError&&<p role="alert" style={{color:"#ffd0d4"}}>{reportError}</p>}
    </section>

  </div>;
}
