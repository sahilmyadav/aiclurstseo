import User from '../models/User.js';

export const setupAutoReply = async (req, res) => {
    console.log("ok",req.body)
  try {
    const { userId, locationId, accountId, tokenDetails } = req.body;
    
    if (!userId || !locationId || !accountId || !tokenDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if autoReplyConfigs array exists, initialize if not
    if (!user.autoReplyConfigs) {
      user.autoReplyConfigs = [];
    }
    
    // Find existing config for this location
    const existingConfigIndex = user.autoReplyConfigs.findIndex(config => 
      config.locationId === locationId
    );
    
    const newConfig = {
      locationId,
      accountId,
      tokenDetails,
      enabled: true,
      lastUpdated: new Date()
    };
    
    if (existingConfigIndex !== -1) {
      // Update existing config
      user.autoReplyConfigs[existingConfigIndex] = newConfig;
    } else {
      // Add new config
      user.autoReplyConfigs.push(newConfig);
    }
    
    // Also update the main autoReply field
    user.autoReply = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Auto-reply configuration saved successfully',
      data: {
        userId: user._id,
        autoReply: user.autoReply,
        autoReplyConfigs: user.autoReplyConfigs
      }
    });

  } catch (error) {
    console.error('Error setting up auto-reply:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAutoReplyStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('auto reply',user.autoReply)

    res.status(200).json({
      success: true,
      autoReplyEnabled: user.autoReply,
      configs: user.autoReplyConfigs || []
    });

  } catch (error) {
    console.error('Error getting auto-reply status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};