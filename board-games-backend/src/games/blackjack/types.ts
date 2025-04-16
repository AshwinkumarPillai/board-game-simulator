export interface BlackJackRoundResult {
  round: number;
  players: BlackJackPlayerResult[];
}

export interface BlackJackPlayerResult {
  id: string;
  roundPoints: number;
}
