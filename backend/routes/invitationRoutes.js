import express from "express";
import multer from "multer";
import { sendInvitationEmail } from "../controllers/invitationController.js";
import { sendSmsInvitation, sendBulkSmsInvitations, handleBulkSmsUpload } from '../controllers/smsController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});


// POST /api/invitations/email
router.post("/email", sendInvitationEmail);

// POST /api/invitations/sms
router.post("/sms", sendSmsInvitation);

// POST /api/invitations/sms/bulk
router.post("/sms/bulk", sendBulkSmsInvitations);

// POST /api/invitations/sms/upload
router.post("/sms/upload", upload.single('file'), handleBulkSmsUpload);

export default router;