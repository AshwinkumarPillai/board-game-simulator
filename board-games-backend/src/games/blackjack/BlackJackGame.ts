import { ServerStateManager } from "../../core/ServerStateManager";
import { lobbiesMap } from "../../core/state";
import { Card } from "../../types/card";
import { Deck } from "../../types/deck";
import { BaseGame } from "../../types/types";
import { BlackJackPlayer } from "./BlackJackPlayer";
import { BlackJackRoundResult } from "./types";

import { calculateHandValue } from "./util";

export class BlackJackGame extends BaseGame {
  // id: string, -> from Base Class
  // lobbyId: string; -> from Base Class
  players: BlackJackPlayer[] = [];
  dealerHand: Card[] = [];
  playerMap: Map<string, BlackJackPlayer> = new Map();
  deck: Deck;
  round: number = 1;
  maxRounds: number = 6;
  minBet: number = 4;
  currentPlayerIndex: number = 0;
  gameOver: boolean = false;
  results: BlackJackRoundResult[] = [];
  currentPhase: "betting" | "playing" | "roundOver" | "gameOver" = "betting";

  //   history: any[] = []; // TODO: I'll add this later

  constructor(playerInfos: { id: string; username: string }[], lobbyId: string, numDecks = 6) {
    super(lobbyId, "blackjack");

    this.deck = new Deck(numDecks);

    for (const { id, username } of playerInfos) {
      const player = new BlackJackPlayer(id, username);
      this.players.push(player);
      this.playerMap.set(id, player);
    }

    ServerStateManager.addBlackJackGameToServer(this);
  }

  // This is probably factory pattern - idk tho, will look at it later
  static create(
    playerInfos: { id: string; username: string }[],
    lobbyId: string,
    numDecks = 6
  ): BlackJackGame {
    const game = new BlackJackGame(playerInfos, lobbyId, numDecks);
    ServerStateManager.addBlackJackGameToServer(game);
    game.startBettingPhase();
    return game;
  }

  private updateMinBet() {
    this.minBet = 4 * 2 ** (this.round - 1);
  }

  private eliminateLowestIfNeeded() {
    if (this.round === 3) {
      const eligible = this.players.filter((p) => !p.isEliminated);
      if (eligible.length > 1) {
        let min = Math.min(...eligible.map((p) => p.points));
        let toEliminate = eligible.find((p) => p.points === min);
        if (toEliminate) toEliminate.isEliminated = true;
      }
    }
  }

