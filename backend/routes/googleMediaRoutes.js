import express from "express";
import { getGoogleMedia } from "../controllers/googleMediaController.js";

const router = express.Router();

router.get("/accounts/:accountId/locations/:locationId/media", getGoogleMedia);



export default router;
