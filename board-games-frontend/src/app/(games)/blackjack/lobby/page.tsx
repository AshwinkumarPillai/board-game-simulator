"use client";

import { useLobby } from "@/context/LobbyContext";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const page = () => {
  const { createLobby, checkIfUserIsInAnyLobby } = useSocket();

  const { lobbyData } = useLobby();

  const router = useRouter();

  const [maxPlayerLimit, setMaxPlayerLimit] = useState(2);

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxPlayerLimit(parseInt(e.target.value));
  };

  const handleCreateLobby = () => {
    createLobby({ maxPlayerLimit, game: "blackjack" });
  };

  useEffect(() => {
    if (lobbyData) {
      router.push(`/blackjack/${lobbyData.id}`);
      return;
    }

    checkIfUserIsInAnyLobby(true);
  }, [lobbyData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create a Lobby</h2>
        <div className="mb-6">
          <label htmlFor="max-player-select" className="block text-sm font-medium mb-2">
            Max Players:
          </label>
          <select
            id="max-player-select"
            value={maxPlayerLimit}
            onChange={handlePlayerChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num === 1 ? "Solo" : num}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateLobby}
          className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:-translate-y-1"
        >
          Create Lobby
        </button>
      </motion.div>
    </div>
  );
};

export default page;
