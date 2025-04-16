import { Server, Socket } from "socket.io";
import { handleAuthentication, handleDisconnection } from "./handlers/connectionHandler";
import { handleLobbyEvents } from "./handlers/lobbyHandler";
import { userSockets } from "./core/state";
import { handleBlackJackEvents } from "./handlers/gameHandler";

export const initializeSocket = (io: Server) => {
  try {
    io.use((socket, next) => handleAuthentication(socket, next)); // after this point -> socket.data.userId will have the _id of the user

    io.on("connection", (socket: Socket) => {
      handleLobbyEvents(socket); // Handle lobby events
      handleBlackJackEvents(socket); // Handle blackjack events

      socket.on("error", (data) => {
        console.error("Error:", data.message);
        socket.emit("error", data.message);
      });

      // Handle user disconnection
      socket.on("disconnect", () => {
        handleDisconnection(socket, userSockets);
      });
    });
  } catch (error) {
    console.log(error);
  }
};
