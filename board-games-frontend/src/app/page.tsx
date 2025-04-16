"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6">
      {/* Animated Heading */}
      <motion.h1
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to <span className="text-blue-500">Board Games 🎮</span>
      </motion.h1>

      {/* Conditional Rendering for Logged-In/Logged-Out State */}
      {!userData ? (
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-lg">
            Please{" "}
            <Link href="/sign-in" className="text-blue-500 hover:underline">
              Login
            </Link>{" "}
            or{" "}
            <Link href="/sign-up" className="text-blue-500 hover:underline">
              Sign Up
            </Link>{" "}
            to continue.
          </p>
          <p className="text-sm text-gray-400">
            We don't need your email or any other personal information. You&apos;ll only need a username and
            password to create an account for free.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            We do not store or sell any information about you. (This is just a fun project!)
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-lg">
            Welcome back, <strong>{userData.username}</strong>! Let&apos;s waste some time gambling with fake
            points 🎲.
          </p>
          <hr className="my-6 border-gray-700" />
          {/* Game Links */}
          <div>
            <Link
              href="/blackjack/lobby"
              className="inline-block px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:-translate-y-1"
            >
              Play Black Jack 🃏
            </Link>
          </div>
        </motion.div>
      )}
    </main>
  );
}
