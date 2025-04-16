"use client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const { userData, logout } = useUser();

  return (
    <motion.nav
      className="flex items-center justify-between bg-gray-800 text-white px-6 py-4 shadow-lg"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Logo */}
      <Link href="/" className="text-xl font-bold hover:text-blue-500 transition">
        🎲 Board Games
      </Link>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {userData ? (
          <>
            <span className="text-sm text-gray-300">{userData.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-transform transform hover:-translate-y-1"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="text-sm hover:text-blue-500 transition">
              Login
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/sign-up" className="text-sm hover:text-blue-500 transition">
              Signup
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
