import { Socket } from "socket.io";
import { lobbiesMap, userDataMap, userLobbyMap, userSockets } from "./state";
import { BaseGamePlayer } from "../types/types";
import { Lobby } from "../types/lobby";
import { ERROR_CONSTANTS } from "../utils/constants";
import chalk from "chalk";

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

  static printSummary() {
    console.log("");
    console.log(chalk.gray("—".repeat(100)));
    console.log(chalk.bold.cyan("Server Summary:"));
    console.log(chalk.gray("—".repeat(100)));

    console.log(chalk.green(`Active Users: ${userSockets.size}`));
    console.log(chalk.yellow(`Active Lobbies: ${lobbiesMap.size}`));

    for (const [lobbyId, lobby] of lobbiesMap.entries()) {
      console.log(
        chalk.blue(`   - ${lobbyId}`) +
          chalk.magenta(` [${lobby.gameType}] `) +
          chalk.white(`${lobby.players.length}/${lobby.maxPlayerLimit}`) +
          chalk.gray(` | spectators: ${lobby.spectators.length}`) +
          chalk.gray(` | players: [ ${lobby.players.map((p) => p.username).join(", ")} ]`)
      );
    }

    console.log(chalk.gray("—".repeat(100)));
    console.log("");
  }
}
