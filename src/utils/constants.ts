import { GameType } from "../types/types";

export const INITIAL_PLAYER_POINTS = 100;
export const GAME_MAX_PLAYER_LIMIT = 6;

export const validGames: GameType[] = ["blackjack", "poker"];

export const ERROR_CONSTANTS = {
  LOBBY_FULL: "Lobby is full",
  LOBBY_NOT_FOUND: "Lobby not found",
  LOBBY_EXISTS: "You are already part of a lobby",
  MISSING_PAYLOAD: "Missing Payload in socket request",
  INVALID_GAME_TYPE: "Invalid game type",
};
