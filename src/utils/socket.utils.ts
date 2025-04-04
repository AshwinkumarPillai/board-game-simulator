import { Socket } from "socket.io";

export const emitError = (socket: Socket, message: string, payload?: any) => {
  socket.emit("data_error", { message, payload });
};

// socket interface
export interface createLobbyPayload {
  maxPlayerLimit: number;
}

export interface joinLobbyPayload {
  lobbyId: string;
}

export interface leaveLobbyPayload {
  lobbyId: string;
}
