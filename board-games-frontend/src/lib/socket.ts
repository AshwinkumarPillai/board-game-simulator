import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002";

export const initializeSocket = (token: string) => {
  if (socket) return socket;

  console.log("Initiating socket connection ...");

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
