import express from 'express';
import { getAdminMetrics, getAllUsers, getAllReviews } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Admin dashboard metrics
router.get('/metrics', protect, admin, getAdminMetrics);

// User management
router.get('/users', protect, admin, getAllUsers);

// Review management
router.get('/reviews', protect, admin, getAllReviews);

export default router;
