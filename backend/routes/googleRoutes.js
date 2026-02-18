import express from "express";
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getGoogleBusinesses,
  getGoogleReviews,
  createGooglePost,
  getGooglePosts,

} from "../controllers/googleIntegrationController.js";

const router = express.Router();

router.get("/login", initiateGoogleLogin);

router.get("/google-callback", handleGoogleCallback);

router.get("/businesses", getGoogleBusinesses);

router.get("/reviews/:accountId/:locationId", getGoogleReviews);

router.post("/accounts/:accountId/locations/:locationId/localPosts", createGooglePost);

router.get("/accounts/:accountId/locations/:locationId/localPosts", getGooglePosts);

router.get("/posts/:accountId/:locationId", getGooglePosts);


export default router;