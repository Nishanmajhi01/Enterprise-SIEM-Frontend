import {
    Link
} from "react-router-dom";


export default function Sidebar(){

return (

<div className="
fixed
left-0
top-0
h-screen
w-64
bg-white/10
backdrop-blur-xl
border-r
border-white/20
p-5
">


<h1 className="
text-2xl
font-bold
text-cyan-400
mb-10
">

⚡ SIEM

</h1>


<nav className="space-y-5">


<Link to="/dashboard">
Dashboard
</Link>


<Link to="/alerts">
Alerts
</Link>


<Link to="/incidents">
Incidents
</Link>


<Link to="/events">
Events
</Link>


<Link to="/ioc">
IOC Management
</Link>


<Link to="/threat-intel">
Threat Intelligence
</Link>


<Link to="/playbooks">
Playbooks
</Link>


<Link to="/devices">
Devices
</Link>


</nav>


</div>

);

}