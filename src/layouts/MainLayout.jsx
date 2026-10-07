import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import CyberBackground from "../components/CyberBackground";


export default function MainLayout({ children }) {


const menu = [

{
name:"Dashboard",
path:"/dashboard",
icon:"🛡️"
},

{
name:"Alerts",
path:"/alerts",
icon:"🚨"
},

{
name:"Incidents",
path:"/incidents",
icon:"🔥"
},

{
name:"Threat Intel",
path:"/threat-intel",
icon:"🌐"
},

{
name:"IOC Database",
path:"/ioc",
icon:"🧬"
},

{
name:"Devices",
path:"/devices",
icon:"💻"
},

{
name:"Audit Logs",
path:"/audit",
icon:"📜"
}

];


return (

<div
className="
min-h-screen
bg-black
text-white
flex
overflow-hidden
relative
"
>


{/* 3D Background */}

<CyberBackground />



{/* Animated Gradient Background */}

<div
className="
fixed
inset-0
bg-gradient-to-br
from-cyan-900/30
via-black
to-purple-900/30
z-0
"
>


<div
className="
absolute
w-96
h-96
bg-cyan-500/20
rounded-full
blur-3xl
top-20
left-20
animate-pulse
"
>

</div>



<div
className="
absolute
w-96
h-96
bg-purple-500/20
rounded-full
blur-3xl
bottom-20
right-20
animate-pulse
"
>

</div>


</div>





{/* Sidebar */}


<motion.aside

initial={{
x:-100,
opacity:0
}}

animate={{
x:0,
opacity:1
}}

transition={{
duration:0.6
}}

className="
relative
z-10
w-72
p-6
bg-white/10
backdrop-blur-xl
border-r
border-white/20
"

>


<h1
className="
text-3xl
font-bold
text-cyan-400
mb-10
"
>

⚡ SIEM

</h1>



<nav
className="
space-y-4
"
>


{

menu.map((item)=>(


<NavLink

key={item.path}

to={item.path}

className={({isActive})=>

`
flex
items-center
gap-4
p-3
rounded-xl
transition
duration-300

${
isActive

?

"bg-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20"

:

"hover:bg-white/10"

}

`

}

>


<span
className="
text-xl
"
>

{item.icon}

</span>



<span>

{item.name}

</span>


</NavLink>


))

}


</nav>



<div
className="
absolute
bottom-6
left-6
text-sm
text-gray-400
"
>

SOC Platform v1.0

</div>



</motion.aside>








{/* Main Content */}


<main

className="
relative
z-10
flex-1
p-8
overflow-y-auto
"

>


{children}


</main>



</div>


);

}