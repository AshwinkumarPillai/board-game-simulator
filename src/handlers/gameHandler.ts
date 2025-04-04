import { Server, Socket } from "socket.io";

export const handleGameEvents = (socket: Socket, io: Server) => {
  socket.on("startGame", (lobbyId: string) => {
    console.log(`Game started in lobby: ${lobbyId}`);
    io.to(lobbyId).emit("gameStarted");
  });

  socket.on("playCard", (lobbyId: string, card: string) => {
    console.log(`Card played in ${lobbyId}: ${card}`);
    io.to(lobbyId).emit("cardPlayed", { player: socket.id, card });
  });

  socket.on("endGame", (lobbyId: string) => {
    console.log(`Game ended in ${lobbyId}`);
    io.to(lobbyId).emit("gameEnded");
  });
};
