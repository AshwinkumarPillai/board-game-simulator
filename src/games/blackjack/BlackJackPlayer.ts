import { Card } from "../../types/card";
import { BaseGamePlayer } from "../../types/types";
import { calculateHandValue } from "./util";

export class BlackJackPlayer extends BaseGamePlayer {
  hand: Card[] = [];
  points: number = 200;
  currentBet: number = 0;
  isStanding: boolean = false;
  isBusted: boolean = false;
  isEliminated: boolean = false;

  constructor(id: string, username: string) {
    super(id, username);
  }

  resetForNewRound() {
    this.hand = [];
    this.currentBet = 0;
    this.isStanding = false;
    this.isBusted = false;
  }

  placeBet(amount: number, minBet: number): boolean {
    if (amount >= minBet && amount <= this.points) {
      this.currentBet = amount;
      this.points -= amount;
      return true;
    }
    return false;
  }

  receiveCard(card: Card) {
    this.hand.push(card);
  }

  hasBlackjack(): boolean {
    return this.hand.length === 2 && calculateHandValue(this.hand) === 21;
  }

  isBust(): boolean {
    return calculateHandValue(this.hand) > 21;
  }

  // I will keep this here but I don't want split as a player action for now
  canSplit(): boolean {
    return this.hand.length === 2 && this.hand[0].value === this.hand[1].value;
  }
}
