import { emit } from "node:process";
import { ServerStateManager } from "../core/ServerStateManager";
import { userDataMap, userSockets } from "../core/state";
import { ERROR_CONSTANTS, GAME_MAX_PLAYER_LIMIT } from "../utils/constants";
import { BaseGamePlayer, GameStatus, GameType, Spectator } from "./types";
import { emitError } from "../utils/socket.utils";

export class Lobby {
  id: string;
  ownerId: string;
  players: BaseGamePlayer[];
  spectators: Spectator[];
  maxPlayerLimit: number;
  gameType: GameType;
  createdAt: number;
  gameStatus: GameStatus;

  constructor(player: BaseGamePlayer, gameType: GameType, maxPlayerLimit: number) {
    this.id = `lobby-${Date.now()}`;
    this.ownerId = player.id;
    this.players = [player];
    this.spectators = [];
    this.maxPlayerLimit = Math.min(maxPlayerLimit, GAME_MAX_PLAYER_LIMIT);
    this.gameType = gameType;
    this.createdAt = Date.now();
    this.gameStatus = "lobby";

    ServerStateManager.addLobbyToServer(this, player);
    ServerStateManager.addPlayerToLobby(player, this.id);
  }

  addPlayer(player: BaseGamePlayer) {
    if (this.gameStatus === "lobby") {
      if (this.isFull()) {
        emitError(userSockets.get(player.id)!, ERROR_CONSTANTS.LOBBY_FULL);
        return;
      }

      if (this.players.find((p) => p.id === player.id)) return;
      this.players.push(player);
      ServerStateManager.addPlayerToLobby(player, this.id);
    } else {
      if (this.players.find((p) => p.id === player.id)) {
        this.setPlayerStatusInLobby(player.id, "active");
        console.log(`Player ${player.username} joined lobby ${this.id} - [${this.gameType}]`);
      } else {
        this.addSpectator(player);
        ServerStateManager.addPlayerToLobby(player, this.id);
      }
    }
  }

  removePlayer(playerId: string) {
    if (this.gameStatus === "lobby") {
      this.players = this.players.filter((p) => p.id !== playerId);
      ServerStateManager.removePlayerFromLobbyMap(userDataMap.get(playerId)!);
    } else {
      if (this.players.find((p) => p.id === playerId)) {
        this.setPlayerStatusInLobby(playerId, "inactive");
        console.log(`Player ${playerId} left lobby ${this.id} - [${this.gameType}]`);
      } else {
        this.removeSpectator(playerId);
        ServerStateManager.removePlayerFromLobbyMap(userDataMap.get(playerId)!);
      }
    }

    if (this.players.length === 0) {
      ServerStateManager.removeLobbyFromServer(this.id);
    }
  }

  isFull(): boolean {
    return this.players.length >= this.maxPlayerLimit;
  }

  setPlayerStatusInLobby(playerId: string, status: "active" | "inactive") {
    this.players = this.players.map((p) => {
      if (p.id === playerId) return { ...p, status };
      return p;
    });
  }

  addSpectator(spectator: Spectator) {
    if (this.spectators.find((s) => s.id === spectator.id)) return;
    this.spectators.push(spectator);
  }

  removeSpectator(id: string) {
    this.spectators = this.spectators.filter((s) => s.id !== id);
  }
}
