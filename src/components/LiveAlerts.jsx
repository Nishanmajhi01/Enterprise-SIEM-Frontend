import {useEffect,useState} from "react";
import {motion} from "framer-motion";
import socket from "../services/socket";


export default function LiveAlerts(){


const [alerts,setAlerts]=useState([]);



useEffect(()=>{


socket.on(
"security-alert",
(alert)=>{

    console.log(
"New Security Alert:",
alert
);


setAlerts(prev=>[

alert,

...prev

].slice(0,5));


});


return ()=>{

socket.off("alert");

};


},[]);



return (

<div className="
mt-8
bg-white/10
backdrop-blur-xl
border
border-white/20
rounded-2xl
p-6
">


<h2 className="
text-2xl
font-bold
mb-5
">

🚨 Live Security Alerts

</h2>



{

alerts.length===0 ?

<p className="text-gray-400">

Waiting for threats...

</p>


:


alerts.map((alert,index)=>(


<motion.div

key={index}

initial={{
opacity:0,
x:50
}}

animate={{
opacity:1,
x:0
}}

className="
mb-3
p-4
rounded-xl
bg-red-500/20
border
border-red-400/30
"

>


<h3 className="
font-bold
text-red-400
">

{alert.title}

</h3>


<p>

IP:
{alert.sourceIP}

</p>


<p>

Risk:
{alert.riskScore}

</p>


</motion.div>


))


}



</div>

);

}