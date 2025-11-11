import User from '../models/User.js';
import Reviews from '../models/Reviews.js';
import mongoose from 'mongoose';

// Get admin dashboard metrics
export const getAdminMetrics = async (req, res) => {
    try {
        // Get total registered users (excluding admins)
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Get total reviews count
        const totalReviews = await Reviews.countDocuments();
        
        // Get today's reviews
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysReviews = await Reviews.countDocuments({
            createdAt: { $gte: today }
        });
        
        // Get this week's reviews
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const thisWeeksReviews = await Reviews.countDocuments({
            createdAt: { $gte: startOfWeek }
        });
        
        // Get recent reviews (last 5)
        const recentReviews = await Reviews.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        // Get user signups this week
        const userSignupsThisWeek = await User.countDocuments({
            createdAt: { $gte: startOfWeek },
            role: 'user'
        });
        
        // Calculate week-over-week growth
        const lastWeekStart = new Date(startOfWeek);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        const lastWeekReviews = await Reviews.countDocuments({
            createdAt: { $gte: lastWeekStart, $lt: startOfWeek }
        });
        
        const wowReviewGrowth = lastWeekReviews > 0 
            ? Math.round(((thisWeeksReviews - lastWeekReviews) / lastWeekReviews) * 100) 
            : 100;
        
        // Calculate user growth
        const lastWeekUserSignups = await User.countDocuments({
            createdAt: { $gte: lastWeekStart, $lt: startOfWeek },
            role: 'user'
        });
        
        const wowUserGrowth = lastWeekUserSignups > 0
            ? Math.round(((userSignupsThisWeek - lastWeekUserSignups) / lastWeekUserSignups) * 100)
            : 100;
        
        // Get average rating
        const averageRatingResult = await Reviews.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);
        
        const averageRating = averageRatingResult[0]?.averageRating?.toFixed(1) || 0;
        
        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalUsers,
                    totalReviews,
                    todaysReviews,
                    thisWeeksReviews,
                    userSignupsThisWeek,
                    wowReviewGrowth,
                    wowUserGrowth,
                    averageRating
                },
                recentActivity: recentReviews
            }
        });
        
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin metrics',
            error: error.message
        });
    }
};

// Get all users (for admin)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalUsers = await User.countDocuments();
        
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                pages: Math.ceil(totalUsers / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get all reviews (for admin)
export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const reviews = await Reviews.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalReviews = await Reviews.countDocuments();
        
        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total: totalReviews,
                page: parseInt(page),
                pages: Math.ceil(totalReviews / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};


export const assignRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        const user = await User.findByIdAndUpdate(userId, { role });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
        
    } catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning role',
            error: error.message
        });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId)
        console.log(req.body)
        
        
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

export  const blockUnblockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findByIdAndUpdate(userId, { isBlocked: !user.isBlocked })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }   
        res.status(200).json({
            success: true,
            data: user
        });
        
    } catch (error) {
        console.error('Error blocking/unblocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking/unblocking user',
            error: error.message
        });
    }
};
