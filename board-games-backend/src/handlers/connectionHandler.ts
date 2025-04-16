import { JwtPayload } from "jsonwebtoken";
import { Socket, ExtendedError } from "socket.io";
import { verifyJWTToken } from "../utils/jwt";
import { ServerStateManager } from "../core/ServerStateManager";
import { userDataMap, userLobbyMap } from "../core/state";
import { leaveLobby } from "./lobbyHandler";
import { ERROR_CONSTANTS } from "../utils/constants";

export const handleAuthentication = (socket: Socket, next: (err?: ExtendedError) => void) => {
  const token: string = Array.isArray(socket.handshake.headers.access_token)
    ? socket.handshake.headers.access_token[0]
    : socket.handshake.headers.access_token || socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded: JwtPayload | null = verifyJWTToken(token);

    if (!decoded || !decoded.id) {
      return next(new Error(ERROR_CONSTANTS.INVALID_TOKEN));
    }

    socket.data.userId = decoded.id;
    socket.data.username = decoded.username;

    ServerStateManager.addUserToServer(
      { id: decoded.id, username: decoded.username, status: "active" },
      socket
    );

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return next(new Error(ERROR_CONSTANTS.INVALID_TOKEN));
  }
};

export const handleDisconnection = (socket: Socket, userSockets: Map<string, Socket>) => {
  const userId = socket.data.userId;
  if (userId && userSockets.has(userId)) {
    if (userLobbyMap.has(userId)) leaveLobby(socket, userLobbyMap.get(userId)!);
    ServerStateManager.removeUserFromServer(userDataMap.get(userId)!);
  }
};
