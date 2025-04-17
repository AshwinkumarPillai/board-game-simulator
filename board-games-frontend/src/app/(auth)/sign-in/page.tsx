"use client";
import { loginUser } from "@/api/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/UserContext";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isErrorResponse } from "@/utils/helpers";

export default function LoginPage() {
  const { isLoading, userData, setUserData } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loginClicked, setLoginClicked] = useState(false);

  useEffect(() => {
    if (!isLoading && userData) router.push("/");
  }, [isLoading, userData, router]);

  const handleLogin = async () => {
    try {
      setLoginClicked(true);
      const data = await loginUser(username, password);
      setCookie("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      setUserData(data.user);
      router.push("/");
    } catch (err: unknown) {
      if (isErrorResponse(err)) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Login failed");
      }
    } finally {
      setLoginClicked(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loginClicked}
          className="w-full py-2 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:-translate-y-1"
        >
          {loginClicked ? <LoadingSpinner /> : "Login"}
        </button>
      </motion.div>
    </div>
  );
}
