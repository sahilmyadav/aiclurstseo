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
    
    // If it's a recurring post, update both scheduledFor and nextRun
    if (post.isRecurring) {
      // Calculate next run time
      post.nextRun = post.calculateNextRun();
      
      // For recurring posts, update scheduledFor to the next run time
      // This ensures the next post will be scheduled correctly
      post.scheduledFor = new Date(post.nextRun);
      
      // Log the update for debugging
      console.log(`🔄 Recurring post scheduled for next run at: ${post.nextRun.toISOString()}`);
      
      // Reset status to pending for the next run
      post.status = 'pending';
      
      // Mark fields as modified to ensure they're saved
      post.markModified('nextRun');
      post.markModified('scheduledFor');
      post.markModified('status');
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
    // Get current time in UTC
    const now = new Date();
    
    // Convert to IST (UTC+5:30) for logging
    const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    console.log(`🔍 Checking for posts to process (Current time in IST: ${nowIST.toISOString()})`);
    
    // Find posts that need to be processed
    // Note: We store and compare all times in UTC, but the scheduled times are in IST
    const posts = await ScheduledPost.find({
      $and: [
        {
          $or: [
            { status: 'pending' },
            { 
              status: 'failed',
              lastRun: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // Only retry failed posts after 5 minutes
            }
          ]
        },
        {
          $or: [
            // Posts with nextRun in the past (converted to IST for comparison)
            { 
              $expr: {
                $lte: [
                  "$nextRun",
                  { $dateAdd: { startDate: new Date(0), unit: "millisecond", amount: now.getTime() + (5.5 * 60 * 60 * 1000) } }
                ]
              },
              nextRun: { $ne: null }
            },
            // New scheduled posts that haven't been processed yet
            { 
              isScheduled: true,
              $expr: {
                $lte: [
                  "$scheduledFor",
                  { $dateAdd: { startDate: new Date(0), unit: "millisecond", amount: now.getTime() + (5.5 * 60 * 60 * 1000) } }
                ]
              },
              nextRun: { $exists: false },
              lastRun: { $exists: false }
            }
          ]
        }
      ]
    }).sort({ scheduledFor: 1, nextRun: 1 }); // Sort by schedule time

    console.log(`Found ${posts.length} posts to process`);
    
    // Process each post
    for (const post of posts) {
      const scheduledTime = post.scheduledFor || post.nextRun;
      // Convert times to IST for logging
      const scheduledTimeIST = scheduledTime ? new Date(scheduledTime.getTime() + (5.5 * 60 * 60 * 1000)) : null;
      const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      console.log(`📅 Processing post ${post._id}...`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Scheduled for (IST): ${scheduledTime ? scheduledTimeIST.toISOString() : 'ASAP'}`);
      console.log(`   - Current time (IST): ${nowIST.toISOString()}`);
      
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
