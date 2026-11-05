import {useCallback,useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import DateFilter, {matchesDateFilter, formatSydneyDate} from "../components/DateFilter";
const panel={background:"#101b2b",border:"1px solid #293c55",borderRadius:12,padding:22};
const input={background:"#0b1626",border:"1px solid #344760",borderRadius:8,padding:"11px 13px",color:"#eaf3ff"};
const colors={CRITICAL:"#ff8d99",HIGH:"#f6b67c",MEDIUM:"#f2d382",LOW:"#7bdacb"};
export default function Incidents(){
 const [items,setItems]=useState([]),[search,setSearch]=useState(""),[severity,setSeverity]=useState("ALL"),[status,setStatus]=useState("ALL"),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const [dateMode,setDateMode]=useState("ALL");
 const [singleDate,setSingleDate]=useState("");
 const [startDate,setStartDate]=useState("");
 const [endDate,setEndDate]=useState("");
 const load=useCallback(async()=>{try{const res=await api.get("/incidents");setItems(Array.isArray(res.data)?res.data:(res.data.incidents||[]));setError("");}catch(e){setError(e.response?.data?.message||"Unable to load incidents.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();const handler = (incident) => {
    if (!incident?.id) return;

    setItems((prev) => {
        const exists = prev.some(
            (item) => item.id === incident.id
        );

        if (!exists) {
            return [incident, ...prev];
        }

        return prev.map((item) =>
            item.id === incident.id
                ? { ...item, ...incident }
                : item
        );
    });
};socket.on("security-incident",handler);return()=>socket.off("security-incident",handler);},[load]);
 const filtered=useMemo(()=>items.filter(i=>(severity==="ALL"||i.severity===severity)&&(status==="ALL"||i.status===status)&&[i.title,i.sourceIP,i.attackType,i.id].some(v=>String(v??"").toLowerCase().includes(search.toLowerCase()))&&matchesDateFilter(i.createdAt,dateMode,singleDate,startDate,endDate)),[items,search,severity,status,dateMode,singleDate,startDate,endDate]);
 const cards=[["Total Incidents",items.length],["Open",items.filter(i=>i.status==="OPEN").length],["Investigating",items.filter(i=>i.status==="INVESTIGATING").length],["Contained",items.filter(i=>i.status==="CONTAINED").length]];
 return <div style={{display:"grid",gap:22}}><header><div style={{fontSize:11,letterSpacing:2,color:"#6dd9e0",fontWeight:800}}>RESPONSE / INCIDENT MANAGEMENT</div><h1 style={{margin:"12px 0 8px"}}>Incident Management</h1><p style={{color:"#90a5be",fontSize:13}}>Investigate detections, track containment and review evidence.</p></header>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>{cards.map(([name,n])=><div key={name} style={panel}><div style={{fontSize:12,color:"#8ea5bf"}}>{name}</div><strong style={{fontSize:29,display:"block",marginTop:12}}>{loading?"...":n}</strong></div>)}</div>
 {error&&<div role="alert" style={{color:"#ffc6cb",background:"#39222d",padding:14,borderRadius:9}}>{error}</div>}
 <section style={panel}><div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}><input aria-label="Search incidents" placeholder="Search title, source IP, attack type" style={{...input,flex:"1 1 250px"}} value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Severity filter" style={input} value={severity} onChange={e=>setSeverity(e.target.value)}>{["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Status filter" style={input} value={status} onChange={e=>setStatus(e.target.value)}>{["ALL","OPEN","INVESTIGATING","CONTAINED","RESOLVED","CLOSED"].map(x=><option key={x}>{x}</option>)}</select><button onClick={load} style={{...input,cursor:"pointer"}}> Refresh</button></div>
 <DateFilter
      mode={dateMode}
      setMode={setDateMode}
      singleDate={singleDate}
      setSingleDate={setSingleDate}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
    />
    <button
      style={{...input,cursor:"pointer",marginBottom:16}}
      onClick={()=>{
        setSearch("");
        setSeverity("ALL");
        setStatus("ALL");
        setDateMode("ALL");
        setSingleDate("");
        setStartDate("");
        setEndDate("");
      }}
    >Clear Filters</button>
    <div style={{color:"#90a5be",fontSize:12,marginBottom:12}}>
      Showing {filtered.length} of {items.length} incidents
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:850,borderCollapse:"collapse",fontSize:13}}><thead><tr>{["INCIDENT","SEVERITY","SOURCE IP","RISK","STATUS","MITRE","CREATED DATE","INVESTIGATE"].map(x=><th key={x} style={{textAlign:"left",padding:14,color:"#91a8c2",fontSize:11,borderBottom:"1px solid #33445b"}}>{x}</th>)}</tr></thead><tbody>{filtered.map(i=><tr key={i.id} style={{borderBottom:"1px solid #29384c"}}><td style={{padding:14}}><div style={{color:"#eaf3ff",fontWeight:650}}>{i.title||i.attackType||"Incident"}</div><small style={{color:"#8198b1"}}>#{i.id} | {i.attackType||"Unknown"}</small></td><td style={{padding:14,color:colors[i.severity]||"#b9c9da",fontWeight:750}}>{i.severity||"-"}</td><td style={{padding:14}}>{i.sourceIP||"-"}</td><td style={{padding:14}}>{i.riskScore??"-"}</td><td style={{padding:14}}>{i.status||"-"}</td><td style={{padding:14}}>{i.mitreTechnique||"-"}</td><td style={{padding:14,whiteSpace:"nowrap"}}>{formatSydneyDate(i.createdAt)}</td><td style={{padding:14}}><Link to={`/incidents/${i.id}`} style={{color:"#76dbe2",textDecoration:"none",fontWeight:700}}>Open case &rarr;</Link></td></tr>)}{!loading&&!filtered.length&&<tr><td colSpan={8} style={{padding:24,textAlign:"center",color:"#90a5be"}}>No matching incidents found.</td></tr>}</tbody></table></div></section></div>;
}
