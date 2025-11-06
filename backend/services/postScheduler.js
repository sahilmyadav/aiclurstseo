import ScheduledPost from '../models/ScheduledPost.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import axios from 'axios';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Process a single scheduled post
 */
async function processPost(post) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Mark post as processing
    post.status = 'processing';
    post.lastRun = new Date();
    await post.save({ session });

    // Get fresh token details
    let tokenDetails = post.tokenDetails;
    
    // Check if token is expired and refresh if needed
    if (tokenDetails && tokenDetails.expiryDate < new Date()) {
      oauth2Client.setCredentials({
        access_token: tokenDetails.accessToken,
        refresh_token: tokenDetails.refreshToken,
        expiry_date: tokenDetails.expiryDate.getTime()
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      tokenDetails = {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || tokenDetails.refreshToken,
        expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        scopes: credentials.scope ? credentials.scope.split(' ') : []
      };
      
      // Update token details in the post
      post.tokenDetails = tokenDetails;
      await post.save({ session });
    }

    // Prepare the post data for Google My Business
    const postData = {
      languageCode: 'en-US',
      summary: post.content,
      callToAction: {
        actionType: 'LEARN_MORE',
        url: process.env.APP_URL || 'https://your-website.com'
      },
      topicType: 'STANDARD'
    };

    // Make the API call to create the post using direct axios call
    const response = await axios.post(
      `https://mybusiness.googleapis.com/v4/accounts/${post.accountId}/locations/${post.locationId}/localPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${tokenDetails.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log(`✅ Post created successfully:`, response.data);

    // Update post status
    post.status = 'posted';
    post.postedAt = new Date();
    
    // If it's a recurring post, calculate next run time
    if (post.isRecurring) {
      post.nextRun = post.calculateNextRun();
      post.status = 'pending';
    }

    await post.save({ session });
    await session.commitTransaction();
    
    return { success: true, post };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error processing post:', error);
    
    // Update post status to failed
    post.status = 'failed';
    post.error = error.message;
    await post.save({ session });
    
    return { 
      success: false, 
      error: error.message,
      post 
    };
  } finally {
    session.endSession();
  }
}

/**
 * Convert local time to UTC for database storage
 */
function localToUTC(date) {
  if (!date) return date;
  const d = new Date(date);
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
}

/**
 * Check for posts that need to be published
 * This includes:
 * 1. Posts with nextRun in the past (UTC)
 * 2. Scheduled posts with scheduledFor in the past (UTC)
 * 3. Any unposted posts that are due (converting local time to UTC for comparison)
 */
async function checkScheduledPosts() {
  try {
    // Get current time in IST (UTC+5:30)
    const now = new Date();
    const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    console.log(`🔍 Checking for posts to process (Current time in IST: ${nowIST.toISOString()})`);
    
    // Find posts that need to be processed
    const posts = await ScheduledPost.find({
      status: { $in: ['pending', 'failed'] }, // Include failed posts for retry
      $or: [
        // Posts with nextRun in the past (IST)
        { nextRun: { $lte: nowIST } },
        // Scheduled posts with scheduledFor in the past (IST)
        { 
          isScheduled: true, 
          scheduledFor: { $lte: nowIST },
          nextRun: { $exists: false },
          status: { $ne: 'posted' }
        },
        // Any unposted posts that are due (IST)
        {
          status: { $ne: 'posted' },
          $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: nowIST } }
          ]
        }
      ]
    }).sort({ scheduledFor: 1, nextRun: 1 }); // Sort by schedule time

    console.log(`Found ${posts.length} posts to process`);
    
    // Process each post
    for (const post of posts) {
      const scheduledTime = post.scheduledFor || post.nextRun;
      console.log(`📅 Processing post ${post._id}...`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Scheduled for: ${scheduledTime ? scheduledTime.toISOString() : 'ASAP'}`);
      console.log(`   - Current time: ${now.toISOString()}`);
      
      await processPost(post);
    }
    
    return { processed: posts.length };
  } catch (error) {
    console.error('Error in checkScheduledPosts:', error);
    throw error;
  }
}

/**
 * Start the post scheduler
 * @param {number} intervalMinutes - How often to check for posts to publish (in minutes)
 */
function startScheduler(intervalMinutes = 5) {
  console.log(`Starting post scheduler, checking every ${intervalMinutes} minutes...`);
  
  // Run immediately on start
  checkScheduledPosts().catch(console.error);
  
  // Then run on the specified interval
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    checkScheduledPosts().catch(console.error);
  }, intervalMs);
  
  // Return function to stop the scheduler
  return () => {
    clearInterval(intervalId);
    console.log('Post scheduler stopped');
  };
}

export { startScheduler, checkScheduledPosts };
