import express from "express";
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getGoogleBusinesses,
  getGoogleReviews,
  createGooglePost,
  getGooglePosts
} from "../controllers/googleIntegrationController.js";

const router = express.Router();

// 🚀 Google OAuth Login
router.get("/login", initiateGoogleLogin);

// 🔄 OAuth callback
router.get("/google-callback", handleGoogleCallback);

// 🏢 Business locations
router.get("/businesses", getGoogleBusinesses);

// ⭐️ Reviews
router.get("/reviews/:accountId/:locationId", getGoogleReviews);

// 📝 Create post (localPost)
router.post("/accounts/:accountId/locations/:locationId/localPosts", createGooglePost);

// 📋 Get posts (with pagination)
router.get("/accounts/:accountId/locations/:locationId/localPosts", getGooglePosts);

// 🔁 Alt posts (simple) - using the same handler as the main posts endpoint
router.get("/posts/:accountId/:locationId", getGooglePosts);

export default router;
