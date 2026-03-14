import express from 'express';
import { registerUser , loginUser , logoutUser } from '../controllers/authController.js';
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Logout route (optional, can be handled on the client side by clearing cookies or tokens)
router.post('/logout', logoutUser);

export default router;