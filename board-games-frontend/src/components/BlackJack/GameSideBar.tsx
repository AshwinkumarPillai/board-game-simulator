"use client";
import { useLobby } from "@/context/LobbyContext";
import { useUser } from "@/context/UserContext";
import { BlackJackGame } from "@/types/types";
import React, { useState } from "react";

interface GameSideBarProps {
  blackJackGameData: BlackJackGame;
}

const GameSideBar: React.FC<GameSideBarProps> = ({ blackJackGameData }) => {
  const { userData } = useUser();
  const { lobbyData } = useLobby();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}/blackjack/${blackJackGameData.lobbyId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 text-white p-6 h-full overflow-y-auto shadow-lg">
      {/* Copy Lobby Link */}
      <h2 className="font-bold text-xl mb-4 text-center">Share Game</h2>
      <div className="flex items-center gap-2 mb-6 justify-center">
        <input
          type="text"
          value={`${window.location.origin}/blackjack/${blackJackGameData.lobbyId}`}
          readOnly
          className="border px-4 py-2 rounded-lg w-full max-w-md text-sm text-white bg-gray-700"
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${
            copied ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          } transition-transform transform hover:-translate-y-1`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Game Info */}
      <div className="mb-8 text-center bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-2 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white">Blackjack Game</h2>
        <p className="text-xl font-bold text-yellow-400 mt-2">
          Round: {blackJackGameData.round} / {blackJackGameData.maxRounds}
        </p>
        <p className="text-lg text-gray-400 mt-1">
          Phase:{" "}
          {blackJackGameData.currentPhase.charAt(0).toUpperCase() + blackJackGameData.currentPhase.slice(1)}
        </p>
      </div>
      {/* Player Info */}
      <h3 className="text-xl font-bold mb-6 text-center">Players</h3>

      {/* Player List */}
      <div className="space-y-4">
        {blackJackGameData.players.map((player, index) => (
          <div
            key={player.id}
            className={`p-4 rounded-lg shadow-md ${
              index === blackJackGameData.currentPlayerIndex ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {/* Player Name */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{player.username}</span>
              {player.id === userData?.id && <span className="text-sm text-white font-bold">(You)</span>}
            </div>

            {/* Player Status */}
            <div className="text-sm space-x-2">
              {lobbyData && lobbyData.players.find((p) => p.id === player.id)?.status === "inactive" && (
                <span className="text-red-500 bg-white px-2 py-1 rounded-md font-bold">[INACTIVE]</span>
              )}
              {player.isEliminated && (
                <span className="text-red-500 bg-white px-2 py-1 rounded-md font-bold">[ELIMINATED]</span>
              )}
            </div>

            {/* Player Points and Bet */}
            <div className="mt-2 text-sm">
              <p>
                Points: <span className="font-semibold">{player.points}</span>
              </p>
              <p>
                Current Bet: <span className="font-semibold">{player.currentBet}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <br />

      <hr />

      {/* Current Player Info */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-2 text-pink-600">Current Player</h4>
        <p>
          {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.username || "N/A"}
          {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.id === userData?.id && (
            <span className="text-blue-300"> (You)</span>
          )}
        </p>
      </div>

      <br />
      <hr />
      {/* Spectators */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-2 text-amber-200">Spectators</h4>
        {lobbyData?.spectators?.map((spectator, index) => (
          <p key={"spectator-" + index}>
            {spectator?.username || "N/A"}
            {spectator?.id === userData?.id && <span className="text-blue-300"> (You)</span>}
          </p>
        ))}
      </div>
    </div>
  );
};

export default GameSideBar;
