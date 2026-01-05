import ScheduledPost from '../models/ScheduledPost.js';
import mongoose from 'mongoose';
import { generateAIPost } from '../utils/aiGenerator.js';

export const schedulePost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {
            content,
            keywords = [],
            isScheduled = false,
            scheduledFor = null,
            isRecurring = false,
            repeatType = null,
            repeatDays = [],
            accountId,
            locationId,
            businessName,
            createdBy,
            tokenDetails,
            businessData // Add business data for AI generation
        } = req.body;
          console.log("tokenDetails",tokenDetails)
        
        // Generate AI content if content is empty but keywords are provided
        let finalContent = content;
        if (!content || content.trim() === '') {
            if (keywords.length > 0 && businessData) {
                try {
                    const postType = isScheduled ? 'promotional' : 'engagement';
                    finalContent = await generateAIPost(businessData, keywords, postType);
                    console.log('Generated AI content for scheduled post');
                } catch (error) {
                    console.error('Failed to generate AI content:', error);
                    // Continue with empty content if AI generation fails
                }
            }
        }
        // Validate required fields
        if (!finalContent || !accountId || !locationId ) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Content (or keywords for AI generation), accountId, locationId, and businessName are required fields'
            });
        }

        // Validate scheduledFor if it's a scheduled post
        if (isScheduled && !scheduledFor) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Scheduled time is required for scheduled posts'
            });
        }

        // Validate repeatType if it's a recurring post
        if (isRecurring && !['daily', 'weekly', 'monthly'].includes(repeatType)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Valid repeatType is required for recurring posts'
            });
        }

        // Validate repeatDays if it's a weekly recurring post
        if (isRecurring && repeatType === 'weekly' && (!repeatDays || repeatDays.length === 0)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Repeat days are required for weekly recurring posts'
            });
        }

        // Parse the scheduled time (convert from IST to UTC)
        let scheduledForUTC = null;
        if (isScheduled && scheduledFor) {
          // The frontend sends time in IST, so we need to convert it to UTC
          scheduledForUTC = new Date(scheduledFor);
          // Convert from IST (UTC+5:30) to UTC by subtracting 5 hours and 30 minutes
          scheduledForUTC.setHours(scheduledForUTC.getHours() - 5);
          scheduledForUTC.setMinutes(scheduledForUTC.getMinutes() - 30);
        }
        
        if (scheduledForUTC && isNaN(scheduledForUTC.getTime())) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid scheduled time format'
            });
        }

        console.log(`⏰ Scheduling post for:`, {
            localTime: scheduledFor,
            storedAsUTC: scheduledForUTC?.toISOString(),
            isRecurring,
            repeatType
        });

        // Ensure tokenDetails includes refresh_token if available
        const enhancedTokenDetails = tokenDetails ? {
            ...tokenDetails,
            refresh_token: tokenDetails.refresh_token || global.googleTokens?.refresh_token
        } : null;

        // Create the scheduled post
        const scheduledPost = new ScheduledPost({
            content: finalContent,
            keywords,
            accountId,
            locationId,
            businessName,
            isScheduled,
            scheduledFor: scheduledForUTC,
            isRecurring,
            repeatType: isRecurring ? repeatType : null,
            repeatDays: isRecurring && repeatType === 'weekly' ? repeatDays : [],
            createdBy,
            tokenDetails: enhancedTokenDetails,
            status: isScheduled ? 'pending' : 'posted',
            nextRun: isScheduled ? scheduledForUTC : null
        });

        // Save the scheduled post
        await scheduledPost.save({ session });
        
        // If it's not scheduled, update it as posted immediately
        if (!isScheduled) {
            scheduledPost.status = 'posted';
            scheduledPost.postedAt = new Date();
            await scheduledPost.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: isScheduled ? 'Post scheduled successfully' : 'Post created successfully',
            data: scheduledPost
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error scheduling post:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A similar post already exists',
                error: error.message
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Failed to schedule post',
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
        });
    }
};

// Get scheduled posts by location ID
export const deleteScheduledPost = async (req, res) => {

    console.log("Delete scheduled post",req.params);
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { postId } = req.params;
        console.log("Delete scheduled post",postId);


        
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        // Find and delete the post
        const deletedPost = await ScheduledPost.findByIdAndDelete(postId).session(session);
        console.log("DELETE POST",deletedPost)
        if (!deletedPost) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Scheduled post not found'
            });
        }

        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({
            success: true,
            message: 'Scheduled post deleted successfully',
            data: { id: deletedPost._id }
        });
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error deleting scheduled post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete scheduled post',
            error: error.message
        });
    }
};

export const getScheduledPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params; // This is actually locationId
        
        console.log('=== Backend Debug ===');
        console.log('Fetching scheduled posts for locationId:', userId);
        console.log('Request params:', req.params);
        
        // First, try a simple query to see if any posts exist for this location
        const allPosts = await ScheduledPost.find({ locationId: userId });
        console.log('All posts for location:', allPosts.length);
        
        // Now apply the filters
        const posts = await ScheduledPost.find({ 
            locationId: userId,
            status: { $in: ['pending', 'failed'] }
        }).sort({ createdAt: -1 });

        console.log('Filtered posts (pending/failed):', posts.length);
        if (posts.length > 0) {
            console.log('First post sample:', {
                id: posts[0]._id,
                locationId: posts[0].locationId,
                status: posts[0].status,
                scheduledFor: posts[0].scheduledFor,
                nextRun: posts[0].nextRun
            });
        }

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheduled posts',
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
        });
    }
};

