import { Socket } from "socket.io";
import { Lobby } from "../types/lobby";
import { BaseGame, BaseGamePlayer, GameType } from "../types/types";
import { BlackJackGame } from "../games/blackjack/BlackJackGame";

// userId -> socket
export const userSockets = new Map<string, Socket>();

// userId -> {id, username, status}
export const userDataMap = new Map<string, BaseGamePlayer>();

// lobbyId -> Lobby instance
export const lobbiesMap = new Map<string, Lobby>();

// userId -> lobbyId
export const userLobbyMap = new Map<string, string>();

// gameId -> gameType (blackjack, poker, etc.)
export const gameTypeMap = new Map<string, GameType>();

// gameId -> Game instance
export const blackJackGamesMap = new Map<string, BlackJackGame>();
export const pokerGamesMap = new Map<string, BaseGame>();
