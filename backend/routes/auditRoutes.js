import express from 'express';
import { getAuditAnalysis } from '../controllers/auditController.js';

const router = express.Router();

router.post('/', getAuditAnalysis);

export default router;
