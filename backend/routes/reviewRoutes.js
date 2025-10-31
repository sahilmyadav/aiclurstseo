import express from "express";
const router = express.Router();

import { createReview,getAllReviewsByLocationId } from "../controllers/reviewController.js";

router.post("/create", createReview);
router.get('allReviews/:locationId', getAllReviewsByLocationId)

export default router;
