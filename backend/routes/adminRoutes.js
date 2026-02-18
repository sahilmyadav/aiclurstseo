import express from 'express';
import { getAdminMetrics, getAllUsers, getAllReviews, assignRole, deleteUser, blockUnblockUser } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', protect, admin, getAdminMetrics);

router.get('/users', protect, admin, getAllUsers);

router.get('/reviews', protect, admin, getAllReviews);

router.put('/assign-role', protect, admin, assignRole);

router.delete('/delete-user', protect, admin, deleteUser);

router.put('/block-user', protect, admin, blockUnblockUser);

export default router;
