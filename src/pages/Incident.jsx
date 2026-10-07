import { useEffect, useState } from "react";

import api from "../services/api";

import IncidentCard from "../components/IncidentCard";
import socket from "../services/socket";


export default function Incidents(){


const [incidents,setIncidents]=useState([]);

const [loading,setLoading]=useState(true);



const loadIncidents = async()=>{


try{


setLoading(true);


const res =
await api.get("/incidents");



setIncidents(
res.data.incidents || []
);



}
catch(error){


console.log(
"Incident loading error:",
error
);


}
finally{


setLoading(false);


}


};





useEffect(()=>{


loadIncidents();


// RECEIVE REAL-TIME INCIDENTS

socket.on(
"security-incident",
(incident)=>{


console.log(
"NEW SOC INCIDENT:",
incident
);


// Add new incident at top

setIncidents(prev=>[

incident,

...prev

]);


});


return ()=>{


socket.off(
"security-incident"
);


};


},[]);







const assignIncident = async(id)=>{


try{


await api.patch(

`/incidents/${id}/assign`,

{

assignedTo:1

}

);



loadIncidents();


}
catch(error){


console.log(error);


}


};


const containIncident = async(id,ip)=>{

try{

console.log(
"CONTAIN CLICKED:",
id,
ip
);


const res = await api.patch(

`/incidents/${id}/contain`,

{
action:"BLOCK_IP",
target:ip
}

);


console.log(
"CONTAIN RESPONSE:",
res.data
);


// update only this incident immediately

setIncidents(prev=>

prev.map(item=>

item.id === id

?

{
...item,
status:"CONTAINED"
}

:

item

)

);


}
catch(error){

console.log(
"Contain error:",
error
);

}

};






const resolveIncident = async(id)=>{


try{


await api.patch(

`/incidents/${id}/resolve`,

{

resolutionNote:
"Resolved by SOC Analyst"

}

);



loadIncidents();


}
catch(error){


console.log(error);


}


};







if(loading){


return (

<div className="text-xl text-cyan-400">

Loading incidents...

</div>

);


}






return (

<div>


<h1 className="
text-4xl
font-bold
text-cyan-400
mb-8
">

🚨 Incident Response Center

</h1>





<button

onClick={loadIncidents}

className="
mb-6
px-4
py-2
rounded-xl
bg-cyan-500/20
text-cyan-300
"

>

Refresh Incidents

</button>







{

incidents.length===0 &&

<p className="
text-gray-400
">

No active incidents found

</p>


}







<div className="
grid
grid-cols-2
gap-6
">


{

incidents.map(incident=>(


<IncidentCard

key={incident.id}

incident={incident}

assignIncident={assignIncident}

containIncident={containIncident}

resolveIncident={resolveIncident}

/>


))


}


</div>






</div>


);


}