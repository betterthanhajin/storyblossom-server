import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      username,
    });

    await userRepository.save(user);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { id: user.id.toString() },
      Buffer.from(jwtSecret, "utf-8"),
      { expiresIn: "7d" } // 기본값으
    );

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { id: user.id.toString() },
      Buffer.from(jwtSecret, "utf-8"),
      { expiresIn: "7d" } // 기본값으로 7일 지정
    );

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User is attached to request object through auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return user info (excluding password)
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
