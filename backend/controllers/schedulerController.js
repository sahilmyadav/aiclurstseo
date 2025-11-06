import ScheduledPost from '../models/ScheduledPost.js';
import mongoose from 'mongoose';

export const schedulePost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {
            content,
            isScheduled = false,
            scheduledFor = null,
            isRecurring = false,
            repeatType = null,
            repeatDays = [],
            accountId,
            locationId,
            createdBy,
            tokenDetails
        } = req.body;
          console.log("tokenDetails",tokenDetails)
        // Validate required fields
        if (!content || !accountId || !locationId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Content, accountId, and locationId are required fields'
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

        // Parse the scheduled time (already in UTC from frontend)
        const scheduledForUTC = isScheduled ? new Date(scheduledFor) : null;
        
        // No need to adjust timezone offset since the time is already in UTC
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
            content,
            accountId,
            locationId,
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

// Get scheduled posts by user ID
export const getScheduledPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const posts = await ScheduledPost.find({ 
            createdBy: userId,
            status: { $in: ['pending', 'failed'] },
            $or: [
                { scheduledFor: { $exists: true } },
                { nextRun: { $exists: true } }
            ]
        }).sort({ scheduledFor: 1, nextRun: 1 });

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

