import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  suit: {
    type: String,
    enum: ["hearts", "diamonds", "clubs", "spades"],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const playerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  stack: {
    type: Number,
    required: true,
  },
  bet: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "folded", "all-in"],
    default: "active",
  },
  holeCards: [cardSchema],
});

const historySchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "bet", "fold"
  playerId: {
    type: String,
    required: true,
  },
  amount: { type: Number }, // Optional for actions like raise or bet
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const gameStateSchema = new mongoose.Schema({
  players: [playerSchema],
  communityCards: [cardSchema],
  pot: { type: Number, default: 0 },
  currentBet: { type: Number, default: 0 },
  phase: {
    type: String,
    enum: ["pre-flop", "flop", "turn", "river", "showdown"],
    default: "pre-flop",
    required: true,
  },
});

const gameSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
    },
    state: gameStateSchema,
    history: [historySchema],
  },
  { timestamps: true }
);

export const Game = mongoose.model("Game", gameSchema);
