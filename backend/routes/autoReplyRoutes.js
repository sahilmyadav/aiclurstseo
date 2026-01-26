import express from 'express';
import { setupAutoReply, getAutoReplyStatus } from '../controllers/autoReplySetupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/setup', protect, setupAutoReply);
router.get('/status/:userId', protect, getAutoReplyStatus);

export default router;