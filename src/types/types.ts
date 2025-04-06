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

export abstract class BaseGame<TPlayer extends BaseGamePlayer> {
  id: string;
  name: GameType;
  lobbyId: string;
  players: TPlayer[];
  phase: string;

  constructor(name: GameType, lobbyId: string) {
    this.id = `game-${uuidv4()}`;
    this.name = name;
    this.lobbyId = lobbyId;
    this.players = [];
    this.phase = "lobby";
  }

  abstract startGame(): void;
  abstract handlePlayerAction(playerId: string, action: any): void;
  abstract getGameState(): object;
}
