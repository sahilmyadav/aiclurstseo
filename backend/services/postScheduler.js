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
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      // For recurring posts, don't change status to processing
      // For non-recurring posts, set status to processing
      if (!post.isRecurring) {
        const updated = await ScheduledPost.updateOne(
          { _id: post._id, status: { $ne: 'processing' } },
          { 
            status: 'processing', 
            lastRun: new Date()
          }
        );
        
        // If no document was updated, it means another process is already handling it
        if (updated.matchedCount === 0) {
          console.log(`⚠️ Post ${post._id} is already being processed by another process`);
          return { success: false, reason: 'Already processing' };
        }
      }
      
      // Refresh the post to get the latest data
      post = await ScheduledPost.findById(post._id);
      
      console.log(`📤 Publishing post to Google Business Profile...`);
      
      // Get token details
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
      // For recurring posts, keep status as 'pending' since they will run again
      // For one-time posts, change to 'posted'
      if (!post.isRecurring) {
        post.status = 'posted';
        post.postedAt = new Date();
      }
      
      // If it's a recurring post, generate new content and update schedule
      if (post.isRecurring) {
        // Set lastRun to the current time before calculating next run
        // This ensures calculateNextRun uses the correct base date
        post.lastRun = new Date();
        
        // Save the post with lastRun first
        await post.save();
        
        // Generate new content for the next occurrence if keywords are available
        if (post.keywords && post.keywords.length > 0) {
          try {
            // Import generateAIPost function
            const { generateAIPost } = await import('../utils/aiGenerator.js');
            
            // Create business data object from available fields
            const businessData = {
              name: post.businessName,
              locationId: post.locationId,
              accountId: post.accountId
            };
            
            // Generate new content for the next post
            const newContent = await generateAIPost(businessData, post.keywords, 'promotional');
            post.content = newContent;
            console.log(`🔄 Generated new content for recurring post: "${newContent.substring(0, 50)}..."`);
          } catch (error) {
            console.error('Failed to generate new content for recurring post:', error);
            // Keep existing content if AI generation fails
          }
        }
        
        // Calculate next run time based on the lastRun time
        // Now lastRun is saved in the database, so calculateNextRun will use it correctly
        post.nextRun = post.calculateNextRun();
        
        // For recurring posts, update scheduledFor to the next run time
        // This ensures the next post will be scheduled correctly
        post.scheduledFor = new Date(post.nextRun);
        
        // Log the update for debugging
        console.log(`🔄 Recurring post scheduled for next run at: ${post.nextRun.toISOString()}`);
        console.log(`📅 Updated scheduledFor to: ${post.scheduledFor.toISOString()}`);
        console.log(`📋 Repeat type: ${post.repeatType}`);
        console.log(`📋 Base date (lastRun): ${post.lastRun.toISOString()}`);
        if (post.repeatDays && post.repeatDays.length > 0) {
          console.log(`📋 Repeat days: ${post.repeatDays.join(', ')}`);
        }
        
        // Mark fields as modified to ensure they're saved
        post.markModified('content');
        post.markModified('nextRun');
        post.markModified('scheduledFor');
      }

      await post.save();
      return { success: true, post };
    } catch (error) {
      // Check if it's a write conflict error
      if (error.errorLabels && error.errorLabels.includes('TransientTransactionError')) {
        retryCount++;
        console.log(`⚠️ Write conflict detected, retrying... (${retryCount}/${maxRetries})`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        continue;
      }
      
      // Mark as failed if it's not a retryable error
      try {
        await ScheduledPost.updateOne(
          { _id: post._id },
          { 
            status: 'failed',
            error: error.message,
            lastRun: new Date()
          }
        );
      } catch (updateError) {
        console.error('Failed to mark post as failed:', updateError);
      }
      
      console.error('Error processing post:', error);
      return { 
        success: false, 
        error: error.message,
        post 
      };
    }
  }
  
  throw new Error(`Failed to process post after ${maxRetries} retries due to write conflicts`);
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
    console.log(`🔍 Checking for posts to process (Current UTC: ${now.toISOString()})`);
    console.log(`🔍 Current IST: ${nowIST.toISOString()}`);
    
    // Debug: Check what posts are in the database
    const allPosts = await ScheduledPost.find({ status: 'pending' });
    console.log(`📊 Debug: Found ${allPosts.length} pending posts in database`);
    if (allPosts.length > 0) {
      allPosts.forEach(p => {
        console.log(`   - Post ${p._id}:`);
        console.log(`     scheduledFor: ${p.scheduledFor?.toISOString()}`);
        console.log(`     nextRun: ${p.nextRun?.toISOString()}`);
        console.log(`     isScheduled: ${p.isScheduled}`);
        console.log(`     lastRun: ${p.lastRun?.toISOString()}`);
      });
    }
    
    // Find posts that need to be processed
    // Only process posts where the scheduled time has passed
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
            // For all scheduled posts, check if scheduledFor is in the past
            { 
              isScheduled: true,
              scheduledFor: { 
                $ne: null,
                $lte: now 
              }
            }
          ]
        }
      ]
    }).sort({ scheduledFor: 1 }); // Sort by scheduled time

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
