// Display-only role hints from the signed session token.
// The server must independently enforce authorization for every API request.
export function getSessionRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null;
    return ["ADMIN", "ANALYST", "VIEWER"].includes(payload.role) ? payload.role : null;
  } catch {
    return null;
  }
}
