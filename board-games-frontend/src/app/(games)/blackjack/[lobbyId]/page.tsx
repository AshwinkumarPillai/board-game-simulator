"use client";
import { useLobby } from "@/context/LobbyContext";
import { useSocket } from "@/context/SocketContext";
import { BaseGamePlayer } from "@/types/types";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

const page = () => {
  const { lobbyData } = useLobby();
  const { socket, joinLobby, leaveLobby, startLobbyGame } = useSocket();
  const { lobbyId } = useParams();
  const { userData } = useUser();
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (socket) {
      joinLobby({ lobbyId: lobbyId as string });
    }
    setIsLoading(false);
    // Handle page unload (close, navigate away, etc.)
    // for some reason this is not working -> the user confirmation when hitting back button
    // but at least it is asking for confirmation when the page is about to reload and helps cancel that event which is good
    // it doesn't let you hit the back button which is funny but good for our use case
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isLeaving) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave the lobby?";
        const userResponse = confirm("Are you sure you want to leave the lobby?");

        if (userResponse) {
          setIsLeaving(true);
          leaveLobby({ lobbyId: lobbyId as string });
        }
      }
    };

    // Bind the beforeunload event for page exit
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isLeaving) {
        leaveLobby({ lobbyId: lobbyId as string });
      }
    };
  }, [socket, isLeaving]);

  const handleLeave = () => {
    setIsLeaving(true);
    leaveLobby({ lobbyId: lobbyId as string });
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}/blackjack/${lobbyId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => {
    startLobbyGame({ lobbyId: lobbyId as string });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-3xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Lobby Information */}
        {lobbyData && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Lobby: {lobbyData.id}</h2>
            <p className="text-center mb-6">
              {userData && lobbyData.ownerId === userData.id ? (
                "You can wait for players to join or start the game."
              ) : (
                <>
                  Please wait for{" "}
                  <span className="font-bold text-blue-400">
                    {lobbyData.players.find((player) => player.id === lobbyData.ownerId)?.username}
                  </span>{" "}
                  to start the game.
                </>
              )}
            </p>

            {/* Copy Lobby Link */}
            <div className="flex items-center gap-2 mb-6 justify-center">
              <input
                type="text"
                value={`${window.location.origin}/blackjack/${lobbyId}`}
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

            {/* Player List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {lobbyData.players.map((player: BaseGamePlayer) => (
                <motion.div
                  key={player.id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-black"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-xl font-bold bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm mt-2 text-center break-all">{player.username}</p>
                </motion.div>
              ))}
            </div>

            {/* Start Game Button */}
            {userData && lobbyData.ownerId === userData.id && (
              <button
                onClick={startGame}
                className="w-full py-2 cursor-pointer bg-green-600 rounded-lg hover:bg-green-700 transition-transform transform hover:-translate-y-1 mb-4"
              >
                Start Game
              </button>
            )}

            {/* Leave Lobby Button */}
            <button
              onClick={handleLeave}
              className="w-full py-2 cursor-pointer bg-red-600 rounded-lg hover:bg-red-700 transition-transform transform hover:-translate-y-1"
            >
              Leave Lobby
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default page;
