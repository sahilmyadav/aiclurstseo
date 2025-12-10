import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getPlans, 
  updatePlan, 
  togglePlanStatus 
} from '../controllers/planController.js';

const router = express.Router();

router.route('/')
  .get(protect, getPlans);

router.route('/:id')
  .put(protect,  updatePlan);

router.route('/:id/status')
  .patch(protect, togglePlanStatus);

export default router;
