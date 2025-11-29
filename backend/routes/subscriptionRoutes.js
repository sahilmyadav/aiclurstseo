import express from "express";
import {
  startTrial,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription,
  checkTrialEligibility,
  testTrialEndDate,
  getUserSubscription,
  getUserTransactions,
  getPlans,
  createPlan,
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
router.get("/user/:userId", protect, getUserSubscription); // Add this
router.get("/transactions/:userId", protect, getUserTransactions);
router.get("/plans", getPlans);
router.post("/plans", createPlan);

// Queue management route
router.post("/activate-queued", triggerActivation);

export default router;