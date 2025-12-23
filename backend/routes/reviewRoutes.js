import express from "express";
const router = express.Router();

import { createReview,getAllReviewsByLocationId } from "../controllers/reviewController.js";
import { replyToReview } from "../controllers/reviewReplyController.js";

router.post("/create", createReview);
router.get("/allReviews/:locationId", getAllReviewsByLocationId);
router.post("/reply", replyToReview);
export default router;