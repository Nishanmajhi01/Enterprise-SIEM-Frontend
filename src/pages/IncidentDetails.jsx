import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";


export default function IncidentDetails(){


const {id} = useParams();


const [incident,setIncident] = useState(null);

const [loading,setLoading] = useState(true);
const [assignedUser,setAssignedUser] = useState("");

const [containAction,setContainAction] = useState("");

const [target,setTarget] = useState("");

const updateStatus = async(status)=>{

try{


await api.put(
`/incidents/${id}`,
{
status
}
);


loadIncident();


}
catch(error){

console.log(
"Status update failed",
error
);

}


};


const assignIncident = async()=>{

try{

await api.put(
`/incidents/${id}/assign`,
{
    assignedTo: assignedUser,
    username:"SOC_ANALYST"
}
);


loadIncident();


}
catch(error){

console.log(
"Assignment failed",
error
);

}

};

const containIncident = async()=>{


try{


await api.put(

`/incidents/${id}/contain`,

{

action:containAction,

target:target

}

);


loadIncident();


}

catch(error){


console.log(
"Containment failed",
error
);


}


};



const loadIncident = async()=>{


try{


const res =
await api.get(`/incidents/${id}`);


setIncident(
res.data.incident
);


}
catch(error){


console.log(
"Incident details error:",
error
);


}
finally{


setLoading(false);


}


};




useEffect(()=>{

loadIncident();

},[id]);





if(loading){

return (

<div className="text-cyan-400 text-xl">

Loading investigation...

</div>

);

}




if(!incident){

return (

<div className="text-red-400">

Incident not found

</div>

);

}





return (

<div className="space-y-6">



<h1 className="
text-4xl
font-bold
text-cyan-400
">

Incident Investigation

</h1>





<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="text-2xl text-white font-bold">

{incident.title}

</h2>



<p className="text-gray-300 mt-3">

{incident.description}

</p>



<div className="grid grid-cols-3 gap-4 mt-5">


<div>

Severity

<p className="text-orange-400">

{incident.severity}

</p>

</div>



<div>

Risk Score

<p className="text-red-400">

{incident.riskScore}

</p>

</div>



<div>

Status

<p className="text-cyan-300">

{incident.status}

</p>


<div className="mt-3 space-x-2">


<button

className="
bg-blue-600
px-3
py-2
rounded
"

onClick={()=>updateStatus("INVESTIGATING")}

>

Investigate

</button>



<button

className="
bg-yellow-600
px-3
py-2
rounded
"

onClick={()=>{ if(window.confirm("Change incident status to CONTAINED? This only updates case status; it does not perform network isolation.")) updateStatus("CONTAINED"); }}

>

Contain

</button>




<button

className="
bg-green-600
px-3
py-2
rounded
"

onClick={()=>updateStatus("RESOLVED")}

>

Resolve

</button>


<div className="mt-4">

<input

className="
bg-black
border
border-white/20
p-2
rounded
"

placeholder="Analyst User ID"

value={assignedUser}

onChange={
(e)=>setAssignedUser(e.target.value)
}

/>


<button

className="
bg-purple-600
px-3
py-2
rounded
ml-2
"

onClick={assignIncident}

>

Assign

</button>


</div>


</div>


</div>


</div>


</div>









<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="
text-xl
text-cyan-300
font-bold
">

Related Alerts

</h2>


{
incident.alerts?.map(alert=>(

<div
key={alert.id}
className="
mt-3
p-3
bg-white/5
rounded-lg
"
>

Alert #{alert.id}

<br/>

{alert.title}

<br/>

Source:
{alert.sourceIP}


</div>


))

}


</div>









<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="
text-xl
text-purple-300
font-bold
">

MITRE ATT&CK

</h2>


<p>

Technique:

{incident.mitreTechnique}

</p>


<p>

Tactic:

{incident.tactic}

</p>


</div>






<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="
text-xl
text-yellow-300
font-bold
">

Evidence

</h2>


{
incident.evidenceItems?.length > 0 ? (

incident.evidenceItems.map(item=>(

<div
key={item.id}
className="
mt-3
p-3
bg-white/5
rounded-lg
text-gray-300
"
>

<p>
<b>Type:</b> {item.type}
</p>


<p>
<b>Source:</b> {item.source}
</p>


<p>
<b>Description:</b> {item.description}
</p>


<p>
<b>Alert ID:</b> {item.data?.alertId}
</p>


<p>
<b>Source IP:</b> {item.data?.sourceIP}
</p>


<p>
<b>Attack Type:</b> {item.data?.attackType}
</p>


</div>


))

)

:

(

<p className="text-gray-400">
No evidence available
</p>

)

}


</div>


<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="
text-xl
text-green-300
font-bold
">

Investigation Timeline

</h2>



{
incident.timeline?.map((item,index)=>(


<div
key={index}
className="
mt-3
text-gray-300
"
>

{item.action}

-

{item.user}


</div>


))

}


</div>







<div className="
bg-black/40
border
border-white/20
rounded-xl
p-6
">


<h2 className="
text-xl
text-red-300
font-bold
">

Response Actions


</h2>

<div className="mt-4 space-y-3">


<select

className="
bg-black
border
border-white/20
p-2
rounded
"

value={containAction}

onChange={
(e)=>setContainAction(e.target.value)
}

>

<option value="">
Select Action
</option>


<option value="BLOCK_IP">
Block IP
</option>


<option value="DISABLE_ACCOUNT">
Disable Account
</option>


<option value="ISOLATE_HOST">
Isolate Host
</option>


<option value="KILL_PROCESS">
Kill Process
</option>


</select>




<input

className="
bg-black
border
border-white/20
p-2
rounded
ml-2
"

placeholder="Target"

value={target}

onChange={
(e)=>setTarget(e.target.value)
}

/>




<button

className="
bg-red-600
px-4
py-2
rounded
ml-2
"

onClick={() => { if(containAction && target && window.confirm(`Execute ${containAction} against ${target}? This may change firewall rules.`)) containIncident(); }}

>

Execute Containment

</button>


</div>


{
incident.responseActions?.length > 0 ? (

incident.responseActions.map((action)=>(

<div
key={action.id}
className="
mt-5
p-4
bg-white/5
border
border-white/10
rounded-lg
"
>

<p className="text-green-400 font-bold text-lg">
Recorded Response Action
</p>

<p className="mt-2">
<b>Action:</b> {action.action}
</p>

<p>
<b>Target:</b> {action.target}
</p>

<p>
<b>Status:</b>{" "}
<span className={
action.status === "SUCCESS"
? "text-green-400"
: "text-red-400"
}>
{action.status}
</span>
</p>

<p>
<b>Playbook:</b> {action.details?.playbook || "N/A"}
</p>

<p>
<b>Simulated:</b>{" "}
{action.details?.simulated === false ? "No — Real action" : action.details?.simulated === true ? "Yes — Simulation" : "Unknown"}
</p>

<p>
<b>Result:</b> {action.details?.message || "N/A"}
</p>

<p className="text-gray-400 text-sm mt-2">
{action.createdAt
? new Date(action.createdAt).toLocaleString()
: ""}
</p>

</div>

))

) : (

<p className="text-gray-400 mt-4">
No response actions yet
</p>

)
}


</div>





</div>


);


}