"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // update path as needed
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSocket } from "@/context/SocketContext";

// I want to prevent users from accessing routes inside (games) folder without being logged in
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, userData } = useUser();
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userData) {
      router.replace("/sign-in"); // Only logged in users can access routes inside (games) folder
    }
  }, [isLoading, userData, router]);

  if (isLoading || !socket) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData) return null; // I want to prevent rendering before userData is available, otherwise it flickers sometimes

  return <>{children}</>;
}
