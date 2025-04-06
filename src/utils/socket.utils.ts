import { Socket } from "socket.io";
import { GameType } from "../types/types";
import { ERROR_CONSTANTS } from "./constants";

export const emitError = (socket: Socket, message: string, payload?: any) => {
  socket.emit("data_error", { message, payload });
};

const isMissingPayload = (socket: Socket, payload: any, payloadName: string) => {
  if (payload === undefined || payload === null) {
    emitError(socket, ERROR_CONSTANTS.MISSING_PAYLOAD, { payload: payloadName });
    return true;
  }
  return false;
};

export const validatePayloads = (socket: Socket, payloads: Record<string, any>): boolean => {
  for (const [key, value] of Object.entries(payloads)) {
    if (isMissingPayload(socket, value, key)) return false;
  }
  return true;
};

// All Socket payload interfaces
export interface createLobbyPayload {
  maxPlayerLimit: number;
  game: GameType;
}

export interface joinLobbyPayload {
  lobbyId: string;
}

export interface leaveLobbyPayload {
  lobbyId: string;
}
