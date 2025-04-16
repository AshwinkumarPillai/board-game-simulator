"use client";
import { Card } from "@/types/types";
import Image from "next/image";
import React from "react";

interface CardImageProps {
  card: Card;
}

const CardImage: React.FC<CardImageProps> = ({ card }) => {
  return (
    <Image
      src={`/cards/${card.suit}_${card.value}.svg`}
      alt={card.suit + card.value}
      width={96}
      height={128}
    />
  );
};

export default CardImage;
