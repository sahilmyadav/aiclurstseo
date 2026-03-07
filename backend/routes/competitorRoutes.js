import express from 'express';
import { getCompetitors, getPlaceDetails } from '../controllers/competitorController.js';

const router = express.Router();

// Get competitors near a location
router.get('/nearby', getCompetitors);

// Get detailed information about a specific place
router.get('/place/:placeId', getPlaceDetails);

export default router;
