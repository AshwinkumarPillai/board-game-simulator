import { Request, Response } from "express";

export interface Route {
  (req: Request, res: Response): void;
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
}

export interface Player {
  id: string;
  holeCards: Card[];
  username: string;
  chips: number;
  bet: number;
  status: "active" | "folded" | "all-in";
}

export interface GameState {
  phase: "lobby" | "pre-flop" | "flop" | "turn" | "river" | "showdown";
  players: Player[];
  player_order: string[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  current_player: number;
  dealer: number;
  hostId: string;
}

export interface PlayerAction {
  type: "fold" | "check" | "call" | "raise" | "all-in";
  amount?: number; // Optional for actions like raise or all-in
}

export interface PlayerLobbyState {
  id: string;
  status: "active" | "inactive";
}

export interface Spectator {
  id: string;
  username: string;
}

export interface Lobby {
  id: string;
  players: PlayerLobbyState[];
  owner: string;
  gameState: GameState;
  maxPlayerLimit: number;
  spectators: Spectator[];
}
