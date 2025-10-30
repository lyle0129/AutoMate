import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByUsername } from '../models/userModel.js';
dotenv.config();

export const register = async (req, res) => {
  try {
    const { user_name, password, role, owner_id } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(user_name, hash, role, owner_id);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const user = await findUserByUsername(user_name);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, owner_id: user.owner_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
