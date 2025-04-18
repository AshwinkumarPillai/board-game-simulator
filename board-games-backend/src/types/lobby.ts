import { ServerStateManager } from "../core/ServerStateManager";
import { userDataMap, userLobbyMap } from "../core/state";
import { ERROR_CONSTANTS, GAME_MAX_PLAYER_LIMIT } from "../utils/constants";
import { BaseGamePlayer, GameStatus, GameType, Spectator } from "./types";
import { v4 as uuidv4 } from "uuid";
import { BlackJackGame } from "../games/blackjack/BlackJackGame";

export class Lobby {
  id: string;
  ownerId: string;
  players: BaseGamePlayer[];
  spectators: Spectator[];
  maxPlayerLimit: number;
  gameType: GameType;
  createdAt: number;
  gameStatus: GameStatus;
  gameId: string | null = null;

  constructor(player: BaseGamePlayer, gameType: GameType, maxPlayerLimit: number) {
    this.id = `lobby-${uuidv4()}`;
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

  createGameInstance(params: any[]) {
    if (this.gameType === "blackjack") {
      const game = BlackJackGame.create(
        this.players.map((p) => ({ id: p.id, username: p.username })),
        this.id,
        params[0] // numDecks
      );
      return game;
    }
  }

  // This is not a good way because each game will have different starting parameters (but for now this will do (sigh!))
  startGame(numDecks = 6) {
    this.gameStatus = "in-progress";
    const game = this.createGameInstance([numDecks]);
    if (game) this.gameId = game.id;
    return game;
  }

  addPlayer(player: BaseGamePlayer) {
    if (this.gameStatus === "lobby") {
      if (userLobbyMap.has(player.id) && userLobbyMap.get(player.id) === this.id) return;
      if (this.isFull()) throw new Error(ERROR_CONSTANTS.LOBBY_FULL);

      if (this.players.find((p) => p.id === player.id)) return;
      this.players.push(player);
      ServerStateManager.addPlayerToLobby(player, this.id);
    } else {
      if (this.players.find((p) => p.id === player.id)) {
        this.setPlayerStatusInLobby(player.id, "active");
        console.log(`Player ${player.username} re-joined game ${this.id} - [${this.gameType}]`);
        ServerStateManager.printSummary();
      } else {
        this.addSpectator(player);
        ServerStateManager.addPlayerToLobby(player, this.id);
      }
    }
  }

  removePlayer(playerId: string) {
    if (this.gameStatus === "lobby" || this.gameStatus === "finished") {
      this.players = this.players.filter((p) => p.id !== playerId);
      ServerStateManager.removePlayerFromLobbyMap(userDataMap.get(playerId)!);
    } else {
      if (this.players.find((p) => p.id === playerId)) {
        this.setPlayerStatusInLobby(playerId, "inactive");
        console.log(`Player ${playerId} left the game ${this.id} - [${this.gameType}]`);
        ServerStateManager.printSummary();
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
      if (p.id === playerId) {
        userDataMap.get(playerId)!.status = status;
        return { ...p, status };
      }
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
