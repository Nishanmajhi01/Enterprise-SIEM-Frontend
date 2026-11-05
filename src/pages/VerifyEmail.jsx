import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("Verifying your email…");
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setError(true);
      setStatus("This verification link is invalid.");
      return;
    }
    api.post("/email-account/verify-email", { token })
      .then(() => setStatus("Your email is verified. You can now sign in."))
      .catch((err) => {
        setError(true);
        setStatus(err.response?.data?.message || "Unable to verify this link. Request a new email.");
      });
  }, [token]);

  return <main style={{ minHeight:"100vh",display:"grid",placeItems:"center",background:"#080d19",color:"#edf5ff",fontFamily:"system-ui",padding:24 }}>
    <section style={{maxWidth:480,width:"100%",background:"#101b30",padding:32,borderRadius:16,border:"1px solid #30465d"}}>
      <p style={{color:"#65d7dc",fontWeight:800}}>ENTERPRISE SIEM</p>
      <h1>Email verification</h1>
      <p role="status" style={{color:error?"#ffb8be":"#c4d5e8",lineHeight:1.6}}>{status}</p>
      <Link to="/login" style={{color:"#65d7dc"}}>Go to sign in</Link>
    </section>
  </main>;
}
