import express from 'express';
import { getCompetitors, getPlaceDetails, generateCompetitorActionPlan } from '../controllers/competitorController.js';

const router = express.Router();

router.get('/nearby', getCompetitors);
router.get('/place/:placeId', getPlaceDetails);
router.post('/action-plan', generateCompetitorActionPlan);

export default router;
