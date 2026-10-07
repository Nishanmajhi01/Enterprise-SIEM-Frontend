import {useState} from "react";
import api from "../services/api.js";
import {saveToken} from "../auth/auth";


function Login(){

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");


const login=async()=>{

try{


const response =
await api.post(
"/auth/login",
{
email,
password
}
);


saveToken(
response.data.token
);


window.location.href="/dashboard";


}
catch(error){

alert(
"Login failed"
);

}


};



return(

<div>

<h1>
Enterprise SIEM Login
</h1>


<input
placeholder="Email"
onChange={
e=>setEmail(e.target.value)
}
/>


<input
placeholder="Password"
type="password"
onChange={
e=>setPassword(e.target.value)
}
/>


<button onClick={login}>
LOGIN
</button>


</div>

);


}


export default Login;