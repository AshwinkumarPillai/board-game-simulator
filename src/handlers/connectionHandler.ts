import { JwtPayload } from "jsonwebtoken";
import { Socket, ExtendedError } from "socket.io";
import { verifyJWTToken } from "../utils/jwt";

export const handleAuthentication = (
  socket: Socket,
  userSockets: Map<string, Socket>,
  next: (err?: ExtendedError) => void
) => {
  const token: string = Array.isArray(socket.handshake.headers.access_token)
    ? socket.handshake.headers.access_token[0]
    : socket.handshake.headers.access_token || "";

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded: JwtPayload | null = verifyJWTToken(token);

    if (!decoded || !decoded.id) {
      return next(new Error("Authentication error: Invalid token payload"));
    }

    socket.data.userId = decoded.id;
    userSockets.set(decoded.id, socket); // Store the user in the map
    console.log(`User connected [USER ID] -> [SOCKET ID]: ${decoded.id} -> ${socket.id}`);

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return next(new Error("Authentication error: Invalid token"));
  }
};

export const handleDisconnection = (socket: Socket, userSockets: Map<string, Socket>) => {
  const userId = socket.data.userId;
  if (userId && userSockets.has(userId)) {
    userSockets.delete(userId);
    console.log(`User disconnected: ${userId}`);
  }
};
