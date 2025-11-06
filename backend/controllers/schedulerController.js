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

        // Create the scheduled post
        const scheduledPost = new ScheduledPost({
            content,
            accountId,
            locationId,
            isScheduled,
            scheduledFor: isScheduled ? new Date(scheduledFor) : null,
            isRecurring,
            repeatType: isRecurring ? repeatType : null,
            repeatDays: isRecurring && repeatType === 'weekly' ? repeatDays : [],
            createdBy,
            tokenDetails: tokenDetails || null,
            status: isScheduled ? 'pending' : 'posted'
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

