import express from "express";
import { sendInvitationEmail } from "../controllers/invitationController.js";

const router = express.Router();

// POST /api/invitations/email
router.post("/email", sendInvitationEmail);

export default router;