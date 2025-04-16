import { Socket } from "socket.io";
import {
  blackJackGamesMap,
  gameTypeMap,
  lobbiesMap,
  pokerGamesMap,
  userDataMap,
  userLobbyMap,
  userSockets,
} from "./state";
import { BaseGamePlayer } from "../types/types";
import { Lobby } from "../types/lobby";
import { ERROR_CONSTANTS } from "../utils/constants";
import chalk from "chalk";
import { BlackJackGame } from "../games/blackjack/BlackJackGame";

export class ServerStateManager {
  static addUserToServer(user: BaseGamePlayer, socket: Socket) {
    userSockets.set(user.id, socket);
    userDataMap.set(user.id, user);
    console.log(`[User Connected] [${user.id}]: ${user.username} via socket ${socket.id}`);
    this.printSummary();
  }

  static removeUserFromServer(user: BaseGamePlayer) {
    if (userSockets.has(user.id)) userSockets.delete(user.id);
    console.log(`[User Disconnected] [${user.id}]: ${user.username}`);
    this.printSummary();
  }

  static addLobbyToServer(lobby: Lobby, user: BaseGamePlayer) {
    lobbiesMap.set(lobby.id, lobby);
    console.log(`[Lobby Created] ${lobby.id} - ${lobby.gameType} by ${user.username}`);
    this.printSummary();
    return lobby;
  }

  static removeLobbyFromServer(lobbyId: string) {
    this.removeGameFromServer(lobbyId);
    lobbiesMap.delete(lobbyId);
    console.log(`[Lobby Deleted] ${lobbyId} - Empty`);
    this.printSummary();
  }

  static addPlayerToLobby(player: BaseGamePlayer, lobbyId: string) {
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) throw new Error(ERROR_CONSTANTS.LOBBY_NOT_FOUND);
    userLobbyMap.set(player.id, lobbyId);
    console.log(`[User Joined] ${player.username} to ${lobbyId}`);
    this.printSummary();
  }

  static removePlayerFromLobbyMap(player: BaseGamePlayer) {
    const lobbyId = userLobbyMap.get(player.id);
    if (!lobbyId) return;
    const lobby = lobbiesMap.get(lobbyId);
    if (!lobby) return;
    userLobbyMap.delete(player.id);
    console.log(`[User Left] ${player.username} from ${lobbyId}`);
    this.printSummary();
  }

  static removeGameFromServer(lobbyId: string) {
    const lobby = lobbiesMap.get(lobbyId);
    if (lobby) {
      switch (gameTypeMap.get(lobby.gameId as string)) {
        case "blackjack":
          blackJackGamesMap.delete(lobby.gameId as string);
          break;
        case "poker":
          pokerGamesMap.delete(lobby.gameId as string);
          break;
        default:
          break;
      }

      const game = blackJackGamesMap.get(lobby?.gameId as string);
      if (game) blackJackGamesMap.delete(game.id);
    }
  }

  static printSummary() {
    console.log("");
    console.log(chalk.gray("—".repeat(150)));
    console.log(chalk.bold.cyan("Server Summary:"));
    console.log(chalk.gray("—".repeat(150)));

    console.log(chalk.green(`Active Users: ${userSockets.size}`));
    console.log(chalk.yellow(`Active Lobbies: ${lobbiesMap.size}`));

    for (const [lobbyId, lobby] of lobbiesMap.entries()) {
      console.log(
        chalk.blue(`   - ${lobbyId}`) +
          chalk.magenta(` [${lobby.gameType}] `) +
          chalk.white(`${lobby.players.length}/${lobby.maxPlayerLimit}`) +
          chalk.gray(` | spectators: ${lobby.spectators.length}`) +
          chalk.blueBright(` | players: [ ${lobby.players.map((p) => p.username).join(", ")} ]`) +
          chalk.white(` | spectators: [ ${lobby.spectators.map((p) => p.username).join(", ")} ]`) +
          chalk.red(
            ` | InActive players: [ ${lobby.players
              .filter((p) => p.status === "inactive")
              .map((p) => p.username)
              .join(", ")} ]`
          )
      );
    }

    console.log(chalk.yellow(`Active Games: ${blackJackGamesMap.size + pokerGamesMap.size}`));
    if (blackJackGamesMap.size + pokerGamesMap.size === 0) {
      console.log(chalk.gray("—".repeat(150)));
      console.log("");
      return;
    }
    // Games Data Log
    console.log(chalk.bgCyan(` BlackJack Games: ${blackJackGamesMap.size}   `));
    for (const [gameId, game] of blackJackGamesMap.entries()) {
      console.log(chalk.blue(`   - ${gameId}`) + chalk.magenta(`  Game:  [${game.name}] `));
    }

    console.log(chalk.bgCyan(` Poker Games: ${pokerGamesMap.size}  `));
    for (const [gameId, game] of pokerGamesMap.entries()) {
      console.log(chalk.blue(`   - ${gameId}`) + chalk.magenta(`  Game:  [${game.name}] `));
    }
    console.log(chalk.gray("—".repeat(150)));
    console.log("");
  }

  static addBlackJackGameToServer(game: BlackJackGame) {
    blackJackGamesMap.set(game.id, game);
    gameTypeMap.set(game.id, "blackjack");
    console.log(`[Game Started] [${game.id}] - ${game.name} in lobby:  ${game.lobbyId}`);
    this.printSummary();
  }
}
