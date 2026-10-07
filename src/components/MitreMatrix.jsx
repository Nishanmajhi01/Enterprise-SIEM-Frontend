export default function MitreMatrix(){


const tactics=[


{
name:"Initial Access",
techniques:[
"Phishing",
"Exploit Public Application"
]
},


{
name:"Execution",
techniques:[
"PowerShell",
"Command Shell"
]
},


{
name:"Credential Access",
techniques:[
"Brute Force",
"Password Spray"
]
},


{
name:"Persistence",
techniques:[
"Create Account",
"Scheduled Task"
]
},


{
name:"Discovery",
techniques:[
"Network Discovery",
"System Information"
]
}


];



return (

<div className="
mt-10
">


<h2 className="
text-3xl
font-bold
text-cyan-400
mb-6
">

🛡 MITRE ATT&CK Matrix

</h2>



<div className="
grid
grid-cols-5
gap-5
">


{

tactics.map((t,index)=>(


<div

key={index}

className="
bg-white/10
backdrop-blur-xl
border
border-white/20
rounded-xl
p-5
"


>


<h3 className="
font-bold
text-purple-300
mb-4
">

{t.name}

</h3>



{

t.techniques.map((tech)=>(


<div

key={tech}

className="
bg-black/40
rounded-lg
p-2
mb-2
text-sm
"

>

{tech}

</div>


))


}



</div>


))


}



</div>


</div>

);


}