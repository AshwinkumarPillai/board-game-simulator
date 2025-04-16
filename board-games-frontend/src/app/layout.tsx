import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import { SocketProvider } from "@/context/SocketContext";
import { LobbyProvider } from "@/context/LobbyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Board Games",
  description: "Gambling Addicts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <LobbyProvider>
            <SocketProvider>
              <Navbar />
              {children}
            </SocketProvider>
          </LobbyProvider>
        </UserProvider>
      </body>
    </html>
  );
}
