import express from "express";
import { sendInvitationEmail } from "../controllers/invitationController.js";
import { sendSmsInvitation } from '../controllers/smsController.js';

const router = express.Router();

// POST /api/invitations/email
router.post("/email", sendInvitationEmail);

// POST /api/invitations/sms
router.post("/sms", sendSmsInvitation);

export default router;