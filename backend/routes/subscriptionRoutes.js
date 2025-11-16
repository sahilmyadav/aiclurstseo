import express from "express";
import {
  startTrial,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription,
  checkTrialEligibility,
  testTrialEndDate
} from "../controllers/subscriptionController.js";
import { triggerActivation } from "../controllers/subscriptionQueueController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Parse JSON for all routes
router.use(express.json());

// Webhook needs raw body for signature verification
router.post(
  "/webhook", 
  express.raw({ type: 'application/json' }), 
  verifyStripeWebhook
);

// Regular API routes
router.get("/check-trial-eligibility/:userId",protect, checkTrialEligibility);
router.get("/test-trial-enddate/:userId",protect, testTrialEndDate); // Test endpoint
router.post("/start-trial",protect,startTrial);
router.post("/create-checkout-session", protect,createCheckoutSession);
router.get("/verify", verifySubscription);

// Queue management route
router.post("/activate-queued", triggerActivation);

export default router;  
