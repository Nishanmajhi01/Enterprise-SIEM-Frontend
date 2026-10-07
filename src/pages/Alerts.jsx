import { useEffect, useState } from "react";
import api from "../services/api";
import AlertCard from "../components/AlertCard";
import socket from "../services/socket";


export default function Alerts(){


const [alerts,setAlerts]=useState([]);
const [search,setSearch]=useState("");



useEffect(()=>{


fetchAlerts();


// RECEIVE REAL-TIME ALERTS

socket.on(
"security-alert",
(alert)=>{


console.log(
"NEW SOC ALERT:",
alert
);


// add newest alert at top

setAlerts(prev=>[
alert,
...prev
]);


});


return ()=>{


socket.off(
"security-alert"
);


};


},[]);





const fetchAlerts = async()=>{


try{


const res = await api.get("/alerts");


setAlerts(
res.data.alerts || []
);


}
catch(error){


console.log(error);


}


};





// UPDATE STATUS

const updateStatus = async(id,status)=>{


try{


await api.patch(

`/alerts/${id}/status`,

{
status
}

);



setAlerts(prev=>

prev.map(alert=>

alert.id===id

?

{
...alert,
status
}

:

alert

)

);



}
catch(error){


console.log(error);


}


};







// RESOLVE ALERT

const resolveAlert = async(id)=>{


try{


await api.patch(

`/alerts/${id}/resolve`,

{

resolutionNote:
"Resolved by SOC analyst"

}

);



setAlerts(prev=>

prev.map(alert=>

alert.id===id

?

{
...alert,
status:"RESOLVED"
}

:

alert

)

);



}
catch(error){


console.log(error);


}


};






const filteredAlerts =

alerts.filter(alert=>


(alert.title || "")

.toLowerCase()

.includes(

search.toLowerCase()

)


);






return (


<div>



<h1 className="
text-4xl
font-bold
mb-8
text-cyan-400
">

🚨 Security Alerts

</h1>






<input


placeholder="Search alerts..."


value={search}


onChange={
e=>setSearch(e.target.value)
}


className="
mb-6
w-full
p-3
rounded-xl
bg-white/10
border
border-white/20
outline-none
"

/>








<div className="
space-y-5
">


{

filteredAlerts.length === 0 &&


<p className="
text-gray-400
">

No alerts found

</p>


}






{

filteredAlerts.map(alert=>(


<AlertCard


key={alert.id}


alert={alert}


updateStatus={updateStatus}


resolveAlert={resolveAlert}


/>


))


}



</div>






</div>


);


}