import { io } from "socket.io-client";

// Workspace membership is verified by the backend during the Socket.IO handshake.
// Do not connect until the workspace selector has resolved the active workspace.
const socket = io(
  import.meta.env.VITE_SOCKET_URL || "http://192.168.1.10:5000",
  {
    transports: ["websocket"],
    reconnection: true,
    autoConnect: false
  }
);

export function connectWorkspaceSocket(workspaceId) {
  const token = localStorage.getItem("token");
  const validWorkspaceId = typeof workspaceId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(workspaceId);

  if (!token || !validWorkspaceId) {
    socket.disconnect();
    return;
  }

  // A workspace switch must not retain a socket joined to the previous room.
  if (socket.connected || socket.active) socket.disconnect();
  socket.auth = { token, workspaceId };
  socket.connect();
}

socket.on("connect", () => {
  console.log("CONNECTED TO SIEM SOCKET:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("SOCKET ERROR:", error.message);
});

export default socket;
