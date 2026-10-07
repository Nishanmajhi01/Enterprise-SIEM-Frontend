import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";


function Globe(){

return (

<mesh rotation={[0.4,0.4,0]}>

<sphereGeometry 
args={[2,64,64]}
/>

<meshStandardMaterial

color="#00ffff"

wireframe

transparent

opacity={0.35}

/>

</mesh>

);

}



export default function CyberBackground(){


return (

<div className="
fixed
inset-0
-z-10
opacity-40
">


<Canvas>


<ambientLight intensity={0.5}/>


<pointLight
position={[5,5,5]}
color="#00ffff"
/>


<Globe/>


<Stars
radius={100}
depth={50}
count={3000}
factor={4}
/>


<OrbitControls
enableZoom={false}
/>


</Canvas>


</div>


);


}