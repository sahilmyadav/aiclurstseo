import express from "express";
import {
  startTrial,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription,
  checkTrialEligibility,
  testTrialEndDate
} from "../controllers/subscriptionController.js";

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
router.get("/check-trial-eligibility/:userId", checkTrialEligibility);
router.get("/test-trial-enddate/:userId", testTrialEndDate); // Test endpoint
router.post("/start-trial", startTrial);
router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify", verifySubscription);

export default router;
