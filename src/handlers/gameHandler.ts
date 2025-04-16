import { Socket } from "socket.io";
import {
  blackJackBetPayload,
  blackJackNextRoundStartPayload,
  blackJackPlayerActionPayload,
} from "../types/types";
import { moveToNextRound, performPlayerAction, placeBet } from "../games/blackjack/handlerFunctions";

export const handleBlackJackEvents = (socket: Socket) => {
  // Place a bet
  socket.on("blackjack:makeBet", (data: blackJackBetPayload) => placeBet(socket, data.gameId, data.bet));
  // Any Player Action (we have a common function to handle those in BlackJackGame class -> playerAction())
  socket.on("blackjack:playerAction", (data: blackJackPlayerActionPayload) =>
    performPlayerAction(socket, data.gameId, data.action)
  );

  socket.on("blackjack:moveToNextRound", (data: blackJackNextRoundStartPayload) =>
    moveToNextRound(socket, data.gameId)
  );
};
