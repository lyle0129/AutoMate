import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', verifyToken, requireAdmin, register); // Now requires admin authentication
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me); // New endpoint to check current user

export default router;
