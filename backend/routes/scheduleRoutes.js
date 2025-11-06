import express from 'express';
import { schedulePost } from '../controllers/schedulerController.js';

const router = express.Router();

router.post('/schedule', schedulePost);

export default router;
