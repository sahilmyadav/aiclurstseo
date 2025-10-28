import express from "express";
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getGoogleBusinesses,
  getGoogleReviews,
  getGoogleStatus,
  disconnectGoogle,
  createGooglePost,
  getGooglePosts,
  getGooglePostsAlt
} from "../controllers/googleIntegrationController.js";

const router = express.Router();

// 🚀 Google OAuth Routes
router.get("/login", initiateGoogleLogin);
router.get("/google-callback", handleGoogleCallback);

// 📊 Status and Management Routes
router.get("/status", getGoogleStatus);
router.post("/disconnect", disconnectGoogle);

// 🏢 Business and Location Routes
router.get("/businesses", getGoogleBusinesses);
router.get("/reviews/:accountId/:locationId", getGoogleReviews);

// 📝 Google My Business Posts Routes
router.post("/accounts/:accountId/locations/:locationId/localPosts", createGooglePost);
router.get("/accounts/:accountId/locations/:locationId/localPosts", getGooglePosts);
router.get("/posts/:accountId/:locationId", getGooglePostsAlt);

export default router;
