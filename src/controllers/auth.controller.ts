import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { generateToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { Route } from "../utils/types";

// Register User
export const registerUser: Route = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    const token = generateToken(user._id.toString());

    return res.status(200).json({ user: { id: user._id, username: user.username }, token });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const loginUser: Route = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({ user: { id: user._id, username: user.username }, token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
