import { Socket } from "socket.io";

import { ERROR_CONSTANTS, validGames } from "../utils/constants";
import { emitError, validatePayloads } from "../utils/socket.utils";
import { Lobby } from "../types/lobby";
import {
  createLobbyPayload,
  GameType,
  joinLobbyPayload,
  leaveLobbyPayload,
  startLobbyGamePayload,
} from "../types/types";
import {
  blackJackGamesMap,
  lobbiesMap,
  pokerGamesMap,
  userDataMap,
  userLobbyMap,
  userSockets,
} from "../core/state";
import { LobbyNotFoundError } from "../errors/socket.errors";

const broadCastLobbyUpdate = (
  socket: Socket,
  lobbyId: string,
  lobby: Lobby,
  socketMessageType: string,
  message: string = ""
) => {
  let game = null;
  if (
    (lobby.gameStatus === "in-progress" || lobby.gameStatus === "finished") &&
    blackJackGamesMap.has(lobby.gameId as string)
  ) {
    game = blackJackGamesMap.get(lobby.gameId as string);
  }
  socket.emit(socketMessageType, { lobbyId, lobby, game, message });
  socket.to(lobbyId).emit("lobbyUpdate", { lobby, game });
};

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
      const lobby = lobbiesMap.get(userLobbyMap.get(socket.data.userId)!);
      const game = lobby?.gameId ? blackJackGamesMap.get(lobby.gameId) : null; // TODO - Later handle for multiple games
      emitError(socket, ERROR_CONSTANTS.LOBBY_EXISTS, { lobby, game });
      return;
    }

    // All server management (the maps we use) will be handled in the constructor
    const lobby = new Lobby(userDataMap.get(socket.data.userId)!, game, maxPlayerLimit);

    // Join the socket to the room (lobby)
    socket.join(lobby.id);
    socket.emit("lobbyCreated", { lobby }); // Notify the owner about lobby creation
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

const joinLobby = (socket: Socket, lobbyId: string) => {
  try {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) {
      LobbyNotFoundError(socket);
      return;
    }

    lobby.addPlayer(userDataMap.get(socket.data.userId)!);

    // Join the socket to the room (lobby)
    socket.join(lobbyId);
    broadCastLobbyUpdate(socket, lobbyId, lobby, "lobbyJoined");
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

export const leaveLobby = (socket: Socket, lobbyId: string) => {
  try {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) {
      LobbyNotFoundError(socket);
      return;
    }
    lobby.removePlayer(socket.data.userId);
    broadCastLobbyUpdate(
      socket,
      lobbyId,
      lobby,
      "lobbyLeft",
      `You left the lobby:  ${lobbyId} | ${lobby.gameType}`
    );
    socket.leave(lobbyId); // Leave the socket from the room (lobby)

    // If the owner leaves the lobby before the game begins we destroy the lobby
    if (lobby.gameStatus === "lobby" && lobby.ownerId === socket.data.userId) {
      destroyLobby(lobbyId);
    }
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

const startLobbyGame = (socket: Socket, lobbyId: string) => {
  try {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) {
      LobbyNotFoundError(socket);
      return;
    }
    if (lobby.ownerId !== socket.data.userId) {
      emitError(socket, ERROR_CONSTANTS.NOT_LOBBY_OWNER);
      return;
    }
    if (lobby.gameStatus !== "lobby") {
      let game = null;
      if (blackJackGamesMap.has(lobby.gameId as string)) {
        game = blackJackGamesMap.get(lobby.gameId as string);
      } else if (pokerGamesMap.has(lobby.gameId as string)) {
        game = pokerGamesMap.get(lobby.gameId as string);
      }
      emitError(socket, ERROR_CONSTANTS.GAME_ALREADY_STARTED, { lobby, game });
      return;
    }

    const game = lobby.startGame();

    if (game) {
      lobby.players.forEach((player) => {
        userSockets.get(player.id)?.join(game.id);
      });
      lobby.spectators.forEach((spectator) => {
        userSockets.get(spectator.id)?.join(game.id);
      });
      // The frontend handles lobby and game update since we are sending both
      socket.emit("lobbyGameStarted", { lobby, game });
      socket.to(lobbyId).emit("lobbyGameStarted", { lobby, game });
    }
  } catch (error: Error | any) {
    console.error(error);
    emitError(socket, error.message);
  }
};

const checkIfUserIsInAnyLobby = (socket: Socket) => {
  if (userLobbyMap.has(socket.data.userId)) {
    const lobby = lobbiesMap.get(userLobbyMap.get(socket.data.userId)!);
    const game = lobby?.gameId ? blackJackGamesMap.get(lobby.gameId) : null; // TODO - Later handle for multiple games
    if (game) joinLobby(socket, lobby!.id);
    socket.emit("userIsInLobby", { lobby, game });
  } else {
    socket.emit("userIsInLobby", { lobby: null, game: null });
  }
};

export const handleLobbyEvents = (socket: Socket) => {
  // Handle lobby creation
  socket.on("createLobby", (data: createLobbyPayload) => createLobby(socket, data.game, data.maxPlayerLimit));

  // Handle joining a lobby
  socket.on("joinLobby", (data: joinLobbyPayload) => joinLobby(socket, data.lobbyId));

  // Handle leaving a lobby
  socket.on("leaveLobby", (data: leaveLobbyPayload) => leaveLobby(socket, data.lobbyId));

  // Start game from lobby
  socket.on("startLobbyGame", (data: startLobbyGamePayload) => startLobbyGame(socket, data.lobbyId));

  // Check if user belongs to any lobby
  socket.on("checkIfUserIsInAnyLobby", () => checkIfUserIsInAnyLobby(socket));

  // Check if the lobby Id is valid (if the lobby is on the server or not)
  socket.on("checkCurrentLobby", (data: { lobbyId: string }) => {
    const lobby = lobbiesMap.get(data.lobbyId);
    if (lobby) {
      socket.emit("validLobby", { lobby });
    } else {
      socket.emit("invalidLobby");
    }
  });
};

// Helper to destroy a lobby
const destroyLobby = (lobbyId: string) => {
  const lobby = lobbiesMap.get(lobbyId);
  if (!lobby) return;

  for (const player of [...lobby.players]) {
    leaveLobby(userSockets.get(player.id)!, lobbyId);
  }
};
