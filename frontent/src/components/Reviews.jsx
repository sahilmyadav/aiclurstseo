import {
    Search, MoreVertical, Star, StarHalf, ChevronLeft, ChevronRight, Loader2,
    ChevronDown, ChevronUp, MessageSquare, MessageSquareText, CheckCircle2,
    Clock, BarChart2, Star as StarIcon, MessageSquare as MessageSquareIcon,
    X, Sparkles, Copy, RefreshCw, Play, Pause, CheckCircle, TrendingUp, Info
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { generateAIReviewReply } from '../utils/aiReplyGenerator';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';

// Auto-reply Controls Component


const Reviews = () => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [currentReview, setCurrentReview] = useState(null);
    const [replyLoading, setReplyLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isAutoReplyMode, setIsAutoReplyMode] = useState(false);
    const [autoReplyDelay, setAutoReplyDelay] = useState(2); // in minutes
    const [isAutoReplying, setIsAutoReplying] = useState(false);
    const [isProcessingReply, setIsProcessingReply] = useState(false);
    const [currentReplyIndex, setCurrentReplyIndex] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const { reviews, selectedBusiness, businesses, loading, selectBusiness, tokenDetails } = useGoogleBusiness();
    const { user: authUser } = useAuth();
const AutoReplyControls = ({
    isAutoReplyMode,
    setIsAutoReplyMode,
    autoReplyDelay,
    setAutoReplyDelay,
    isAutoReplying,
    toggleAutoReply,
    repliedReviews,
    totalReviews
}) => (
<div className={`mr-8 ml-8 mb-1 mt-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
    theme === 'dark' ? 'border-gray-700/50' : 'border-purple-100'
} overflow-hidden transition-all duration-300 hover:shadow-md`}>
    <div className="px-2 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left side - Toggle and Mode */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center">
                        <div className="relative inline-flex items-center">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isAutoReplyMode}
                                        onChange={() => setIsAutoReplyMode(!isAutoReplyMode)}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${
                                        isAutoReplyMode 
                                            ? 'bg-purple-500' 
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}></div>
                                    <div className={`absolute left-1 top-1 bg-white dark:bg-gray-700 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                        isAutoReplyMode ? 'translate-x-6' : 'translate-x-0'
                                    }`}></div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {isAutoReplyMode ? 'Auto Reply Mode' : 'Manual Reply Mode'}
                                    </div>
                                    <p className={`text-xs ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-purple-700/80'
                                    }`}>
                                        {isAutoReplyMode
                                            ? 'Automatically respond to new reviews'
                                            : 'Manually respond to each review'}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Delay Selector */}
                    {isAutoReplyMode && (
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
                        }`}>
                            <Clock className={`h-4 w-4 ${
                                theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                            }`} />
                            <span className={`text-sm ${
                                theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                            }`}>
                                Check every
                            </span>
                            <select
                                value={autoReplyDelay}
                                onChange={(e) => setAutoReplyDelay(Number(e.target.value))}
                                className={`block w-16 pl-2 pr-6 py-1 text-sm border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-purple-800 text-gray-100'
                                        : 'bg-white border-purple-200 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                                disabled={isAutoReplying}
                            >
                                <option value={2}>2 min</option>
                                <option value={5}>5 min</option>
                                <option value={10}>10 min</option>
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side - Action Button */}
            <div className="w-full sm:w-auto">
                <button
                    onClick={toggleAutoReply}
                    disabled={!isAutoReplyMode}
                    className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isAutoReplying
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                            : isAutoReplyMode
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    } ${!isAutoReplyMode ? 'opacity-70' : ''}`}
                >
                    {isAutoReplying ? (
                        <>
                            <Pause className="w-4 h-4 mr-2" />
                            <span>Stop Auto-Reply</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            <span>{isAutoReplyMode ? 'Start Auto-Reply' : 'Select Auto Mode'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Status Bar */}
        <div className={`mt-4 pt-4 border-t ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-purple-100'
        } transition-all duration-300 ${isAutoReplying ? 'opacity-100' : 'opacity-90'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center text-sm">
                    {isAutoReplying ? (
                        <>
                            <span className="flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                Auto-replying to reviews...
                            </span>
                        </>
                    ) : (
                        <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <span className={`${
                                theme === 'dark' ? 'text-gray-300' : 'text-purple-800'
                            }`}>
                                {repliedReviews} of {totalReviews} reviews replied
                                <span className={`font-medium ml-1 ${
                                    theme === 'dark' ? 'text-white' : 'text-purple-900'
                                }`}>
                                    ({Math.round((repliedReviews / totalReviews) * 100 || 0)}%)
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                {!isAutoReplying && isAutoReplyMode && (
                    <div className={`flex items-center text-xs px-3 py-1 rounded-full ${
                        theme === 'dark' 
                            ? 'text-purple-400 bg-purple-900/30' 
                            : 'text-purple-700 bg-purple-50'
                    }`}>
                        <Info className="w-3.5 h-3.5 mr-1.5" />
                        <span>Will reply to all reviews</span>
                    </div>
                )}
            </div>

            {isAutoReplyMode && (
                <div className={`mt-3 w-full rounded-full h-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                            theme === 'dark' ? 'bg-purple-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${(repliedReviews / totalReviews) * 100 || 0}%` }}
                    ></div>
                </div>
            )}
        </div>
    </div>
</div>
);
    // Initialize expanded rows when reviews are loaded
    useEffect(() => {
        if (reviews && reviews.length > 0) {
            const initialExpanded = {};
            reviews.forEach(review => {
                if (review.reviewReply) {
                    initialExpanded[review.name || `review-${reviews.indexOf(review)}`] = true;
                }
            });
            setExpandedRows(initialExpanded);
        }
    }, [reviews]);

    const handleBusinessSelect = (business) => {
        selectBusiness(business);
    };

    const filteredReviews = reviews?.filter(review => {
        // Apply search filter
        const matchesSearch =
            review.reviewer?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.starRating?.toString().includes(searchQuery);

        // Apply reply status filter
        const hasReply = review.reviewReply?.comment || false;
        const matchesFilter =
            activeFilter === 'all' ||
            (activeFilter === 'replied' && hasReply) ||
            (activeFilter === 'needsReply' && !hasReply);

        return matchesSearch && matchesFilter;
    }) || [];

    const formatReviewData = (reviews) => {
        if (!reviews) return [];

        return reviews.map((review, index) => ({
            id: review.name || `review-${index}`,
            name: review.reviewer?.displayName || 'Anonymous',
            comment: review.comment || '',
            rating: getRatingValue(review.starRating),
            date: review.createTime || new Date().toISOString(),
            status: review.state === 'PUBLIC' ? 'Active' : 'Inactive',
            reply: review.reviewReply?.comment,
            replyDate: review.reviewReply?.updateTime,
            reviewData: review // Store the full review object for reference
        }));
    };

    const getRatingValue = (starRating) => {
        const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
        return ratingMap[starRating] || 0;
    };

    const displayReviews = formatReviewData(filteredReviews);

    // Format all reviews for stats calculation (unfiltered)
    const allDisplayReviews = formatReviewData(reviews || []);

    // Calculate review statistics (using unfiltered data)
    const totalReviews = allDisplayReviews.length;
    const repliedReviews = allDisplayReviews.filter(review =>
        !!review.reply || (review.reviewData?.reviewReply?.comment)
    ).length;
    const pendingReviews = totalReviews - repliedReviews;
    const averageRating = allDisplayReviews.length > 0
        ? (allDisplayReviews.reduce((sum, review) => sum + review.rating, 0) / allDisplayReviews.length).toFixed(1)
        : 0;

    const toggleRowExpand = (reviewId) => {
        setExpandedRows(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
        }

        return <>{stars}</>;
    };

    // Handle reply button click
    const handleReply = (review) => {
        setCurrentReview(review);
        setReplyText('');
        setIsEditMode(false);
        setReplyLoading(false);
        setReplyDialogOpen(true);
    };

    // Handle edit button click
    const handleEditReply = (review) => {
        setCurrentReview(review);
        setReplyText(review.reply || '');
        setIsEditMode(true);
        setReplyLoading(false);
        setReplyDialogOpen(true);
    };

    // Submit reply/update to backend
    const submitReply = async () => {
        if (!replyText.trim() || !currentReview || !selectedBusiness) return;

        setReplyLoading(true);
        const isEdit = isEditMode; // Capture the edit mode before async operations
        try {
            // Extract account ID and location ID from selected business
            const accountId = selectedBusiness.accountId;
            const locationId = selectedBusiness.name.split("/")[1];
            const reviewId = currentReview.reviewData.name.split("/").pop();

            // Get Google OAuth tokens from localStorage
            const oauthKey = `google_oauth_tokens_${authUser?.id || 'guest'}`;
            const oauthTokens = JSON.parse(localStorage.getItem(oauthKey) || '{}');

            // Create axios instance with base URL and default headers
            const api = axios.create({
                baseURL: 'http://localhost:8000', // Replace with your actual backend URL
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenDetails?.accessToken}`
                },
                withCredentials: true,
                timeout: 10000 // 10 seconds timeout
            });

            // Build URL with OAuth parameters
            const params = new URLSearchParams({
                ...(oauthTokens.access_token && { access_token: oauthTokens.access_token }),
                ...(oauthTokens.refresh_token && { refresh_token: oauthTokens.refresh_token }),
                ...(oauthTokens.expiry_date && { expiry_date: oauthTokens.expiry_date })
            });

            // Use the same endpoint for both create and update
            const response = await api.post(`/api/reviews/reply?${params}`, {
                comment: replyText,
                accountId,
                locationId,
                reviewId
            });

            console.log('Response:', response.data);

            // Show success message based on action
            if (isEditMode) {
                toast.success('Reply updated successfully!');
            } else {
                toast.success('Reply sent successfully!');
            }

            // Always reset UI state regardless of response
            setReplyLoading(false);
            setReplyDialogOpen(false);
            setReplyText('');

            // Refresh reviews to show the new reply
            await selectBusiness(selectedBusiness);
        } catch (error) {
            console.error('Error submitting reply:', error);
            // Show error toast
            toast.error('Failed to send reply. Please try again.');

            // Always reset UI state even on error
            setReplyLoading(false);
            setReplyDialogOpen(false);
            setReplyText('');

            // Refresh reviews to show any changes
            await selectBusiness(selectedBusiness);
        }
    };

    const renderBusinessDropdown = () => (
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
            <BusinessProfileDropdown
                onSelect={handleBusinessSelect}
                className="w-full sm:w-64"
            />
        </div>
    );

    // Generate AI reply for a review
    const generateAIReview = useCallback(async () => {
        if (!currentReview) return;

        setIsGeneratingAI(true);
        setAiSuggestion('');

        try {
            const businessName = selectedBusiness?.title || selectedBusiness?.locationName || 'our business';
            const businessType = selectedBusiness?.primaryCategory?.displayName ||
                selectedBusiness?.categories?.primaryCategory?.displayName || 'business';

            const reviewText = currentReview.comment || '';
            const rating = currentReview.rating || 5;

            const aiReply = await generateAIReviewReply(
                reviewText,
                businessType,
                'professional',
                isEditMode,
                rating,
                businessName
            );

            setAiSuggestion(aiReply);
        } catch (error) {
            console.error('Error generating AI reply:', error);
            toast.error('Failed to generate AI reply. Please try again.');
        } finally {
            setIsGeneratingAI(false);
        }
    }, [currentReview, selectedBusiness, isEditMode]);

    // Copy AI suggestion to reply text
    const copyAISuggestion = () => {
        if (aiSuggestion) {
            setReplyText(aiSuggestion);
            toast.success('AI suggestion copied to reply');
        }
    };

    const processNextReview = useCallback(async () => {
        if (!selectedBusiness || isProcessingReply) return;

        const eligibleReviews = displayReviews.filter(review =>
            !review.reply && !review.reviewData?.reviewReply
        );

        if (currentReplyIndex >= eligibleReviews.length) {
            // All reviews processed
            setIsAutoReplying(false);
            setCurrentReplyIndex(0);
            toast.success('Auto-reply completed!');
            await selectBusiness(selectedBusiness);
            return;
        }

        const review = eligibleReviews[currentReplyIndex];
        if (!review) {
            setIsAutoReplying(false);
            setCurrentReplyIndex(0);
            return;
        }

        setIsProcessingReply(true);

        try {
            // Generate AI reply
            const businessName = selectedBusiness?.title || selectedBusiness?.locationName || 'our business';
            const businessType = selectedBusiness?.primaryCategory?.displayName ||
                selectedBusiness?.categories?.primaryCategory?.displayName || 'business';

            const reviewText = review.comment || '';
            const rating = review.rating || 5;

            const aiReply = await generateAIReviewReply(
                reviewText,
                businessType,
                'friendly',
                false,
                rating,
                businessName
            );

            // Submit reply
            const accountId = selectedBusiness.accountId;
            const locationId = selectedBusiness.name.split("/")[1];
            const reviewId = review.reviewData.name.split("/").pop();

            // Get Google OAuth tokens from localStorage
            const oauthKey = `google_oauth_tokens_${authUser?.id || 'guest'}`;
            const oauthTokens = JSON.parse(localStorage.getItem(oauthKey) || '{}');

            const api = axios.create({
                baseURL: 'http://localhost:8000',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenDetails?.accessToken}`
                },
                withCredentials: true,
                timeout: 10000
            });

            // Build URL with OAuth parameters
            const params = new URLSearchParams({
                ...(oauthTokens.access_token && { access_token: oauthTokens.access_token }),
                ...(oauthTokens.refresh_token && { refresh_token: oauthTokens.refresh_token }),
                ...(oauthTokens.expiry_date && { expiry_date: oauthTokens.expiry_date })
            });

            await api.post(`/api/reviews/reply?${params}`, {
                comment: aiReply,
                accountId,
                locationId,
                reviewId
            });

            toast.success(`Replied to review from ${review.name}`);

            // Move to next review index
            setCurrentReplyIndex(prev => prev + 1);

            // Refresh reviews after delay
            setTimeout(async () => {
                await selectBusiness(selectedBusiness);

                // Process next review after refresh
                setTimeout(() => {
                    setIsProcessingReply(false);
                    if (isAutoReplying) {
                        processNextReview();
                    }
                }, 1000); // Small delay to ensure state updates

            }, 1000);

        } catch (error) {
            console.error(`Error auto-replying to review:`, error);
            toast.error(`Failed to reply to review from ${review.name}`);

            // Move to next review even if one fails
            setCurrentReplyIndex(prev => prev + 1);
            setIsProcessingReply(false);

            // Process next review after delay
            if (isAutoReplying) {
                setTimeout(processNextReview, autoReplyDelay * 60 * 1000);
            }
        }
    }, [selectedBusiness, displayReviews, currentReplyIndex, isAutoReplying, isProcessingReply, autoReplyDelay, tokenDetails, selectBusiness]);

    // Handle auto-reply start/stop
    const handleAutoReplyAll = useCallback(() => {
        if (isAutoReplying) {
            // Stop auto-reply
            setIsAutoReplying(false);
            setIsAutoReplyMode(false);
            setCurrentReplyIndex(0);
            toast.info('Auto-reply stopped');
        } else {
            // Start auto-reply
            const eligibleReviews = displayReviews.filter(review =>
                !review.reply && !review.reviewData?.reviewReply
            );

            if (eligibleReviews.length === 0) {
                toast.info('No eligible reviews found for auto-reply');
                return;
            }

            setIsAutoReplying(true);
            setIsAutoReplyMode(true);
            setCurrentReplyIndex(0);
            toast.info(`Starting auto-reply to ${eligibleReviews.length} reviews with ${autoReplyDelay} min delay...`);

            // Start processing the first review
            processNextReview();
        }
    }, [displayReviews, isAutoReplying, autoReplyDelay, processNextReview]);

    // Toggle auto-reply mode - now handled by handleAutoReplyAll
    const toggleAutoReply = handleAutoReplyAll;

    const renderReviewRow = (review) => {
        const hasReply = !!review.reply || (review.reviewData?.reviewReply?.comment);
        const reply = review.reply || review.reviewData?.reviewReply?.comment;
        const replyDate = review.replyDate || review.reviewData?.reviewReply?.updateTime;

        return (
            <React.Fragment key={review.id}>
                <tr className={`hover:bg-opacity-80 transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50/80'
                    }`}>
                    <td className="px-6 py-4">
                        <div className="flex flex-col space-y-5">
                            {/* Review Section */}
                            <div className="space-y-3.5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {review.name}
                                            </h4>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(review.rating)}
                                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                                                    }`}>
                                                    {review.rating}
                                                </span>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${hasReply
                                                ? theme === 'dark'
                                                    ? 'bg-green-900/30 text-green-300'
                                                    : 'bg-green-100 text-green-800'
                                                : theme === 'dark'
                                                    ? 'bg-yellow-900/30 text-yellow-300'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {hasReply ? (
                                                    <>
                                                        <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="3" />
                                                        </svg>
                                                        Replied
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="mr-1.5 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="3" />
                                                        </svg>
                                                        Not Replied
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                        {new Date(review.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    {review.comment}
                                </p>
                            </div>

                            {/* Response Section */}
                            {hasReply && (
                                <div className={`mt-4 ml-4 pl-4 border-l-2 ${theme === 'dark' ? 'border-blue-900/40' : 'border-blue-200'
                                    }`}>
                                    <div className={`bg-gradient-to-r p-4 rounded-xl shadow-sm ${theme === 'dark'
                                        ? 'from-blue-900/30 to-blue-900/10 border-blue-900/30'
                                        : 'from-blue-50 to-blue-50/70 border-blue-100'
                                        } border`}>
                                        <div className="flex">
                                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                                }`}>
                                                <MessageSquare className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                                                        }`}>
                                                        Your Response
                                                    </p>
                                                    <p className={`text-sm whitespace-nowrap ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                                        }`}>
                                                        {replyDate ? new Date(replyDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : ''}
                                                    </p>
                                                </div>
                                                <p className={`mt-1.5 text-xs leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                                                    }`}>
                                                    {reply}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                            {hasReply ? (
                                <button
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${theme === 'dark'
                                        ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditReply(review);
                                    }}
                                >
                                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                    Edit
                                </button>
                            ) : (
                                <button
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${theme === 'dark'
                                        ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReply(review);
                                    }}
                                >
                                    <MessageSquareText className="w-3.5 h-3.5 mr-1" />
                                    Reply
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
            </React.Fragment>
        );
    };

    return (
        <div className="relative  min-h-screen">
            {renderBusinessDropdown()}

            {/* Auto-reply Controls */}
            {selectedBusiness && (
                <AutoReplyControls
                    isAutoReplyMode={isAutoReplyMode}
                    setIsAutoReplyMode={setIsAutoReplyMode}
                    autoReplyDelay={autoReplyDelay}
                    setAutoReplyDelay={setAutoReplyDelay}
                    isAutoReplying={isAutoReplying}
                    toggleAutoReply={toggleAutoReply}
                    repliedReviews={repliedReviews}
                    totalReviews={totalReviews}
                />
            )}

            {/* Filter Tabs */}
            <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeFilter === 'all'
                            ? theme === 'dark'
                                ? 'bg-blue-700 text-white hover:bg-blue-600 focus:ring-blue-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : theme === 'dark'
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300'
                            }`}
                    >
                        All Reviews
                    </button>
                    <button
                        onClick={() => setActiveFilter('needsReply')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeFilter === 'needsReply'
                            ? theme === 'dark'
                                ? 'bg-amber-600 text-white hover:bg-amber-500 focus:ring-amber-500'
                                : 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500'
                            : theme === 'dark'
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300'
                            }`}
                    >
                        Needs Reply
                    </button>
                    <button
                        onClick={() => setActiveFilter('replied')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeFilter === 'replied'
                            ? theme === 'dark'
                                ? 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500'
                                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            : theme === 'dark'
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300'
                            }`}
                    >
                        Replied
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mx-4 sm:mx-6 lg:mx-8 mb-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Reviews */}
                    <div className={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700/50'
                        : 'bg-white border-gray-100'
                        } border`}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                                        }`}>
                                        <MessageSquareText className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                            }`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            Total Reviews
                                        </p>
                                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {totalReviews}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    }`}>
                                    All Time
                                </div>
                            </div>
                            {totalReviews > 0 && (
                                <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                                    }`}>
                                    <div className="flex items-center text-sm text-green-500">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        <span>+{Math.floor(totalReviews * 0.15)}% this month</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div className={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700/50' : 'bg-white border-gray-100'
                        } border`}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 p-3 rounded-xl ${theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'
                                        }`}>
                                        <StarIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
                                            }`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            Average Rating
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {averageRating}
                                            </p>
                                            <div className="flex -space-x-1">
                                                {renderStars(averageRating)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                                    }`}>
                                    {averageRating >= 4 ? 'Excellent' : averageRating >= 3 ? 'Good' : 'Needs Work'}
                                </div>
                            </div>
                            {totalReviews > 0 && (
                                <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                                    }`}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                            Based on {totalReviews} reviews
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Replied Reviews */}
                    <div className={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700/50' : 'bg-white border-gray-100'
                        } border`}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 p-3 rounded-xl ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                                        }`}>
                                        <CheckCircle2 className={`h-6 w-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                            }`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            Replied
                                        </p>
                                        <div className="flex items-baseline">
                                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {repliedReviews}
                                            </p>
                                            <span className={`ml-2 text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                                }`}>
                                                {totalReviews > 0 ? `(${Math.round((repliedReviews / totalReviews) * 100)}%)` : '(0%)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                    }`}>
                                    {repliedReviews > 0 ? 'Good Job!' : 'No Replies'}
                                </div>
                            </div>
                            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                                }`}>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Pending Reviews */}
                    <div className={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700/50' : 'bg-white border-gray-100'
                        } border`}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 p-3 rounded-xl ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
                                        }`}>
                                        <Clock className={`h-6 w-6 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                                            }`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            Pending Reply
                                        </p>
                                        <div className="flex items-baseline">
                                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {pendingReviews}
                                            </p>
                                            <span className={`ml-2 text-sm font-medium ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                                                }`}>
                                                {totalReviews > 0 ? `(${Math.round((pendingReviews / totalReviews) * 100)}%)` : '(0%)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                                    }`}>
                                    {pendingReviews > 0 ? 'Needs Attention' : 'All Caught Up'}
                                </div>
                            </div>
                            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                                }`}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Response Rate
                                    </span>
                                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {totalReviews > 0 ? Math.round(((totalReviews - pendingReviews) / totalReviews) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

      <div className={`bg-gradient-to-br rounded-xl shadow-sm overflow-hidden mx-4 sm:mx-6 lg:mx-8 transition-all duration-300 hover:shadow-md ${
  theme === 'dark' 
    ? 'from-blue-900/30 to-blue-900/10 border-blue-900/20' 
    : 'from-purple-50 to-purple-100 border-purple-100'
} border`}>
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className={`bg-gradient-to-r ${
        theme === 'dark' 
          ? 'from-blue-900/40 to-blue-900/20' 
          : 'from-purple-50 to-purple-100/80'
      }`}>
        <tr>
          <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
            theme === 'dark' ? 'text-blue-200' : 'text-purple-800'
          }`}>
            Review & Response
          </th>
          <th scope="col" className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
            theme === 'dark' ? 'text-blue-200' : 'text-purple-800'
          }`}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody className={`divide-y ${
        theme === 'dark' 
          ? 'from-gray-800/30 to-blue-900/20 divide-blue-900/30' 
          : 'from-white/50 to-purple-50/70 divide-purple-100/50'
      } bg-gradient-to-br`}>
        {loading ? (
          <tr>
            <td colSpan="5" className="px-6 py-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className={`w-8 h-8 animate-spin mb-2 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-purple-500'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-purple-700/70'}>
                  Loading reviews...
                </p>
              </div>
            </td>
          </tr>
        ) : (
          displayReviews.map((review) => renderReviewRow(review))
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className={`px-6 py-4 flex items-center justify-between border-t ${
    theme === 'dark' 
      ? 'bg-gray-800/50 border-gray-700/30' 
      : 'bg-white border-purple-100'
  }`}>
    <div className="flex-1 flex justify-between sm:hidden">
      <button className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
        theme === 'dark'
          ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
          : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
      }`}>
        Previous
      </button>
      <button className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
        theme === 'dark'
          ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
          : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
      }`}>
        Next
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-purple-700/80'
        }`}>
          Showing <span className="font-medium text-purple-900">{displayReviews.length}</span> of{' '}
          <span className="font-medium text-purple-900">{reviews.length}</span> reviews
        </p>
      </div>
      <div>
        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
          <button className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
          }`}>
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            theme === 'dark'
              ? 'border-blue-500 bg-blue-900/30 text-blue-300'
              : 'border-purple-500 bg-purple-50 text-purple-600'
          }`}>
            1
          </button>
          <button className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
              : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
          }`}>
            2
          </button>
          <button className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
              : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
          }`}>
            3
          </button>
          <button className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-purple-200 text-purple-700 bg-white hover:bg-purple-50'
          }`}>
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</div>

            {/* Reply Dialog */}
          {replyDialogOpen && (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden border border-purple-100 dark:border-gray-700">
            {/* Left side - Reply Form */}
            <div className="flex-1 p-6 border-r border-purple-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Reply' : 'Reply to Review'}
                    </h3>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-purple-600 dark:hover:text-gray-300"
                        onClick={() => setReplyDialogOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="reply-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isEditMode ? 'Edit your reply' : 'Your Reply'}
                            </label>
                            <button
                                type="button"
                                onClick={() => generateAIReview()}
                                disabled={isGeneratingAI || !currentReview}
                                className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 dark:text-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-100 dark:border-purple-900/50"
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate with AI
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            id="reply-text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 border border-purple-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 resize-none"
                            placeholder="Type your response or generate one with AI..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setReplyDialogOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={submitReply}
                            disabled={replyLoading || !replyText.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {replyLoading ? (
                                <span className="flex items-center">
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    {isEditMode ? 'Updating...' : 'Sending...'}
                                </span>
                            ) : (
                                isEditMode ? 'Update Reply' : 'Send Reply'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right side - AI Suggestions */}
            <div className="w-full md:w-80 bg-purple-50/50 dark:bg-gray-800/80 border-t md:border-t-0 md:border-l border-purple-100 dark:border-gray-700 p-6 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                        AI Assistant
                    </h4>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isGeneratingAI
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                            {isGeneratingAI ? 'Generating...' : 'Ready'}
                        </span>
                    </div>
                </div>

                {aiSuggestion ? (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-900/50 p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Suggestion</span>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setReplyText(aiSuggestion)}
                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                        title="Use this suggestion"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAiSuggestion('')}
                                        className="text-gray-400 hover:text-purple-500 dark:text-gray-500 dark:hover:text-gray-400"
                                        title="Dismiss"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{aiSuggestion}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => generateAIReview()}
                            disabled={isGeneratingAI}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAI ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 mb-3 border border-purple-200 dark:border-purple-800">
                            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI-Powered Suggestions</h4>
                        <p className="text-xs text-purple-700/80 dark:text-gray-400 mb-4">
                            Click "Generate with AI" to get a suggested response
                        </p>
                        <div className="space-y-3 text-left text-xs text-purple-700/80 dark:text-gray-400">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <p className="ml-2">Personalized based on review content</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <p className="ml-2">Professional and friendly tone</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <p className="ml-2">Customized for your business</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default Reviews;