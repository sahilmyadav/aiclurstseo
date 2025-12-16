import express from 'express';
import protect from '../middleware/auth.js';
import { getTransactionAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Transaction analytics routes
router.route('/transactions')
  .get(protect,getTransactionAnalytics);

export default router;
