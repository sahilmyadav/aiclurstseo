import express from 'express';
import { setupAutoReply, getAutoReplyStatus } from '../controllers/autoReplySetupController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/setup', protect, setupAutoReply);
router.get('/status/:userId', protect, getAutoReplyStatus);

// Get last run time for user
router.get('/last-run/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      lastRunTime: user.autoReplyLastRun,
      nextRunTime: user.autoReplyNextRun
    });
    
  } catch (error) {
    console.error('Error getting last run time:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Toggle auto-reply for user
router.post('/toggle/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Toggle auto-reply status
    user.autoReply = !user.autoReply;
    
    // If disabling auto-reply, clear timing info
    if (!user.autoReply) {
      user.autoReplyLastRun = null;
      user.autoReplyNextRun = null;
    } else {
      // If enabling auto-reply, set next run time to 5 minutes from now
      const now = new Date();
      user.autoReplyLastRun = null; // No last run yet
      user.autoReplyNextRun = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
    }

    await user.save();

    res.json({ 
      success: true, 
      autoReply: user.autoReply,
      message: `Auto-reply ${user.autoReply ? 'enabled' : 'disabled'}`
    });
    
  } catch (error) {
    console.error('Error toggling auto-reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;