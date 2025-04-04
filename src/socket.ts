import { Server, Socket } from "socket.io";
import { handleAuthentication, handleDisconnection } from "./handlers/connectionHandler";
import { handleLobbyEvents, leaveLobby } from "./handlers/lobbyHandler";
import { handleGameEvents } from "./handlers/gameHandler";
import { Lobby } from "./utils/types";

export const userSockets: Map<string, Socket> = new Map(); // userId -> socket
const userLobbies: Map<string, string> = new Map(); // userId -> lobbyId (map all users to the lobbyIds they belong)
const lobbiesMap: Map<string, Lobby> = new Map(); // lobbyId -> lobby

export const initializeSocket = (io: Server) => {
  io.use((socket, next) => handleAuthentication(socket, userSockets, next)); // after this point -> socket.data.userId will have the _id of the user

  io.on("connection", (socket: Socket) => {
    console.log(`User connected [SOCKET ID]: ${socket.id}, [USER ID]: ${socket.data.userId}`);

    userSockets.set(socket.data.userId, socket); // Track user connection

    handleLobbyEvents(socket, userLobbies, lobbiesMap); // Handle lobby events
    handleGameEvents(socket, io); // Handle game events

    socket.on("error", (data) => {
      console.error("Error:", data.message);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      leaveLobby(socket, userLobbies, lobbiesMap, userLobbies.get(socket.data.userId) || "");
      handleDisconnection(socket, userSockets);
    });
  });
};
