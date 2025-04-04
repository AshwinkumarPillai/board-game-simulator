import { Server, Socket } from "socket.io";
import { Lobby } from "../utils/types";
import { createInitialGameState } from "../utils/game.utils";
import { ERROR_CONSTANTS, GAME_MAX_PLAYER_LIMIT } from "../utils/constants";
import { createLobbyPayload, emitError, joinLobbyPayload, leaveLobbyPayload } from "../utils/socket.utils";
import { userSockets } from "../socket";

const createLobby = (
  socket: Socket,
  userLobbies: Map<string, string>,
  lobbies: Map<string, Lobby>,
  maxPlayerLimit: number
) => {
  console.log("MAX PLAYER LIMIT");

  console.log(maxPlayerLimit);

  if (userLobbies.has(socket.data.userId)) {
    emitError(socket, ERROR_CONSTANTS.LOBBY_EXISTS, { lobbyId: userLobbies.get(socket.data.userId) });
    return;
  }
  const lobbyId = `lobby-${Date.now()}`; // assign a unique ID
  const lobby: Lobby = {
    id: lobbyId,
    players: [
      {
        id: socket.data.userId,
        status: "active",
      },
    ],
    owner: socket.data.userId,
    gameState: createInitialGameState(socket.data.userId),
    maxPlayerLimit: Math.min(maxPlayerLimit, GAME_MAX_PLAYER_LIMIT),
    spectators: [],
  };
  userLobbies.set(socket.data.userId, lobbyId);
  lobbies.set(lobbyId, lobby);

  // Join the socket to the room (lobby)
  socket.join(lobbyId);

  socket.emit("lobbyCreated", lobby); // Notify the owner about lobby creation
  console.log(`Lobby created: ${lobbyId} by ${socket.data.userId}`);
};

const joinLobby = (socket: Socket, lobbies: Map<string, Lobby>, lobbyId: string) => {
  console.log("LobbyID: ", lobbyId);

  for (const [key, value] of lobbies) {
    console.log(`${key}: ${value}`);
  }

  const lobby = lobbies.get(lobbyId);
  if (!lobby) {
    emitError(socket, ERROR_CONSTANTS.LOBBY_NOT_FOUND);
    return;
  }

  joinLobbyHelper(socket, lobby);

  // Join the socket to the room (lobby)
  socket.join(lobbyId);

  socket.emit("lobbyJoined", { lobbyId, updatedLobby: lobby }); // Notify the new player

  socket.to(lobbyId).emit("lobbyUpdate", lobby); // Broadcast to players in this lobby
};

const joinLobbyHelper = (socket: Socket, lobby: Lobby) => {
  if (lobby.gameState.phase !== "lobby") {
    if (lobby.players.find((player) => player.id === socket.data.userId)) {
      lobby.players = lobby.players.map((player) => {
        if (player.id === socket.data.userId) return { ...player, status: "active" };
        return player;
      });
    } else {
      lobby.spectators.push({
        id: socket.data.userId,
        username: socket.data.username,
      });
    }
  } else {
    if (lobby.players.length >= lobby.maxPlayerLimit) {
      emitError(socket, ERROR_CONSTANTS.LOBBY_FULL);
      return;
    }

    lobby.players.push({ id: socket.data.userId, status: "active" });
  }
};

export const leaveLobby = (
  socket: Socket,
  userLobbies: Map<string, string>,
  lobbies: Map<string, Lobby>,
  lobbyId: string
) => {
  const lobby = lobbies.get(lobbyId);
  if (!lobby) {
    emitError(socket, ERROR_CONSTANTS.LOBBY_NOT_FOUND);
    return;
  }

  leaveLobbyHelper(socket, userLobbies, lobby);
  console.log(`User ${socket.data.userId} left lobby ${lobbyId}`);

  // if player is the owner -> then remove all players from the lobby, notify them
  if (lobby.owner === socket.data.userId) {
    lobby.players.forEach((player) => {
      userLobbies.delete(player.id);
      const playerSocket = userSockets.get(player.id);
      playerSocket?.emit("lobbyLeft", { lobbyId });
      playerSocket?.leave(lobbyId);
    });
    lobby.players = [];
  }

  // If all players were removed (by owner leaving or the last person leaving) -> remove the lobby from the server
  if (lobby.players.length === 0) {
    lobbies.delete(lobbyId);
    console.log(`Lobby ${lobbyId} deleted (no players remaining)`);
  }

  socket.emit("lobbyLeft", { lobbyId }); // Notify the user they left the lobby
  socket.leave(lobbyId); // Leave the socket from the room (lobby)
  socket.to(lobbyId).emit("lobbyUpdate", lobby); // Notify other players in the lobby about the update
};

const leaveLobbyHelper = (socket: Socket, userLobbies: Map<string, string>, lobby: Lobby) => {
  if (lobby.gameState.phase !== "lobby") {
    if (lobby.players.find((player) => player.id === socket.data.userId)) {
      lobby.players = lobby.players.map((player) => {
        if (player.id === socket.data.userId) return { ...player, status: "inactive" };
        return player;
      });
    } else {
      lobby.spectators = lobby.spectators.filter((spectator) => spectator.id !== socket.data.userId);
      userLobbies.delete(socket.data.userId); // remove this user from the lobby too
    }
  } else {
    lobby.players = lobby.players.filter((player) => player.id !== socket.data.userId);
  }
};

export const handleLobbyEvents = (
  socket: Socket,
  userLobbies: Map<string, string>,
  lobbies: Map<string, Lobby>
) => {
  // Handle lobby creation
  socket.on("createLobby", (data: createLobbyPayload) =>
    createLobby(socket, userLobbies, lobbies, data.maxPlayerLimit)
  );

  // Handle joining a lobby
  socket.on("joinLobby", (data: joinLobbyPayload) => joinLobby(socket, lobbies, data.lobbyId));

  // Handle leaving a lobby
  socket.on("leaveLobby", (data: leaveLobbyPayload) =>
    leaveLobby(socket, userLobbies, lobbies, data.lobbyId)
  );
};
