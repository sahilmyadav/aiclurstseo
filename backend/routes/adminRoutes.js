import express from 'express';
import { getAdminMetrics, getAllUsers, getAllReviews, assignRole, deleteUser, blockUnblockUser } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Admin dashboard metrics
router.get('/metrics', protect, admin, getAdminMetrics);

// User management
router.get('/users', protect, admin, getAllUsers);

// Review management
router.get('/reviews', protect, admin, getAllReviews);

// Assign role
router.put('/assign-role', protect, admin, assignRole);

// Delete user
router.delete('/delete-user', protect, admin, deleteUser);

// Block/Unblock user
router.put('/block-user', protect, admin, blockUnblockUser);

export default router;
