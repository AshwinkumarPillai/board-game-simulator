import { Server, Socket } from "socket.io";

import { ERROR_CONSTANTS, GAME_MAX_PLAYER_LIMIT, validGames } from "../utils/constants";
import {
  createLobbyPayload,
  emitError,
  joinLobbyPayload,
  leaveLobbyPayload,
  validatePayloads,
} from "../utils/socket.utils";
import { Lobby } from "../types/lobby";
import { GameType } from "../types/types";
import { lobbiesMap, userDataMap, userLobbyMap, userSockets } from "../core/state";

const createLobby = (socket: Socket, game: GameType, maxPlayerLimit: number) => {
  try {
    const isValid = validatePayloads(socket, {
      game,
      maxPlayerLimit,
    });

    if (!isValid) return;

    if (!validGames.includes(game)) {
      emitError(socket, ERROR_CONSTANTS.INVALID_GAME_TYPE, { "valid games": validGames });
      return;
    }

    if (userLobbyMap.has(socket.data.userId)) {
      emitError(socket, ERROR_CONSTANTS.LOBBY_EXISTS, { lobbyId: userLobbyMap.get(socket.data.userId) });
      return;
    }

    // All server management (the maps we use) will be handled in the constructor
    const lobby = new Lobby(userDataMap.get(socket.data.userId)!, game, maxPlayerLimit);

    // Join the socket to the room (lobby)
    socket.join(lobby.id);
    socket.emit("lobbyCreated", lobby); // Notify the owner about lobby creation
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

const joinLobby = (socket: Socket, lobbyId: string) => {
  try {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) {
      emitError(socket, ERROR_CONSTANTS.LOBBY_NOT_FOUND);
      return;
    }

    lobby.addPlayer(userDataMap.get(socket.data.userId)!);

    // Join the socket to the room (lobby)
    socket.join(lobbyId);
    socket.emit("lobbyJoined", { lobbyId, updatedLobby: lobby }); // Notify the new player
    socket.to(lobbyId).emit("lobbyUpdate", lobby); // Broadcast to players in this lobby
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

export const leaveLobby = (socket: Socket, lobbyId: string) => {
  try {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) {
      emitError(socket, ERROR_CONSTANTS.LOBBY_NOT_FOUND);
      return;
    }
    lobby.removePlayer(socket.data.userId);
    socket.emit("lobbyLeft", { message: `You left the lobby:  ${lobbyId} | ${lobby.gameType}`, lobbyId }); // Notify the user they left the lobby
    socket.leave(lobbyId); // Leave the socket from the room (lobby)
    socket.to(lobbyId).emit("lobbyUpdate", lobby); // Notify other players in the lobby about the update

    // If the owner leaves the lobby before the game begins we destroy the lobby
    if (lobby.gameStatus === "lobby" && lobby.ownerId === socket.data.userId) {
      destroyLobby(lobbyId);
    }
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

export const handleLobbyEvents = (socket: Socket) => {
  // Handle lobby creation
  socket.on("createLobby", (data: createLobbyPayload) => createLobby(socket, data.game, data.maxPlayerLimit));

  // Handle joining a lobby
  socket.on("joinLobby", (data: joinLobbyPayload) => joinLobby(socket, data.lobbyId));

  // Handle leaving a lobby
  socket.on("leaveLobby", (data: leaveLobbyPayload) => leaveLobby(socket, data.lobbyId));
};

// Helper to destroy a lobby
const destroyLobby = (lobbyId: string) => {
  const lobby = lobbiesMap.get(lobbyId);
  if (!lobby) return;

  for (const player of [...lobby.players]) {
    leaveLobby(userSockets.get(player.id)!, lobbyId);
  }
};
