import axios from "axios";

// Vite can override this for different deployment environments.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.10:5000/api",
});

const WORKSPACE_ID_KEY = "siem.workspaceId";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Never trust an arbitrary workspace header from user-controlled input.
  // The backend still authorizes workspace membership on every request.
  const workspaceId = localStorage.getItem(WORKSPACE_ID_KEY);
  if (workspaceId && UUID_PATTERN.test(workspaceId)) {
    config.headers["x-workspace-id"] = workspaceId;
  }

  return config;
});

export default api;
