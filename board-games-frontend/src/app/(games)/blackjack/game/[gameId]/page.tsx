"use client";
import GameSideBar from "@/components/BlackJack/GameSideBar";
import PlayerActions from "@/components/BlackJack/PlayerActions";
import ShowResultsModal from "@/components/BlackJack/ShowResultsModal";
import CardImage from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLobby } from "@/context/LobbyContext";
import { useSocket } from "@/context/SocketContext";
import { calculateHandValue } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Layers, UserCheck } from "lucide-react";

const page = () => {
  const { blackJackGameData, lobbyData } = useLobby();
  const { checkIfUserIsInAnyLobby, placeBet, performPlayerAction, blackJackStartNextRound } = useSocket();
  const [playerBet, setPlayerBet] = useState(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [showRoundResults, setShowRoundResults] = useState(false);

  useEffect(() => {
    if (!lobbyData || !blackJackGameData) {
      checkIfUserIsInAnyLobby();
      return;
    }
    console.log(lobbyData);
    console.log(blackJackGameData);
    setPlayerBet(blackJackGameData.minBet);
  }, [blackJackGameData, lobbyData]);

  useEffect(() => {
    const currentPhase = blackJackGameData?.currentPhase;
    if (currentPhase === "roundOver") {
      setTimeout(() => {
        blackJackStartNextRound({ gameId: blackJackGameData?.id as string });
      }, 3000);
    }

    const round = blackJackGameData?.round || 1;
    if (currentRound < round) {
      setShowRoundResults(true);
      setCurrentRound(round);
    }
  }, [blackJackGameData]);

  if (!lobbyData || !blackJackGameData) {
    return <LoadingSpinner />;
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newBetAmount = parseInt(e.target.value);
    if (newBetAmount > blackJackGameData.players[blackJackGameData.currentPlayerIndex].points)
      newBetAmount = blackJackGameData.players[blackJackGameData.currentPlayerIndex].points;
    setPlayerBet(newBetAmount);
  };

  const handlePlaceBet = () => {
    if (!playerBet) {
      alert("Please enter a bet amount");
      return;
    }
    if (playerBet > blackJackGameData.players[blackJackGameData.currentPlayerIndex].points) {
      alert("You don't have enough points to place this bet");
      return;
    }
    if (playerBet < blackJackGameData.minBet) {
      alert("Minimum bet amount is " + blackJackGameData.minBet);
      return;
    }
    placeBet({ gameId: blackJackGameData.id, bet: playerBet });
  };

  const handlePlayerAction = (action: "hit" | "stand" | "double") => {
    performPlayerAction({ gameId: blackJackGameData.id, action });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Left Sidebar */}
      <motion.div
        className="w-1/4 bg-gray-800 p-6 overflow-y-auto shadow-lg"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <GameSideBar blackJackGameData={blackJackGameData} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="w-3/4 p-6 overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Deck and Dealer Info */}
        <div className="flex items-start gap-8 mb-8">
          {/* Deck Info */}
          <div className="w-1/4 text-center bg-gray-900/40 p-4 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <span>Cards in Deck</span>
              <Layers className="w-5 h-5 text-teal-400" />
            </h3>
            <div className="relative inline-block">
              <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-2xl">
                <span className="bg-black"> {blackJackGameData.deck?.cards?.length}</span>
              </span>
              <img
                src="/card_back.svg"
                alt="Deck"
                className="rounded-lg shadow-md w-[96px] h-[128px] border border-gray-700"
              />
            </div>
            <div>(6 deck shuffle)</div>
          </div>

          {/* Dealer Info */}
          <div className="flex-grow bg-gray-900/40 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>Dealer</span>
              <UserCheck className="w-5 h-5 text-yellow-400" />
            </h3>

            {blackJackGameData.currentPhase === "roundOver" ? (
              <>
                <div className="flex flex-wrap gap-[10px]">
                  {blackJackGameData.dealerHand.map((card, index) => (
                    <span
                      key={`dealer-card-${index}`}
                      className="w-[96px] h-[128px] rounded-lg shadow-md transition-transform hover:-translate-y-[4px] duration-[300ms]"
                    >
                      <CardImage card={card} />
                    </span>
                  ))}
                </div>
                <p className="mt-[15px] text-teal-400 font-medium">
                  Dealer Sum: {calculateHandValue(blackJackGameData.dealerHand)}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-[10px]">
                  {blackJackGameData.dealerHand.length > 0 && (
                    <>
                      <span
                        key={`dealer-card-0`}
                        className="w-[96px] h-[128px] rounded-lg shadow-md transition-transform hover:-translate-y-[4px] duration-[300ms]"
                      >
                        <CardImage card={blackJackGameData.dealerHand[0]} />
                      </span>
                      <span
                        key={`dealer-card-0`}
                        className="w-[96px] h-[128px] rounded-lg shadow-md transition-transform hover:-translate-y-[4px] duration-[300ms]"
                      >
                        <img src="/card_back.svg" alt="second_dealer_card" />
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Player Actions */}
        <PlayerActions
          blackJackGameData={blackJackGameData}
          playerBet={playerBet}
          handleBetAmountChange={handleBetAmountChange}
          handlePlaceBet={handlePlaceBet}
          handlePlayerAction={handlePlayerAction}
        />
      </motion.div>

      {(showRoundResults || blackJackGameData.gameOver) && (
        <ShowResultsModal
          blackJackGameData={blackJackGameData}
          setShowRoundResults={setShowRoundResults}
          isGameOver={blackJackGameData.gameOver}
        />
      )}
    </div>
  );
};

export default page;
