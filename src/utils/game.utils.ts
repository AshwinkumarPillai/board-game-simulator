import { GameState } from "./types";

const createInitialGameState = (userId: string): GameState => {
  const gameState: GameState = {
    phase: "lobby",
    players: [],
    player_order: [],
    communityCards: [],
    pot: 0,
    currentBet: 0,
    current_player: 0,
    dealer: 0,
    hostId: userId,
  };
  return gameState;
};

export { createInitialGameState };
