import { BACKEND_URL } from "@/utils/constants";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) return socket;

  console.log("Initiating socket connection ...");

  socket = io(BACKEND_URL, {
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
