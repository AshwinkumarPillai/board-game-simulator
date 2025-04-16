"use client";
import { Card } from "@/types/types";
import React from "react";

interface CardImageProps {
  card: Card;
}

const CardImage: React.FC<CardImageProps> = ({ card }) => {
  return <img src={`/cards/${card.suit}_${card.value}.svg`} alt={card.suit + card.value} />;
};

export default CardImage;
