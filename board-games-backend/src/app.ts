import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { initializeSocket } from "./socket";
import authRoutes from "./routes/auth.routes";
import { Request, Response } from "express";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/ping", (req: Request, res: Response) => {
  console.log("Server Pinged");
  res.status(200).json("Ping");
});
app.use("/api/user", authRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

initializeSocket(io);

connectDB();

const PORT = process.env.PORT || 5002;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
