import express from 'express';
import { fetchPerformanceMetrics } from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Fetch performance metrics for a business location
router.post('/performance', protect, fetchPerformanceMetrics);

export default router;