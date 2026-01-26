import cron from 'node-cron';
import User from '../models/User.js';
import { getGoogleReviews } from '../controllers/googleIntegrationController.js';
import { replyToReview } from '../controllers/reviewReplyController.js';
import axios from 'axios';

//  Auto-reply job that runs every 5 minutes
const autoReplyJob = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 Running auto-reply job...');
    const jobStartTime = new Date();

    // Update all users' last run time when job starts
    await User.updateMany(
      { autoReply: true, isActive: true },
      { 
        autoReplyLastRun: jobStartTime,
        autoReplyNextRun: new Date(jobStartTime.getTime() + 5 * 60000) // 5 minutes from now
      }
    );

    // Find all users with autoReply enabled and autoReplyConfigs
    const users = await User.find({
      autoReply: true, 
      isActive: true,
      'autoReplyConfigs': { $exists: true, $ne: [] }
    });

    if (users.length === 0) {
      console.log('No users with auto-reply enabled');
      return;
    }

    console.log(`Found ${users.length} users with auto-reply enabled`);

    for (const user of users) {
      try {
        console.log(`Processing auto-reply for user: ${user.email}`);

        // Process each configured location for this user
        for (const config of user.autoReplyConfigs) {
          if (!config.enabled) {
            console.log(`Skipping disabled location: ${config.locationId}`);
            continue;
          }

          try {
            console.log(`Processing location: ${config.locationId} for user: ${user.email}`);

            // Prepare request object for getGoogleReviews - using direct API call instead of controller
            const accessToken = config.tokenDetails.accessToken;
            const refreshToken = config.tokenDetails.refreshToken;
            const expiryDate = config.tokenDetails.expiryDate;
            const accountId = config.accountId;
            const locationId = config.locationId;

            // Direct API call to Google to get reviews
            const googleReviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
            
            const headers = {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            };

            try {
              const response = await axios.get(googleReviewsUrl, { headers });
              
              if (response.data && response.data.reviews) {
                const reviews = response.data.reviews;
                console.log(`Found ${reviews.length} reviews for location: ${config.locationId}`);

                // Process reviews that haven't been replied to
                for (const review of reviews) {
                  if (review.reviewReply || !review.comment) {
                    continue; // Already replied or no comment
                  }

                  // Generate a simple thank you response
                  const aiReply = `Thank you for your review! We appreciate your feedback: "${review.comment.substring(0, 50)}..."`;

                  if (aiReply) {
                    console.log(`Generating auto-reply for review: "${review.comment.substring(0, 50)}..."`);
                    
                    // Prepare request object for replyToReview - using direct API call instead of controller
                    const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${encodeURIComponent(review.name.split('/').pop())}:reply`;
                    
                    const replyPayload = {
                      comment: aiReply
                    };

                    const replyResponse = await axios.post(replyUrl, replyPayload, { 
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (replyResponse.status === 200) {
                      console.log(`✅ Successfully auto-replied to review: "${review.comment.substring(0, 50)}..."`);
                    } else {
                      console.log(`⚠️ Failed to auto-reply. Status: ${replyResponse.status}`);
                    }
                  } else {
                    console.log('No AI reply generated for review:', review.name);
                  }

                  // Wait between requests to avoid hitting rate limits
                  await delay(3000);
                }
              }
            } catch (googleApiError) {
              console.error(`Error fetching reviews from Google API for location ${locationId}:`, googleApiError.message || googleApiError);
              
              // If access token is expired, try to refresh it
              if (googleApiError.response?.status === 401) {
                console.log('Access token expired, attempting to refresh...');
                
                try {
                  const tokenRefreshUrl = 'https://oauth2.googleapis.com/token';
                  const refreshPayload = {
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                  };

                  const refreshResponse = await axios.post(tokenRefreshUrl, refreshPayload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                  });

                  if (refreshResponse.data.access_token) {
                    // Update the user's token in the database
                    const userToUpdate = await User.findById(user._id);
                    if (userToUpdate && userToUpdate.autoReplyConfigs) {
                      const configToUpdate = userToUpdate.autoReplyConfigs.find(c => c.locationId === locationId);
                      if (configToUpdate) {
                        configToUpdate.tokenDetails.accessToken = refreshResponse.data.access_token;
                        configToUpdate.tokenDetails.expiryDate = new Date(Date.now() + (refreshResponse.data.expires_in * 1000)).toISOString();
                        
                        await userToUpdate.save();
                        console.log('✅ Token refreshed and saved for user');
                      }
                    }
                  }
                } catch (refreshError) {
                  console.error('Error refreshing token:', refreshError.message || refreshError);
                }
              }
            }
          } catch (locationError) {
            console.error(`Error processing location ${config.locationId} for user ${user.email}:`, locationError.message || locationError);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError.message || userError);
      }
    }

    console.log('✅ Auto-reply job completed');
  } catch (error) {
    console.error('❌ Error in auto-reply job:', error.message || error);
  }
}, {
  scheduled: false, // Start manually
  timezone: 'Asia/Kolkata'
});

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize the job
export const startAutoReplyJob = () => {
  autoReplyJob.start();
  console.log(' Auto-reply job started - runs every 5 minutes');
};

export const stopAutoReplyJob = () => {
  autoReplyJob.stop();
  console.log(' Auto-reply job stopped');
};

export default autoReplyJob;