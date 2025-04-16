import { Socket } from "socket.io";
import { BlackJackGame } from "./BlackJackGame";
import { blackJackGamesMap, lobbiesMap } from "../../core/state";
import { GameNotFoundError, InvalidBetError, InvalidGameActionError } from "../../errors/socket.errors";
import { blackJackPlayerActionPayload } from "../../types/types";

const gameUpdateHelper = (
  socket: Socket,
  game: BlackJackGame,
  socketMessageType: string,
  message: string = ""
) => {
  // I don't want to send the Deck to frontend, that info stays with the server
  socket.emit(socketMessageType, {
    message,
    // game: { ...game, deck: game.deck.cardsRemaining() }, // Will look into this later
    game,
    lobby: lobbiesMap.get(game.lobbyId),
  });

  socket.to(game.lobbyId).emit("blackjack:gameUpdated", {
    // game: { ...game, deck: game.deck.cardsRemaining() },
    game,
    lobby: lobbiesMap.get(game.lobbyId),
    message,
  });
};

const placeBet = (socket: Socket, gameId: string, betAmount: number) => {
  try {
    const game = blackJackGamesMap.get(gameId);
    if (!game) {
      GameNotFoundError(socket);
      return;
    }

    if (game instanceof BlackJackGame) {
      if (game.placeBet(socket.data.userId, betAmount)) {
        gameUpdateHelper(socket, game, "blackjack:betPlaced", "Bet placed successfully");
      } else {
        InvalidBetError(socket);
        return;
      }
    }
  } catch (error: Error | any) {
    console.error(error);
    socket.emit("data_error", { message: error.message });
  }
};

const performPlayerAction = (
  socket: Socket,
  gameId: string,
  action: blackJackPlayerActionPayload["action"]
) => {
  try {
    const game = blackJackGamesMap.get(gameId);
    if (!game) {
      GameNotFoundError(socket);
      return;
    }

    if (game instanceof BlackJackGame) {
      if (game.playerAction(socket.data.userId, action)) {
        gameUpdateHelper(socket, game, "blackjack:playerActionDone", "Player action performed successfully");
      } else {
        InvalidGameActionError(socket);
        return;
      }
    }
  } catch (error: Error | any) {
    console.error(error);
    socket.emit("data_error", { message: error.message });
  }
};

const moveToNextRound = (socket: Socket, gameId: string) => {
  try {
    const game = blackJackGamesMap.get(gameId);
    if (!game) {
      GameNotFoundError(socket);
      return;
    }

    if (game.currentPhase !== "roundOver") return;

    if (game instanceof BlackJackGame) {
      game.goToNextRound(); // Move to next round
      gameUpdateHelper(socket, game, "blackjack:gameUpdated", "Round over, moving to next round");
    }
  } catch (error: Error | any) {
    console.error(error);
    socket.emit("data_error", { message: error.message });
  }
};

export { placeBet, performPlayerAction, moveToNextRound };
