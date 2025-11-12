import express from "express";
import {
  startTrial,
  createCheckoutSession,
  verifyStripeWebhook,
  verifySubscription
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
router.post("/start-trial", startTrial);
router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify/:userId", verifySubscription);

export default router;
