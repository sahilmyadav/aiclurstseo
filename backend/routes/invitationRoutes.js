import express from "express";
import multer from "multer";
import { sendInvitationEmail, sendBulkEmailInvitations, handleBulkEmailUpload } from "../controllers/invitationController.js";
import { sendSmsInvitation, sendBulkSmsInvitations, handleBulkSmsUpload } from '../controllers/smsController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.post("/email", sendInvitationEmail);

router.post("/email/bulk", sendBulkEmailInvitations);

router.post("/email/upload", upload.single('file'), handleBulkEmailUpload);

router.post("/sms", sendSmsInvitation);

router.post("/sms/bulk", sendBulkSmsInvitations);

router.post("/sms/upload", upload.single('file'), handleBulkSmsUpload);

export default router;