import express from 'express';
const router = express.Router();
import { register, login } from '../controllers/authController.js';
import { firebaseGoogleSignup } from '../controllers/firebaseAuthController.js';

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// Firebase Google Signup
router.post('/firebase/google-signup', firebaseGoogleSignup);

export default router;
