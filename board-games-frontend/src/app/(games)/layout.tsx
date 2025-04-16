"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useSocket } from "@/context/SocketContext";
import LoadingWrapper from "@/components/LoadingWrapper";

// I want to prevent users from accessing routes inside (games) folder without being logged in
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, userData, pingStarted } = useUser();
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userData) {
      router.replace("/sign-in"); // Only logged in users can access routes inside (games) folder
    }
  }, [isLoading, userData, router]);

  if (isLoading || !socket || pingStarted) {
    return <LoadingWrapper />;
  }

  if (!userData) return null; // I want to prevent rendering before userData is available, otherwise it flickers sometimes

  return <>{children}</>;
}
