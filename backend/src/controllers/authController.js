import bcrypt from "bcrypt";
import { createUser, findUserByUsername, getAllUsers, findUserById, updateUser, deleteUser } from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js"; // assuming jwt.js is inside /utils

// REGISTER new user (Admin only)
export const register = async (req, res) => {
  try {
    const { user_name, password, role, owner_id } = req.body;

    if (!user_name || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required" });
    }

    // Validate role
    const validRoles = ['admin', 'mechanic', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, mechanic, or customer" });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(user_name);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Admin can set owner_id for customers, otherwise it's null
    // Only allow owner_id for customer role
    let finalOwnerId = null;
    if (role === 'customer' && owner_id) {
      finalOwnerId = parseInt(owner_id);
    }

    // Create user
    const newUser = await createUser(user_name, password_hash, role, finalOwnerId);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        user_name: newUser.user_name,
        role: newUser.role,
        owner_id: newUser.owner_id,
      },
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

// GET current user info (requires authentication)
export const me = (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const { id, user_name, role, owner_id } = req.user;
    
    res.status(200).json({
      message: "User authenticated",
      user: {
        id,
        user_name,
        role,
        owner_id,
      },
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET single user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findUserById(parseInt(id));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE user (Admin only)
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, role, owner_id } = req.body;

    if (!user_name || !role) {
      return res.status(400).json({ message: "Username and role are required" });
    }

    // Validate role
    const validRoles = ['admin', 'mechanic', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, mechanic, or customer" });
    }

    // Check if username already exists (excluding current user)
    const existingUser = await findUserByUsername(user_name);
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Only allow owner_id for customer role
    let finalOwnerId = null;
    if (role === 'customer' && owner_id) {
      finalOwnerId = parseInt(owner_id);
    }

    const updatedUser = await updateUser(parseInt(id), {
      user_name,
      role,
      owner_id: finalOwnerId,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE user (Admin only)
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const deletedUser = await deleteUser(parseInt(id));
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};