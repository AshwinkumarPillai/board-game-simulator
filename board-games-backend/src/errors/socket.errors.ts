import { Socket } from "socket.io";
import { emitError } from "../utils/socket.utils";
import { ERROR_CONSTANTS } from "../utils/constants";
import { blackJackGamesMap, lobbiesMap, pokerGamesMap, userLobbyMap } from "../core/state";
import { Lobby } from "../types/lobby";
import { BaseGame } from "../types/types";

const getUserLobbyAndGameData = (socket: Socket): { lobby: Lobby | null; game: BaseGame | null } => {
  let lobby: Lobby | null = null,
    game = null;
  const lobbyId = userLobbyMap.get(socket.data.userId);
  if (lobbyId) {
    lobby = lobbiesMap.get(lobbyId) || null;
    if (lobby) {
      if (blackJackGamesMap.has(lobby.gameId as string)) {
        game = blackJackGamesMap.get(lobby.gameId as string) || null;
      } else if (pokerGamesMap.has(lobby.gameId as string)) {
        game = pokerGamesMap.get(lobby.gameId as string) || null;
      }
    }
  }
  return { lobby, game };
};

export const LobbyNotFoundError = (socket: Socket) => {
  const { lobby, game } = getUserLobbyAndGameData(socket);
  emitError(socket, ERROR_CONSTANTS.LOBBY_NOT_FOUND, { lobby, game });
};

export const GameNotFoundError = (socket: Socket) => {
  const { lobby, game } = getUserLobbyAndGameData(socket);
  emitError(socket, ERROR_CONSTANTS.GAME_NOT_FOUND, { lobby, game });
};

export const InvalidBetError = (socket: Socket) => {
  const { lobby, game } = getUserLobbyAndGameData(socket);
  emitError(socket, ERROR_CONSTANTS.GAME_INVALID_BET, { lobby, game });
};

export const InvalidGameActionError = (socket: Socket) => {
  const { lobby, game } = getUserLobbyAndGameData(socket);
  emitError(socket, ERROR_CONSTANTS.GAME_INVALID_ACTION, { lobby, game });
};
