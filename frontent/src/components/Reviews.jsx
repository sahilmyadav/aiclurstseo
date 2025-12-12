import { 
  Search, MoreVertical, Star, StarHalf, ChevronLeft, ChevronRight, Loader2, 
  ChevronDown, ChevronUp, MessageSquare, MessageSquareText, CheckCircle2, 
  Clock, BarChart2, Star as StarIcon, MessageSquare as MessageSquareIcon,
  X, Sparkles, Copy, RefreshCw, Play, Pause, CheckCircle, TrendingUp, Info
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useAuth } from './context/AuthContext';
import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { generateAIReviewReply } from '../utils/aiReplyGenerator';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';

// Auto-reply Controls Component
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
    <div className="mr-8 ml-8 mb-1 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-md">
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
                                            isAutoReplyMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                                            isAutoReplyMode ? 'translate-x-6' : 'translate-x-0'
                                        }`}></div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {isAutoReplyMode ? 'Auto Reply Mode' : 'Manual Reply Mode'}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Check every
                                </span>
                                <select
                                    value={autoReplyDelay}
                                    onChange={(e) => setAutoReplyDelay(Number(e.target.value))}
                                    className="block w-16 pl-2 pr-6 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
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
            <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 transition-all duration-300 ${
                isAutoReplying ? 'opacity-100' : 'opacity-90'
            }`}>
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
                                <span className="text-gray-700 dark:text-gray-300">
                                    {repliedReviews} of {totalReviews} reviews replied 
                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                        ({Math.round((repliedReviews / totalReviews) * 100 || 0)}%)
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {!isAutoReplying && isAutoReplyMode && (
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            <span>Will reply to all reviews</span>
                        </div>
                    )}
                </div>
                
                {isAutoReplyMode && (
                    <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
                            style={{ width: `${(repliedReviews / totalReviews) * 100 || 0}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const Reviews = () => {
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
                <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors duration-200">
                    <td className="px-6 py-4">
                        <div className="flex flex-col space-y-5">
                            {/* Review Section */}
                            <div className="space-y-3.5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.name}</h4>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(review.rating)}
                                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{review.rating}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                hasReply 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
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
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{review.comment}</p>
                            </div>

                            {/* Response Section */}
                            {hasReply && (
                                <div className="mt-4 ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-900/40">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-50/70 dark:from-blue-900/30 dark:to-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Your Response
                                                </p>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                    {replyDate ? new Date(replyDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : ''}
                                                </p>
                                            </div>
                                            <p className="mt-1.5 text-xs text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-line">
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
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
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
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
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
        <div className="relative">
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeFilter === 'all' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        All Reviews
                    </button>
                    <button
                        onClick={() => setActiveFilter('needsReply')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeFilter === 'needsReply' 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Needs Reply
                    </button>
                    <button
                        onClick={() => setActiveFilter('replied')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeFilter === 'replied' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                                        <MessageSquareText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalReviews}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    All Time
                                </div>
                            </div>
                            {totalReviews > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                                        <StarIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating}</p>
                                            <div className="flex -space-x-1">
                                                {renderStars(averageRating)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                    {averageRating >= 4 ? 'Excellent' : averageRating >= 3 ? 'Good' : 'Needs Work'}
                                </div>
                            </div>
                            {totalReviews > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Based on {totalReviews} reviews</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Replied Reviews */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Replied</p>
                                        <div className="flex items-baseline">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{repliedReviews}</p>
                                            <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                {totalReviews > 0 ? `(${Math.round((repliedReviews / totalReviews) * 100)}%)` : '(0%)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {repliedReviews > 0 ? 'Good Job!' : 'No Replies'}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                                        <Clock className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reply</p>
                                        <div className="flex items-baseline">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingReviews}</p>
                                            <span className="ml-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                                                {totalReviews > 0 ? `(${Math.round((pendingReviews / totalReviews) * 100)}%)` : '(0%)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    {pendingReviews > 0 ? 'Needs Attention' : 'All Caught Up'}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Response Rate</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {totalReviews > 0 ? Math.round(((totalReviews - pendingReviews) / totalReviews) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/20 overflow-hidden mx-4 sm:mx-6 lg:mx-8 transition-all duration-300 hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-900/40 dark:to-blue-900/20">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                                    Review & Response
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gradient-to-br from-white/50 to-blue-50/70 dark:from-gray-800/30 dark:to-blue-900/20 divide-y divide-blue-100/50 dark:divide-blue-900/30">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                            <p className="text-gray-500">Loading reviews...</p>
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
                <div className="bg-white dark:bg-gray-800/50 px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/30">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{displayReviews.length}</span> of{' '}
                            <span className="font-medium">{reviews.length}</span> reviews
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-sm font-medium text-blue-600 dark:text-blue-300">
                                1
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                2
                            </button>
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                3
                            </button>
                            <button className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
                        {/* Left side - Reply Form */}
                        <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isEditMode ? 'Edit Reply' : 'Reply to Review'}
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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
                                            className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                        placeholder="Type your response or generate one with AI..."
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setReplyDialogOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitReply}
                                        disabled={replyLoading || !replyText.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800/50 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto max-h-[80vh]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    AI Assistant
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        isGeneratingAI 
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                        {isGeneratingAI ? 'Generating...' : 'Ready'}
                                    </span>
                                </div>
                            </div>
                            
                            {aiSuggestion ? (
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-900/50 p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Suggestion</span>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setReplyText(aiSuggestion)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Use this suggestion"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAiSuggestion('')}
                                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
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
                                        className="w-full flex items-center justify-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                                        <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI-Powered Suggestions</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Click "Generate with AI" to get a suggested response
                                    </p>
                                    <div className="space-y-3 text-left text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <p className="ml-2">Personalized based on review content</p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <p className="ml-2">Professional and friendly tone</p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-500">
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