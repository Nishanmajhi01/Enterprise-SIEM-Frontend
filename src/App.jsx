import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


import MainLayout from "./layouts/MainLayout";


import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incident";
import ThreatIntel from "./pages/ThreatIntel";
import IncidentDetails from "./pages/IncidentDetails";
import IOC from "./pages/IOC";
import Playbooks from "./pages/Playbooks";
import Devices from "./pages/Devices";





function ProtectedRoute({children}){


    const token =
    localStorage.getItem("token");



    if(!token){


        return (

            <Navigate 
            to="/login"
            replace
            />

        );


    }



    return children;


}







function ProtectedLayout({children}){


return (

<ProtectedRoute>

<MainLayout>

{children}

</MainLayout>

</ProtectedRoute>

);


}









export default function App(){



return (

<BrowserRouter>


<Routes>





{/* LOGIN */}

<Route

path="/login"

element={<Login />}

/>







{/* DEFAULT REDIRECT */}

<Route

path="/"

element={
<Navigate 
to="/dashboard"
replace
/>
}

/>









{/* DASHBOARD */}

<Route

path="/dashboard"

element={

<ProtectedLayout>

<Dashboard />

</ProtectedLayout>

}

/>











{/* ALERTS */}

<Route

path="/alerts"

element={

<ProtectedLayout>

<Alerts />

</ProtectedLayout>

}

/>











{/* INCIDENT LIST */}

<Route

path="/incidents"

element={

<ProtectedLayout>

<Incidents />

</ProtectedLayout>

}

/>











{/* INCIDENT DETAILS */}

<Route

path="/incidents/:id"

element={

<ProtectedLayout>

<IncidentDetails />

</ProtectedLayout>

}

/>











{/* THREAT INTELLIGENCE */}

<Route

path="/threat-intel"

element={

<ProtectedLayout>

<ThreatIntel />

</ProtectedLayout>

}

/>











{/* IOC MANAGEMENT */}

<Route

path="/ioc"

element={

<ProtectedLayout>

<IOC />

</ProtectedLayout>

}

/>




{/* RESPONSE PLAYBOOKS */}

<Route

path="/playbooks"

element={

<ProtectedLayout>

<Playbooks />

</ProtectedLayout>

}

/>




{/* DEVICES */}

<Route

path="/devices"

element={

<ProtectedLayout>

<Devices />

</ProtectedLayout>

}

/>




{/* UNKNOWN ROUTE */}

<Route

path="*"

element={

<Navigate 
to="/dashboard"
replace
/>

}

/>






</Routes>


</BrowserRouter>


);


}