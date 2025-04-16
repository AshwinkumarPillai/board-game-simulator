"use client";

import LoadingWrapper from "@/components/LoadingWrapper";
import { useUser } from "@/context/UserContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { pingStarted } = useUser();

  if (pingStarted) {
    return <LoadingWrapper />;
  }
  return <>{children}</>;
}
