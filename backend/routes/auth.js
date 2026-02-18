import express from 'express';
const router = express.Router();
import { 
  register, 
  login, 
  getCurrentUser, 
  getUserById, 
  forgotPassword, 
  resetPassword,
  validateResetToken, 
  toggleAutoReply
} from '../controllers/authController.js';
import { firebaseGoogleSignup } from '../controllers/firebaseAuthController.js';
import auth from '../middleware/auth.js';

router.post('/register', register);

router.post('/login', login);

router.post('/firebase/google-signup', firebaseGoogleSignup);

router.get('/me', auth, getCurrentUser);


router.get('/user/:userId', auth, getUserById);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/validate-reset-token', validateResetToken);
router.patch('/toggle-auto-reply', auth, toggleAutoReply);

export default router;