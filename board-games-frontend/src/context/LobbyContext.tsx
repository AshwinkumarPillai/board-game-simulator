"use client";
import React, { createContext, useState, useContext } from "react";
import { BlackJackGame, Lobby } from "@/types/types";

type LobbyContextType = {
  lobbyData: Lobby | null;
  setLobbyData: React.Dispatch<React.SetStateAction<Lobby | null>>;
  blackJackGameData: BlackJackGame | null;
  setBlackJackGameData: React.Dispatch<React.SetStateAction<BlackJackGame | null>>;
};

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyProvider = ({ children }: { children: React.ReactNode }) => {
  const [lobbyData, setLobbyData] = useState<Lobby | null>(null);
  const [blackJackGameData, setBlackJackGameData] = useState<BlackJackGame | null>(null);

  return (
    <LobbyContext.Provider value={{ lobbyData, setLobbyData, blackJackGameData, setBlackJackGameData }}>
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobby = () => {
  const context = useContext(LobbyContext);
  if (!context) throw new Error("useLobby must be used within LobbyProvider");
  return context;
};
