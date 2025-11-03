import bcrypt from "bcrypt";
import { createUser, findUserByUsername } from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js"; // assuming jwt.js is inside /utils

// REGISTER new user
export const register = async (req, res) => {
  try {
    const { user_name, password, role, owner_id } = req.body;

    if (!user_name || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required" });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(user_name);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await createUser(user_name, password_hash, role, owner_id);

    // Generate JWT token and set cookie
    const token = generateToken(
      { id: newUser.id, user_name: newUser.user_name, role: newUser.role, owner_id: newUser.owner_id },
      res
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        user_name: newUser.user_name,
        role: newUser.role,
        owner_id: newUser.owner_id,
      },
      token, // still include it in JSON for debugging/Postman use
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGIN existing user
export const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await findUserByUsername(user_name);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token and set cookie
    const token = generateToken(
      { id: user.id, user_name: user.user_name, role: user.role, owner_id: user.owner_id },
      res
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        user_name: user.user_name,
        role: user.role,
        owner_id: user.owner_id,
      },
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGOUT (optional, to clear cookie)
export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
