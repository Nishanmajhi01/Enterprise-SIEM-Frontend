import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function IncidentCard({

    incident,

    assignIncident,

    resolveIncident,

    containIncident

}){



const navigate = useNavigate();





const severityColor=(severity)=>{


switch(severity){


case "CRITICAL":

return "text-red-400";


case "HIGH":

return "text-orange-400";


case "MEDIUM":

return "text-yellow-400";


default:

return "text-cyan-400";


}


};







return (

<motion.div


whileHover={{
scale:1.03
}}



className="
bg-black/40
backdrop-blur-xl
border
border-white/20
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

{incident.title}

</h2>





<span

className={`
font-bold
${severityColor(incident.severity)}
`}

>

{incident.severity}

</span>



</div>








<p className="
text-gray-300
mt-4
">

{incident.description || 
"No description available"}

</p>









<div className="
grid
grid-cols-3
gap-4
mt-5
text-sm
">



<p>

⚔ Attack

<br/>

<span className="text-cyan-300">

{incident.attackType || "UNKNOWN"}

</span>

</p>






<p>

🎯 Risk

<br/>

<span className="text-red-400">

{incident.riskScore || 0}

</span>

</p>






<p>

🌐 Source IP

<br/>

{incident.sourceIP || "Unknown"}

</p>



</div>









<div className="
mt-5
space-y-2
text-gray-300
">



<p>

Status:

<span className="
ml-2
text-cyan-300
">

{incident.status}

</span>

</p>






<p className="
text-purple-300
">

MITRE Technique:

{incident.mitreTechnique || "UNKNOWN"}

</p>






<p className="
text-purple-300
">

MITRE Tactic:

{incident.tactic || "UNKNOWN"}

</p>






<p>

Alert ID:

{incident.alertId || "N/A"}

</p>



</div>









{

incident.recommendation &&


<div className="
mt-5
text-yellow-300
">


<h3 className="
font-bold
">

Recommendation

</h3>


<p>

{incident.recommendation}

</p>



</div>


}









{

incident.timeline &&

incident.timeline.length > 0 &&


<div className="
mt-5
border-t
border-white/20
pt-4
">


<h3 className="
font-bold
text-cyan-300
mb-3
">

Investigation Timeline

</h3>




{

incident.timeline.map(
(item,index)=>(


<div

key={index}

className="
text-sm
text-gray-400
mb-2
"

>


{item.action}

-

{item.user || "SYSTEM"}


</div>


)


)


}


</div>


}









<div className="
flex
gap-3
mt-6
flex-wrap
">






<button

onClick={()=>navigate(
`/incidents/${incident.id}`
)}

className="
px-4
py-2
rounded-xl
bg-cyan-500/20
text-cyan-300
"

>

🔎 View Investigation

</button>







<button

onClick={()=>assignIncident(
incident.id
)}

className="
px-4
py-2
rounded-xl
bg-yellow-500/20
text-yellow-300
"

>

⚠ Investigate

</button>


<button

onClick={()=>containIncident(
incident.id,
incident.sourceIP
)}

className="
px-4
py-2
rounded-xl
bg-red-500/20
text-red-300
"

>

🛡 Contain

</button>







<button

onClick={()=>resolveIncident(
incident.id
)}

className="
px-4
py-2
rounded-xl
bg-green-500/20
text-green-300
"

>

✅ Resolve

</button>





</div>







</motion.div>


);


}