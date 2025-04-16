import { Card } from "./card";

export class Deck {
  private cards: Card[] = [];

  constructor(numDecks = 1) {
    this.initializeDeck(numDecks);
    this.shuffle();
  }

  private initializeDeck(numDecks: number) {
    const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
    const values: Card["value"][] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    // Since we have multiple decks in blackjack we can add all of them together and then shuffle
    // I looked up on reddit (people are so mean) and in blackjack usually 6-8 decks are merged together and shuffled
    // For other games like poker and rummy, we can have 1 deck.
    // This is an added feature for blackjack and other games that have multiple decks
    for (let i = 0; i < numDecks; i++) {
      for (const suit of suits) {
        for (const value of values) {
          this.cards.push({ suit, value });
        }
      }
    }
  }

  shuffle() {
    const { cards } = this;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  draw(): Card | undefined {
    const card = this.cards.pop();
    return card;
  }

  cardsRemaining(): number {
    return this.cards.length;
  }
}
