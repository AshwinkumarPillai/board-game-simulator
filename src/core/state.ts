import { Socket } from "socket.io";
import { Lobby } from "../types/lobby";
import { BaseGamePlayer } from "../types/types";

// userId -> socket
export const userSockets = new Map<string, Socket>();

// userId -> {id, username, status}
export const userDataMap = new Map<string, BaseGamePlayer>();

// lobbyId -> Lobby instance
export const lobbiesMap = new Map<string, Lobby>();

// userId -> lobbyId
export const userLobbyMap = new Map<string, string>();
