import { io } from "socket.io-client";


const socket = io(
    "http://192.168.1.10:5000",
    {
        transports:["websocket"],
        reconnection:true
    }
);



socket.on("connect",()=>{

    console.log(
        "CONNECTED TO SIEM SOCKET:",
        socket.id
    );

});



socket.on("connect_error",(error)=>{

    console.log(
        "SOCKET ERROR:",
        error.message
    );

});



export default socket;