  startBettingPhase() {
    this.updateMinBet();
    this.dealerHand = [];
    for (const player of this.players) {
      player.resetForNewRound();
      if (!player.isEliminated && player.points < this.minBet) {
        player.isEliminated = true;
      }
    }

    // If the initial players are eliminated then move to the first non-eliminated player
    while (this.players[this.currentPlayerIndex]?.isEliminated) this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.players?.length) this.checkGameOver();
  }

  placeBet(playerId: string, amount: number): boolean {
    if (this.currentPhase !== "betting") return false;
    const player = this.playerMap.get(playerId);
    if (!player || player.isEliminated) return false;
    if (!player.placeBet(amount, this.minBet)) return false;
    this.moveToNextPlayer();
    return true;
  }

  dealCards() {
    for (let player of this.getActivePlayers()) {
      player.receiveCard(this.deck.draw()!);
      player.receiveCard(this.deck.draw()!);
    }

    this.dealerHand = [this.deck.draw()!, this.deck.draw()!];
  }

  getActivePlayers(): BlackJackPlayer[] {
    return this.players.filter((p) => !p.isEliminated && p.currentBet > 0);
  }

  getRemainingPlayers(): BlackJackPlayer[] {
    return this.players.filter((p) => !p.isEliminated);
  }

  setCurrentPlayer() {
    this.currentPlayerIndex = 0;
    while (
      this.players[this.currentPlayerIndex]?.isEliminated ||
      this.players[this.currentPlayerIndex]?.isBusted ||
      this.players[this.currentPlayerIndex]?.isStanding
    ) {
      this.currentPlayerIndex++;
    }
    if (this.currentPlayerIndex >= this.players.length) this.goToNextRound();
  }

  moveToNextPlayer() {
    do {
      this.currentPlayerIndex++;

      // Round ended: All Players got their turn in this round
      if (this.currentPlayerIndex >= this.players.length) {
        this.goToNextRound();
        return;
      }
    } while (
      this.currentPlayerIndex < this.players.length &&
      this.players[this.currentPlayerIndex].isEliminated
    );
  }

  goToNextRound() {
    this.currentPlayerIndex = 0;
    if (this.currentPhase === "betting") {
      this.currentPhase = "playing";
      this.dealCards();
      for (const player of this.players) {
        if (player.hasBlackjack()) player.isStanding = true;
      }
      this.setCurrentPlayer();
      return;
    }
    if (this.currentPhase === "playing") {
      this.currentPhase = "roundOver";
      this.executeDealerTurn(); // After players finish, let the dealer complete their turn
      this.resolveResults(); // Check the result after dealer is done
      return;
    }
    // Check if the game should be over
    if (this.checkGameOver()) {
      if (this.gameOver) {
        // Display final results
        console.log("Game Over! Results:");
        for (const player of this.players) {
          console.log(`${player.username}: ${player.points} points`);
        }
      }
      return;
    }
    this.round++; // Move to next round after the results are resolved
    // this.eliminateLowestIfNeeded();
    this.currentPhase = "betting";
    this.startBettingPhase();
  }

  playerAction(playerId: string, action: "hit" | "stand" | "double"): boolean {
    if (this.currentPhase !== "playing") return false;
    const player = this.playerMap.get(playerId);
    if (!player || player.isStanding || player.isBusted || player.isEliminated) return false;

    // Check if it's the player's turn
    if (this.players[this.currentPlayerIndex].id !== playerId) return false;

    switch (action) {
      case "hit":
        player.receiveCard(this.deck.draw()!);
        if (player.hasBlackjack() || calculateHandValue(player.hand) === 21) {
          player.isStanding = true;
        } else if (player.isBust()) {
          player.isBusted = true;
        }
        break;

      case "stand":
        player.isStanding = true;
        break;

      case "double":
        if (player.points >= player.currentBet) {
          player.points -= player.currentBet;
          player.currentBet *= 2;
          player.receiveCard(this.deck.draw()!);
          player.isStanding = true;
          if (player.isBust()) player.isBusted = true;
        }
        break;
    }

    // If player is done, move to next
    if (player.isStanding || player.isBusted) {
      this.moveToNextPlayer();
    }
    return true;
  }

  executeDealerTurn() {
    while (calculateHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.draw()!);
    }
  }

  resolveResults() {
    const dealerTotal = calculateHandValue(this.dealerHand);
    const dealerBusted = dealerTotal > 21;

    const currentResult: BlackJackRoundResult = {
      round: this.round,
      players: [],
    };

    this.players.forEach((player) => {
      currentResult.players.push({
        id: player.id,
        roundPoints: 0,
      });
    });

    // Calculate results for each player
    for (let player of this.players) {
      if (player.isEliminated || player.currentBet === 0) continue;

      const playerTotal = calculateHandValue(player.hand);
      const bet = player.currentBet;
      const playerResult = currentResult.players.find((p) => p.id === player.id);
      if (!playerResult) continue;

      // If player busted → loses bet (already deducted when bet placed)
      if (player.isBusted) {
        playerResult.roundPoints = -bet;
        continue;
      }

      // Blackjack bonus (only if initial hand of 2 cards was 21)
      if (player.hasBlackjack() && player.hand.length === 2) {
        if (dealerTotal === 21 && this.dealerHand.length === 2) {
          // Both have blackjack – tie
          player.points += bet;
          playerResult.roundPoints = 0;
        } else {
          // 3:2 payout
          // 3:2 payout for blackjack
          const winnings = bet * 1.5;
          player.points += bet + winnings;
          playerResult.roundPoints = winnings;
        }
        continue;
      }

      if (dealerBusted || playerTotal > dealerTotal) {
        // Dealer busts – player wins
        player.points += bet * 2;
        playerResult.roundPoints = bet;
      } else if (playerTotal === dealerTotal) {
        // Tie → refund
        player.points += bet;
        playerResult.roundPoints = 0;
      } else {
        // Player loses – bet already deducted
        playerResult.roundPoints = -bet;
        continue;
      }
    }
    this.results.push(currentResult);
  }

  private checkGameOver(): boolean {
    if (this.round === this.maxRounds || this.getRemainingPlayers().length === 0) {
      this.gameOver = true;
      this.currentPhase = "gameOver";
      lobbiesMap.get(this.lobbyId)!.gameStatus = "finished";
      return true;
    }
    return false;
  }
}
