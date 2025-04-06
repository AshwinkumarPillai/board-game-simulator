import { Server, Socket } from "socket.io";
import { handleAuthentication, handleDisconnection } from "./handlers/connectionHandler";
import { handleLobbyEvents, leaveLobby } from "./handlers/lobbyHandler";
import { userSockets } from "./core/state";

export const initializeSocket = (io: Server) => {
  io.use((socket, next) => handleAuthentication(socket, next)); // after this point -> socket.data.userId will have the _id of the user

  io.on("connection", (socket: Socket) => {
    handleLobbyEvents(socket); // Handle lobby events

    socket.on("error", (data) => {
      console.error("Error:", data.message);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      handleDisconnection(socket, userSockets);
    });
  });
};
