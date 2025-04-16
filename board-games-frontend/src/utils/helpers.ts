import { Card, ErrorResponse } from "@/types/types";

export const calculateHandValue = (hand: Card[]): number => {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === "A") {
      aces++;
      total += 1; // count all Aces as 1 first
    } else if (["K", "Q", "J"].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }

  // Try to upgrade Aces from 1 → 11 (one by one) without busting
  let best = total;
  for (let i = 0; i < aces; i++) {
    if (best + 10 <= 21) {
      best += 10;
    }
  }

  return best;
};

export const isErrorResponse = (error: unknown): error is ErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data
  );
};
