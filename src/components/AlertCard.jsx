import { motion } from "framer-motion";


export default function AlertCard({
    alert,
    updateStatus,
    resolveAlert
}) {


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
scale:1.02
}}


className="
bg-white/10
backdrop-blur-xl
border
border-white/20
rounded-2xl
p-6
"


>


<div className="
flex
justify-between
">


<h2 className="
text-xl
font-bold
">

{alert.title}

</h2>


<span
className={`
font-bold
${severityColor(alert.severity)}
`}
>

{alert.severity}

</span>


</div>




<p className="
text-gray-300
mt-3
">

{alert.description}

</p>





<div className="
mt-4
grid
grid-cols-3
gap-4
text-sm
">


<p>

🌐 IP:
<br/>

{alert.sourceIP || "Unknown"}

</p>



<p>

⚔ Attack:
<br/>

{alert.attackType || "Unknown"}

</p>



<p>

🎯 Risk:
<br/>

{alert.riskScore}

</p>


</div>




<div className="
mt-4
text-gray-400
">


Status:

<span className="
ml-2
text-white
">

{alert.status}

</span>


</div>




<div className="
flex
gap-3
mt-5
">


<button

onClick={()=>updateStatus(
alert.id,
"INVESTIGATING"
)}

className="
px-4
py-2
rounded-lg
bg-yellow-500/20
text-yellow-300
"

>

Investigate

</button>




<button

onClick={()=>resolveAlert(alert.id)}

className="
px-4
py-2
rounded-lg
bg-green-500/20
text-green-300
"

>

Resolve

</button>


</div>



</motion.div>


);


}