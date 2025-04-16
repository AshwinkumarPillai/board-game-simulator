"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { initializeSocket, disconnectSocket } from "@/lib/socket";
import { useUser } from "./UserContext";
import { Socket } from "socket.io-client";
import { getCookie } from "cookies-next";
import {
  blackJackBet,
  BlackJackGame,
  blackJackNextRoundStartPayload,
  blackJackPlayerAction,
  createLobbyPayload,
  Game,
  joinLobbyPayload,
  leaveLobbyPayload,
  Lobby,
  socketDataError,
  startLobbyGamePayload,
} from "@/types/types";
import { useLobby } from "./LobbyContext";
import { ERROR_CONSTANTS } from "@/utils/constants";
import { useRouter } from "next/navigation";

type SocketContextType = {
  socket: Socket | null;
  createLobby: (payload: createLobbyPayload) => void;
  joinLobby: (payload: joinLobbyPayload) => void;
  leaveLobby: (payload: leaveLobbyPayload) => void;
  startLobbyGame: (payload: startLobbyGamePayload) => void;
  checkIfUserIsInAnyLobby: (isLobbyCreationPage?: boolean) => void;
  placeBet: (payload: blackJackBet) => void;
  performPlayerAction: (payload: blackJackPlayerAction) => void;
  blackJackStartNextRound: (payload: blackJackNextRoundStartPayload) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  createLobby: () => {},
  joinLobby: () => {},
  leaveLobby: () => {},
  startLobbyGame: () => {},
  checkIfUserIsInAnyLobby: () => {},
  placeBet: () => {},
  performPlayerAction: () => {},
  blackJackStartNextRound: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData, logout } = useUser();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const { lobbyData, setLobbyData, setBlackJackGameData } = useLobby();

  const isLobbyCreation = useRef(false);

  const router = useRouter();

  const connectSocket = () => {
    const token = getCookie("token") as string;

    if (userData && token) {
      const socket = initializeSocket(token);
      setSocketInstance(socket);

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        if (err.message === ERROR_CONSTANTS.INVALID_TOKEN) {
          alert("Session Expired. Please Login Again.");
          logout();
        }
      });

      // Server -> Client event listeners
      socket.on("lobbyCreated", (data) => LobbyCreated(data));
      socket.on("lobbyUpdate", (data) => LobbyUpdated(data));
      socket.on("lobbyJoined", (data) => LobbyJoined(data));
      socket.on("lobbyLeft", (data) => LobbyLeft(data));
      socket.on("lobbyGameStarted", (data) => lobbyGameStarted(data));
      socket.on("validLobby", (data) => setLobbyData(data.lobby));
      socket.on("invalidLobby", () => {
        setLobbyData(null);
      });
      socket.on("userIsInLobby", (data) => userIsInLobby(data));
      socket.on("blackjack:betPlaced", (data) => blackjackBetPlaced(data));
      socket.on("blackjack:playerActionDone", (data) => blackjackPlayerActionDone(data));
      socket.on("blackjack:gameUpdated", (data) => blackjackGameUpdated(data));
      // Custom Error Handler
      socket.on("data_error", (data) => handleDataError(data));
    }
  };

  // Client -> Server Events
  // Lobby Events
  const createLobby = (payload: createLobbyPayload) => {
    if (socketInstance) {
      socketInstance.emit("createLobby", payload);
    }
  };

  const joinLobby = (payload: joinLobbyPayload) => {
    if (socketInstance) {
      socketInstance.emit("joinLobby", payload);
    }
  };

  const leaveLobby = (payload: leaveLobbyPayload) => {
    if (socketInstance) {
      socketInstance.emit("leaveLobby", payload);
    }
  };

  const checkCurrentLobby = (lobbyId?: string) => {
    if (socketInstance) {
      socketInstance.emit("checkCurrentLobby", { lobbyId: lobbyId || lobbyData?.id });
    }
  };

  const startLobbyGame = (payload: startLobbyGamePayload) => {
    if (socketInstance) {
      socketInstance.emit("startLobbyGame", payload);
    }
  };

  const checkIfUserIsInAnyLobby = (isLobbyCreationPage?: boolean) => {
    if (isLobbyCreationPage) {
      isLobbyCreation.current = true;
    }
    if (socketInstance) {
      socketInstance.emit("checkIfUserIsInAnyLobby");
    }
  };

  // Game Events
  const placeBet = (payload: blackJackBet) => {
    if (socketInstance) {
      socketInstance.emit("blackjack:makeBet", payload);
    }
  };

  const performPlayerAction = (payload: blackJackPlayerAction) => {
    if (socketInstance) {
      socketInstance.emit("blackjack:playerAction", payload);
    }
  };

  const blackJackStartNextRound = (payload: blackJackNextRoundStartPayload) => {
    if (socketInstance) {
      socketInstance.emit("blackjack:moveToNextRound", payload);
    }
  };

  // Server -> Client event listeners
  const LobbyCreated = (data: { lobby: Lobby }) => {
    setLobbyData(data.lobby);
  };

  const LobbyUpdated = (data: { lobby: Lobby; game: BlackJackGame }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const LobbyJoined = (data: { lobby: Lobby; game: BlackJackGame }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const LobbyLeft = (data: { lobby: Lobby; message: string }) => {
    alert(data.message);
    setLobbyData(null);
    router.push("/");
  };

  const lobbyGameStarted = (data: { lobby: Lobby; game: BlackJackGame }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const userIsInLobby = (data: { lobby: Lobby; game: BlackJackGame }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  // BlackJack Events
  const blackjackBetPlaced = (data: { game: Game; lobby: Lobby; message: string }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const blackjackPlayerActionDone = (data: { game: Game; lobby: Lobby; message: string }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const blackjackGameUpdated = (data: { game: Game; lobby: Lobby; message: string }) => {
    handleLobbyAndOrGameExists(data.lobby, data.game);
  };

  const handleDataError = (errorObj: socketDataError) => {
    console.log(errorObj.message);

    if (errorObj.message === ERROR_CONSTANTS.LOBBY_NOT_FOUND) {
      alert(errorObj.message);
      handleLobbyAndOrGameExists(errorObj.payload?.lobby as Lobby, errorObj.payload?.game as Game);
    } else if (
      errorObj.message === ERROR_CONSTANTS.GAME_ALREADY_STARTED ||
      errorObj.message === ERROR_CONSTANTS.LOBBY_EXISTS ||
      errorObj.message === ERROR_CONSTANTS.GAME_NOT_FOUND ||
      errorObj.message === ERROR_CONSTANTS.GAME_INVALID_BET ||
      errorObj.message === ERROR_CONSTANTS.GAME_INVALID_ACTION
    ) {
      if (errorObj.payload?.game) {
        handleLobbyAndOrGameExists(errorObj.payload?.lobby as Lobby, errorObj.payload?.game as Game);
      }
    } else if (errorObj.message === ERROR_CONSTANTS.LOBBY_FULL) {
      alert(errorObj.message);
      router.push("/");
    } else {
      checkCurrentLobby();
    }
  };

  // ERROR HANDLING
  // This is the helper function that will set Lobby and Game, so all other functions must use this for the mentioned action
  const handleLobbyAndOrGameExists = (lobby: Lobby, game: Game) => {
    setLobbyData(lobby);

    if (!lobby || lobby.players.length === 0) {
      // This is specifically to not redirect if lobby doesn't exist and the user is in the lobby creation page
      if (isLobbyCreation.current) return;
      // In all other pages -> redirect
      router.push("/");
      return;
    }
    if (game) {
      if (game.name === "blackjack") {
        setBlackJackGameData(game);
        router.push(`/blackjack/game/${game.id}`);
        return;
      }
    } else router.push(`/blackjack/${lobby.id}`);
  };

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [userData]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        createLobby,
        joinLobby,
        leaveLobby,
        startLobbyGame,
        checkIfUserIsInAnyLobby,
        placeBet,
        performPlayerAction,
        blackJackStartNextRound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
