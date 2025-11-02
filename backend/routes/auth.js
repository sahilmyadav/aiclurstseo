import express from 'express';
const router = express.Router();
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { firebaseGoogleSignup } from '../controllers/firebaseAuthController.js';
import auth from '../middleware/auth.js';

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// Firebase Google Signup
router.post('/firebase/google-signup', firebaseGoogleSignup);

// GET /api/auth/me - Get current user's profile
router.get('/me', auth, getCurrentUser);

export default router;
