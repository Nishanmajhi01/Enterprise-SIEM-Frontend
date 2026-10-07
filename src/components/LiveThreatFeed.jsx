import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../services/socket";


export default function LiveThreatFeed(){

    const [alerts,setAlerts] = useState([]);


    useEffect(()=>{


        socket.on(
            "security-alert",
            (alert)=>{


                console.log(
                    "LIVE THREAT RECEIVED:",
                    alert
                );


                setAlerts(prev=>[
                    alert,
                    ...prev.slice(0,9)
                ]);


            }
        );


        return ()=>{

            socket.off("security-alert");

        };


    },[]);



    const getColor=(severity)=>{


        if(severity==="CRITICAL")
            return "border-red-500 shadow-red-500/50";


        if(severity==="HIGH")
            return "border-orange-500";


        if(severity==="MEDIUM")
            return "border-yellow-400";


        return "border-cyan-400";


    };



    return (

        <div className="
        mt-10
        bg-white/10
        backdrop-blur-xl
        rounded-2xl
        p-6
        border
        border-white/20
        ">


        <h2 className="
        text-2xl
        font-bold
        text-cyan-400
        mb-5
        ">

        🚨 Live Threat Feed

        </h2>



        {
            alerts.length===0 &&

            <p className="text-gray-400">

            Waiting for threats...

            </p>

        }



        <div className="space-y-4">


        <AnimatePresence>


        {
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

        exit={{
            opacity:0,
            x:-50
        }}

        transition={{
            duration:0.3
        }}

        className={`
        border
        rounded-xl
        p-4
        bg-black/40
        ${getColor(alert.severity)}
        `}


        >


        <div className="flex justify-between">


        <h3 className="
        font-bold
        text-xl
        text-white
        ">

        {alert.name || alert.attackType || "Unknown Threat"}

        </h3>



        <span className="font-bold text-red-400">

        {alert.severity || "LOW"}

        </span>


        </div>




        <div className="
        text-gray-300
        mt-3
        space-y-2
        ">


        <p>

        ⚔ Attack Type:

        <span className="text-cyan-300">

        {" "}
        {alert.attackType || "Unknown"}

        </span>

        </p>



        <p>

        🎯 MITRE Technique:

        <span className="text-cyan-300">

        {" "}
        {alert.mitreTechnique || "Unknown"}

        </span>

        </p>




        <p>

        🧠 MITRE Tactic:

        <span className="text-purple-300">

        {" "}
        {alert.tactic || "Unknown"}

        </span>

        </p>



        </div>





        <div className="
        text-sm
        mt-4
        text-cyan-300
        ">


        🌐 IP:

        {" "}

        {alert.sourceIP || "Unknown"}


        <br/>


        ⚠ Risk Score:

        {" "}

        <span className="text-red-400 font-bold">

        {alert.riskScore || 0}

        </span>


        </div>



        </motion.div>


        ))

        }


        </AnimatePresence>


        </div>


        </div>

    );


}