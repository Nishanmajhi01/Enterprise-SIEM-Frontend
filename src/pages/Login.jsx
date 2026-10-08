import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api.js";
import { saveToken } from "../auth/auth";

const styles = `
.siem-login { min-height:100vh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(380px,.95fr);background:#080d19;color:#e8edf7;font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
.siem-login * {box-sizing:border-box}
.siem-showcase{position:relative;overflow:hidden;padding:52px clamp(28px,5vw,88px);display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(ellipse at 68% 40%,#17375b 0%,#101d34 39%,#0b1325 75%);border-right:1px solid #263449}
.siem-showcase:before{content:"";position:absolute;inset:0;opacity:.18;background-image:linear-gradient(#6da9d5 1px,transparent 1px),linear-gradient(90deg,#6da9d5 1px,transparent 1px);background-size:52px 52px;mask-image:linear-gradient(90deg,transparent,#000)}
.siem-showcase>*{position:relative;z-index:1}
.siem-brand{display:flex;align-items:center;gap:13px;font-size:15px;font-weight:750;letter-spacing:.11em}
.siem-logo{width:42px;height:42px;display:grid;place-items:center;background:#183b56;border:1px solid #3d86ac;border-radius:12px;color:#7ee0ee;font-size:24px}
.siem-eyebrow{color:#6fe2e0;letter-spacing:.22em;font-size:11px;font-weight:800;text-transform:uppercase;margin:0 0 22px}
.siem-showcase h1{font-size:clamp(38px,4.1vw,68px);letter-spacing:-.055em;line-height:1.08;max-width:650px;margin:0 0 25px;font-weight:760}
.siem-showcase h1 span{color:#71dce5}
.siem-desc{font-size:16px;line-height:1.85;color:#9eafc8;max-width:530px;margin:0}
.siem-features{display:flex;gap:12px;flex-wrap:wrap;margin-top:36px}
.siem-feature{border:1px solid #344b63;background:#12233a99;padding:10px 14px;border-radius:8px;color:#b6c9df;font-size:12px}
.siem-foot{color:#7f94b1;font-size:12px}
.siem-auth-side{display:flex;align-items:center;justify-content:center;padding:40px 24px}
.siem-auth-panel{width:100%;max-width:430px}
.siem-auth-tag{display:inline-flex;align-items:center;gap:8px;color:#8de4da;border:1px solid #2b5859;background:#12333255;border-radius:99px;padding:7px 12px;font-size:11px;font-weight:750;letter-spacing:.09em;text-transform:uppercase}
.siem-dot{height:7px;width:7px;background:#60ddc6;border-radius:50%;box-shadow:0 0 12px #60ddc6}
.siem-auth-panel h2{font-size:35px;letter-spacing:-.045em;margin:24px 0 10px;font-weight:760}
.siem-subtitle{color:#8999b2;font-size:14px;line-height:1.7;margin:0 0 34px}
.siem-field{margin-bottom:22px}
.siem-field label{display:block;color:#c4cee0;font-size:13px;font-weight:650;margin-bottom:10px}
.siem-input-wrap{position:relative}
.siem-input{width:100%;border:1px solid #2c3950;border-radius:10px;background:#10192a;color:#f5f8ff;padding:15px 16px;font:inherit;font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s}
.siem-input::placeholder{color:#65758d}
.siem-input:focus{border-color:#4dc6ce;box-shadow:0 0 0 3px #4dc6ce22}
.siem-password{padding-right:85px}
.siem-reveal{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:transparent;border:0;color:#83cdd4;cursor:pointer;padding:8px;font-size:12px;font-weight:650}
.siem-error{border:1px solid #87434d;background:#3b1e29;color:#ffc7cb;border-radius:9px;padding:12px 14px;font-size:13px;margin-bottom:20px;line-height:1.5}
.siem-submit{width:100%;padding:15px;border:0;border-radius:10px;background:#55c9d3;color:#071522;font-weight:800;font-size:14px;cursor:pointer;transition:background .15s,transform .15s}
.siem-submit:hover:not(:disabled){background:#8ce8eb;transform:translateY(-1px)}
.siem-submit:disabled{opacity:.65;cursor:wait}
.siem-auth-bottom{margin-top:30px;border-top:1px solid #263248;padding-top:22px;color:#7d8da7;font-size:12px;line-height:1.8}
.siem-auth-bottom strong{color:#afbdd1;font-weight:650}
@media(max-width:900px){.siem-login{grid-template-columns:1fr}.siem-showcase{min-height:250px;padding:28px}.siem-showcase h1{font-size:34px}.siem-desc{font-size:13px}.siem-features{margin-top:18px}.siem-foot{display:none}.siem-auth-side{padding:44px 24px 65px}.siem-auth-panel h2{font-size:30px}}
@media(max-width:480px){.siem-showcase{min-height:230px}.siem-showcase h1{font-size:30px}.siem-feature{font-size:11px;padding:7px 10px}}
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email address and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email: email.trim(), password });
      if (!response.data?.token) throw new Error("The server did not return a session token.");
      saveToken(response.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      setError(status === 401 || status === 400 || status === 404
        ? "Invalid email or password. Please try again."
        : err.response
          ? "Unable to sign in. Please contact your administrator if the problem continues."
          : "Cannot connect to the SIEM server. Check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="siem-login">
      <style>{styles}</style>
      <section className="siem-showcase" aria-label="Platform overview">
        <div className="siem-brand"><span className="siem-logo" aria-hidden="true">◇</span> ENTERPRISE SIEM</div>
        <div>
          <p className="siem-eyebrow">Security Operations Platform</p>
          <h1>Clarity across your <span>security operations.</span></h1>
          <p className="siem-desc">Bring security telemetry, threat intelligence, incident investigation and response workflows into one focused SOC workspace.</p>
          <div className="siem-features">
            <span className="siem-feature">Threat detection</span>
            <span className="siem-feature">Incident investigation</span>
            <span className="siem-feature">Response orchestration</span>
          </div>
        </div>
        <div className="siem-foot">ENTERPRISE SIEM · AUTHORISED ACCESS ONLY</div>
      </section>
      <section className="siem-auth-side" aria-label="Sign in">
        <div className="siem-auth-panel">
          <div className="siem-auth-tag"><span className="siem-dot" /> Secure access portal</div>
          <h2>Welcome back</h2>
          <p className="siem-subtitle">Sign in with your authorised SOC account to access the security operations console.</p>
          <form onSubmit={handleSubmit}>
            <div className="siem-field">
              <label htmlFor="siem-email">Work email</label>
              <input id="siem-email" className="siem-input" type="email" autoComplete="username" placeholder="analyst@organisation.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="siem-field">
              <label htmlFor="siem-password">Password</label>
              <div className="siem-input-wrap">
                <input id="siem-password" className="siem-input siem-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="siem-reveal" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </div>
            {error && <div className="siem-error" role="alert">{error}</div>}
            <button className="siem-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in to console →"}</button>
          </form>
          <div className="siem-auth-bottom"><strong>Restricted system.</strong> Access is limited to authorised users. Account access is managed by your SIEM administrator.</div>
        </div>
      </section>
    </main>
  );
}
