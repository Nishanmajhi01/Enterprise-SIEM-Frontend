import { useEffect, useState } from "react";
import api from "../services/api";

import MitreMatrix from "../components/MitreMatrix";


export default function ThreatIntel(){

const [threats,setThreats]=useState([]);
const [error,setError]=useState("");



useEffect(()=>{

api.get("/threat-intel")

.then(res=>{

console.log("THREAT DATA:",res.data);

setThreats(
    res.data.threats || res.data
);

})

.catch(err=>{

setError(err.response?.data?.message || "Unable to load threat intelligence.");

});


},[]);



return (

<div>


<h1 className="
text-4xl
font-bold
text-cyan-400
mb-8
">

Threat Intelligence

</h1>



<div className="
grid
grid-cols-3
gap-6
">


{
threats.map((threat,index)=>(


<div

key={index}

whileHover={{
scale:1.05
}}

className="
bg-black/40
backdrop-blur-xl
border
border-cyan-400/30
rounded-2xl
p-6
shadow-xl
"

>


<div className="
flex
justify-between
">


<h2 className="
text-xl
font-bold
text-white
">

🔥 {threat.name || threat.attackType}

</h2>


<span className="
text-red-400
font-bold
">

{threat.severity || "Not classified"}

</span>


</div>



<div className="
mt-5
space-y-3
text-gray-300
">


<p>
🎯 MITRE Technique
<br/>

<span className="text-cyan-300">

{threat.mitreTechnique || "Not mapped"}

</span>

</p>



<p>
⚔ MITRE Tactic
<br/>

<span className="text-purple-300">

{threat.tactic || "Not mapped"}

</span>

</p>



<p>
🌐 Source
<br/>

{threat.sourceIP || "Unknown"}

</p>



<p>
Risk Score
<br/>

<span className="
text-red-400
text-2xl
font-bold
">

{threat.riskScore ?? "Not scored"}

</span>

</p>


</div>


</div>


))

}


</div>


{/* MITRE ATT&CK MATRIX */}

<div className="mt-10">

<MitreMatrix />

</div>


</div>

);

}