import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_TOKEN_EXPIRATION = "30d";

export const generateToken = (userId: string, username: string) => {
  return jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: JWT_TOKEN_EXPIRATION });
};

export const verifyJWTToken = (token: string): JwtPayload | null => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment.");
  }

  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
