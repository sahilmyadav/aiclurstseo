import express from 'express';
import { getLoginPageContent, updateLoginPageContent } from '../controllers/loginPageController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getLoginPageContent);
router.put('/', protect, admin, updateLoginPageContent);

export default router;
