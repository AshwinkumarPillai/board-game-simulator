"use client";

import { pingServer } from "@/api/api";
import { disconnectSocket } from "@/api/socket";
import { User } from "@/types/types";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    pingServer();
    setIsLoading(true);
    const stored = localStorage.getItem("userData");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const logout = async () => {
    deleteCookie("token");
    await localStorage.removeItem("userData");
    await setUserData(null);
    disconnectSocket();
    router.push("/sign-in");
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
