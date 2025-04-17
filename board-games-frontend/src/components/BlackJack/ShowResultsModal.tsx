"use client";
import { useSocket } from "@/context/SocketContext";
import { BlackJackGame, BlackJackPlayer } from "@/types/types";
import { useRouter } from "next/navigation";
import React from "react";

interface ShowResultsProps {
  blackJackGameData: BlackJackGame;
  setShowRoundResults: React.Dispatch<React.SetStateAction<boolean>>;
  isGameOver: boolean;
}

const ShowResultsModal: React.FC<ShowResultsProps> = ({
  blackJackGameData,
  setShowRoundResults,
  isGameOver,
}) => {
  const { leaveLobby } = useSocket();
  const router = useRouter();

  const handleClose = () => {
    setShowRoundResults(false);
    if (isGameOver) {
      leaveLobby({ lobbyId: blackJackGameData.lobbyId });
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 text-white rounded-lg p-6 max-w-4xl w-full relative">
        <button
          className="absolute cursor-pointer top-2 right-2 text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          onClick={handleClose}
        >
          {isGameOver ? "Return to Home Screen" : "Close"}
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isGameOver ? "Game Over" : `Round ${blackJackGameData.round - 1} Results`}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-700 px-4 py-2 text-left">Round</th>
                {blackJackGameData.players.map((player: BlackJackPlayer) => {
                  const totalPoints = player.points;

                  return (
                    <th key={player.id} className="border border-gray-700 px-4 py-2 text-left">
                      {player.username} [{totalPoints}]
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {blackJackGameData.results.map((roundResult) => (
                <tr key={roundResult.round}>
                  <td className="border border-gray-700 px-4 py-2 font-semibold">
                    Round {roundResult.round}
                  </td>
                  {blackJackGameData.players.map((player) => {
                    const result = roundResult.players.find((p) => p.id === player.id);
                    const roundPoints = result?.roundPoints ?? 0;

                    return (
                      <td key={player.id} className="border border-gray-700 px-4 py-2">
                        ({roundPoints})
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowResultsModal;
