import express from 'express';
import { register, login, logout, me, updateProfile, getUsers, getUserById, updateUserById, deleteUserById } from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', verifyToken, requireAdmin, register); // Now requires admin authentication
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me); // New endpoint to check current user
router.put('/profile', verifyToken, updateProfile); // Update own profile

// User management routes (Admin only)
router.get('/users', verifyToken, requireAdmin, getUsers);
router.get('/users/:id', verifyToken, requireAdmin, getUserById);
router.put('/users/:id', verifyToken, requireAdmin, updateUserById);
router.delete('/users/:id', verifyToken, requireAdmin, deleteUserById);

export default router;