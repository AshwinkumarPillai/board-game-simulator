export type User = {
  id: string;
  username: string;
};

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
}

export interface Deck {
  cards: Card[];
}

export type Lobby = {
  id: string;
  ownerId: string;
  players: BaseGamePlayer[];
  spectators: Spectator[];
  maxPlayerLimit: number;
  gameType: GameType;
  createdAt: number;
  gameStatus: GameStatus;
  gameId: string | null;
};

export type BaseGamePlayer = {
  id: string;
  username: string;
  status: "active" | "inactive";
};

export type BaseGame = {
  id: string;
  name: string;
  lobbyId: string;
};

export interface BlackJackPlayer extends BaseGamePlayer {
  hand: Card[];
  points: number;
  currentBet: number;
  isStanding: boolean;
  isBusted: boolean;
  isEliminated: boolean;
}

export interface BlackJackRoundResult {
  round: number;
  players: BlackJackPlayerResult[];
}

export interface BlackJackPlayerResult {
  id: string;
  roundPoints: number;
}

export interface BlackJackGame extends BaseGame {
  players: BlackJackPlayer[];
  dealerHand: Card[];
  playerMap: Map<string, BlackJackPlayer>;
  deck: Deck;
  round: number;
  maxRounds: number;
  minBet: number;
  currentPlayerIndex: number;
  gameOver: boolean;
  results: BlackJackRoundResult[];
  currentPhase: "betting" | "playing" | "roundOver" | "gameOver";
  //   history: any[]; // TODO: I'll add this later
}

export type Spectator = {
  id: string;
  username: string;
};

export type GameType = "blackjack" | "poker";
export type Game = BlackJackGame | null; // TODO : Add other games
export type GameStatus = "lobby" | "in-progress" | "finished";

// Socket Payload Types

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

export interface socketDataError {
  message: string;
  payload?: any;
}

export interface blackJackBet {
  gameId: string;
  bet: number;
}

export interface blackJackPlayerAction {
  gameId: string;
  action: "hit" | "stand" | "double";
}

export interface blackJackNextRoundStartPayload {
  gameId: string;
}
