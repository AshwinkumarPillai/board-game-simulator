import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export interface Route {
  (req: Request, res: Response): void;
}

export type GameType = "blackjack" | "poker";
export type GameStatus = "lobby" | "in-progress" | "finished";

export interface Spectator {
  id: string;
  username: string;
}

export abstract class BaseGamePlayer {
  id: string;
  username: string;
  status: "active" | "inactive";

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
    this.status = "active";
  }
}

export abstract class BaseGame {
  id: string;
  name: string;
  lobbyId: string;

  constructor(lobbyId: string, name: string) {
    this.id = `game-${uuidv4()}`;
    this.lobbyId = lobbyId;
    this.name = name;
  }

  // abstract startGame(): void;
  // abstract handlePlayerAction(playerId: string, action: any): void;
  // abstract getGameState(): object;
}

// All Socket payload interfaces

// Lobby Payload Interfaces
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

export interface startLobbyGamePayload {
  lobbyId: string;
}

// Black Jack Socket Payload Interfaces
export interface blackJackBetPayload {
  gameId: string;
  bet: number;
}

export interface blackJackPlayerActionPayload {
  gameId: string;
  action: "hit" | "stand" | "double";
}

export interface blackJackNextRoundStartPayload {
  gameId: string;
}
