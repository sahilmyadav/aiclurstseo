import express from "express";
import {
  startTrial,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription,
  checkTrialEligibility,
  getPlans,
  createPlan,
  getUserSubscription,
  getUserTransactions,
} from "../controllers/subscriptionController.js";
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
router.post("/start-trial",protect,startTrial);
router.post("/create-checkout-session", protect,createCheckoutSession);
router.get("/verify", verifySubscription);
router.get("/plans", getPlans);
router.post("/plans", createPlan);
router.get("/transactions/:userId", protect, getUserTransactions);
// Get user's subscription (active or most recent)
router.get("/user/:userId", protect, getUserSubscription);

// Queue management route

export default router;