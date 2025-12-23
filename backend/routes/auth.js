import express from 'express';
const router = express.Router();
import { 
  register, 
  login, 
  getCurrentUser, 
  getUserById, 
  forgotPassword, 
  resetPassword,
  validateResetToken 
} from '../controllers/authController.js';
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

// GET /api/auth/user/:userId - Get user by ID (admin or own user only)
router.get('/user/:userId', auth, getUserById);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

// POST /api/auth/validate-reset-token - Validate reset token
router.post('/validate-reset-token', validateResetToken);

export default router;