"use client";
import { useUser } from "@/context/UserContext";
import { BlackJackGame } from "@/types/types";
import { calculateHandValue } from "@/utils/helpers";
import React from "react";
import CardImage from "../Card";
import { DollarSign, Hand, ShieldCheck, Timer, XCircle } from "lucide-react";

interface PlayerActionsProps {
  blackJackGameData: BlackJackGame;
  playerBet: number;
  handleBetAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlaceBet: () => void;
  handlePlayerAction: (action: "hit" | "stand" | "double") => void;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({
  blackJackGameData,
  playerBet,
  handleBetAmountChange,
  handlePlaceBet,
  handlePlayerAction,
}) => {
  const { userData } = useUser();

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl shadow-xl">
        {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.id === userData?.id ? (
          <div className="space-y-6">
            {/* Betting round */}
            {blackJackGameData.currentPhase === "betting" && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-xl">Place a bet to continue</div>
                <div>[Minimum bet: {blackJackGameData.minBet}]</div>
                <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-3 w-full max-w-xs">
                  <DollarSign className="h-6 w-6 text-purple-400 mr-2" />
                  <input
                    type="number"
                    placeholder={`Min: ${blackJackGameData.minBet}`}
                    min={blackJackGameData.minBet}
                    max={blackJackGameData.players[blackJackGameData.currentPlayerIndex].points}
                    value={playerBet}
                    onChange={handleBetAmountChange}
                    className="flex-1 bg-transparent text-lg font-medium text-purple-50 placeholder-purple-200 focus:outline-none"
                  />
                </div>
                <button
                  className="w-full cursor-pointer max-w-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={handlePlaceBet}
                >
                  <DollarSign className="h-5 w-5" />
                  Confirm Bet
                </button>
              </div>
            )}

            {/* Playing round */}
            {blackJackGameData.currentPhase === "playing" && (
              <div className="flex justify-center gap-4">
                <button
                  className="bg-gradient-to-r cursor-pointer from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-teal-500/20 transition-all duration-300 flex items-center gap-2"
                  onClick={() => handlePlayerAction("hit")}
                >
                  <Hand className="h-5 w-5" />
                  Hit
                </button>
                <button
                  className="bg-gradient-to-r cursor-pointer from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-pink-500/20 transition-all duration-300 flex items-center gap-2"
                  onClick={() => handlePlayerAction("stand")}
                >
                  <ShieldCheck className="h-5 w-5" />
                  Stand
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-gray-800/30 p-6 rounded-xl">
            <div className="inline-flex items-center gap-3 text-purple-200">
              <Timer className="h-6 w-6 animate-pulse" />
              {blackJackGameData.currentPhase === "roundOver" ? (
                <span className="text-lg font-medium">Moving to next round in a few seconds</span>
              ) : (
                <span className="text-lg font-medium">
                  Waiting for {blackJackGameData.players[blackJackGameData.currentPlayerIndex]?.username}
                  &apos;s turn...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Players' hands */}
      <div className="space-y-8">
        {blackJackGameData.players.map((player) => (
          <div
            key={player.id + "player_hand"}
            className="bg-gray-900/40 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-purple-100">
                {player.username}
                {player.id === userData?.id && (
                  <span className="ml-2 text-sm bg-purple-600/30 px-3 py-[2px] rounded-full">You</span>
                )}
              </h2>
            </div>
            <div>
              <span className="text-xl bg-gray-800 px-[10px] py-[5px] rounded-md text-teal-400 font-mono">
                Sum: {calculateHandValue(player.hand)}
              </span>
            </div>
            <br />
            {/* Player's cards */}
            <div className="flex flex-wrap gap-[10px] mb-[15px]">
              {player.hand.map((card, index) => (
                <div
                  key={`player${index}-card${index}`}
                  className="transition-transform hover:-translate-y-[4px] duration-[300ms]  w-[125px] h-[150px]"
                >
                  <CardImage card={card} />
                </div>
              ))}
            </div>

            {/* Status indicators */}
            {player.isBusted && (
              <div className="flex items-center gap-[10px] text-red-[400] bg-red-[900]/30 px-[15px] py-[8px] rounded-md">
                <XCircle className="h-[20px] w-[20px]" />
                <span>Busted!</span>
              </div>
            )}

            {player.isEliminated && (
              <div className="flex items-center gap-[10px] text-yellow-[400] bg-yellow-[900]/30 px-[15px] py-[8px] rounded-md">
                <ShieldCheck className="h-[20px] w-[20px]" />
                Eliminated!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerActions;
