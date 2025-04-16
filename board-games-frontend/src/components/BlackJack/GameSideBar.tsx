"use client";
import { useLobby } from "@/context/LobbyContext";
import { useUser } from "@/context/UserContext";
import { BlackJackGame } from "@/types/types";
import React from "react";

interface GameSideBarProps {
  blackJackGameData: BlackJackGame;
}

const GameSideBar: React.FC<GameSideBarProps> = ({ blackJackGameData }) => {
  const { userData } = useUser();
  const { lobbyData } = useLobby();

  return (
    <div className="bg-gray-800 text-white p-6 h-full overflow-y-auto shadow-lg">
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
        <h4 className="text-lg font-semibold mb-2">Current Player</h4>
        <p>
          {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.username || "N/A"}
          {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.id === userData?.id && (
            <span className="text-blue-300"> (You)</span>
          )}
        </p>
      </div>
    </div>
    // <div className="w-1/4 p-6 bg-gray-800 h-full">
    //   <h3 className="text-xl font-semibold mb-4">Players</h3>
    //   {blackJackGameData.players.map((player, index) => (
    //     <div
    //       key={player.id}
    //       className={`mb-4 p-4 rounded-md border ${
    //         index === blackJackGameData.currentPlayerIndex ? "bg-green-600" : "bg-gray-700"
    //       } border-gray-500`}
    //     >
    //       <div className="font-bold">
    //         {player.username}{" "}
    //         {player.id === userData?.id && (
    //           <span>
    //             {" "}
    //             | <strong>(You)</strong>
    //           </span>
    //         )}
    //         {lobbyData && lobbyData.players.find((p) => p.id === player.id)?.status === "inactive" && (
    //           <span className="text-red-500 bg-white px-3 py-1">
    //             <strong>[INACTIVE]</strong>
    //           </span>
    //         )}
    //         {player.isEliminated && (
    //           <span className="text-red-500 bg-white px-3 py-1">
    //             <strong>[ELIMINATED]</strong>
    //           </span>
    //         )}
    //       </div>
    //       <div>Points: {player.points}</div>
    //       <div>Current Bet: {player.currentBet}</div>
    //     </div>
    //   ))}
    //   <div className="mt-6">
    //     <div>
    //       <strong>Current Player:</strong>{" "}
    //       {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.username || "N/A"}
    //       {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.id === userData?.id && (
    //         <h4>(You)</h4>
    //       )}
    //     </div>
    //   </div>
    // </div>
  );
};

export default GameSideBar;
