import express from 'express';
import { schedulePost, getScheduledPostsByUser } from '../controllers/schedulerController.js';

const router = express.Router();

// Schedule a new post
router.post('/schedule', schedulePost);

// Get scheduled posts by user ID
router.get('/user/:userId', getScheduledPostsByUser);

export default router;
