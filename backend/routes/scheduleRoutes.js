import express from 'express';
import { schedulePost, getScheduledPostsByUser, deleteScheduledPost } from '../controllers/schedulerController.js';

const router = express.Router();

// Schedule a new post
router.post('/schedule', schedulePost);

// Get scheduled posts by location ID
router.get('/user/:userId', getScheduledPostsByUser);

// Delete a scheduled post
router.delete('/:postId', deleteScheduledPost);

export default router;
