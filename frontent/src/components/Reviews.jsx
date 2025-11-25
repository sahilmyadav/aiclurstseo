import { 
  Search, MoreVertical, Star, StarHalf, ChevronLeft, ChevronRight, Loader2, 
  ChevronDown, ChevronUp, MessageSquare, MessageSquareText, CheckCircle2, 
  Clock, BarChart2, Star as StarIcon, MessageSquare as MessageSquareIcon,
  X, Sparkles, Copy, RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { generateAIReviewReply } from '../utils/aiReplyGenerator';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';

const Reviews = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [currentReview, setCurrentReview] = useState(null);
    const [replyLoading, setReplyLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'replied', 'needsReply'
    const { 
      reviews, 
      selectedBusiness, 
      selectedBusinesses, // Add this
      businesses, 
      loading, 
      selectBusiness, 
      selectMultipleBusinesses, // Add this
      tokenDetails 
    } = useGoogleBusiness();
    
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
    
    const filteredReviews = reviews?.filter(review => {
        // Apply search filter
        const matchesSearch = 
            review.reviewer?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.starRating?.toString().includes(searchQuery);
            
        // Apply status filter
        const hasReply = !!review.reviewReply?.comment;
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

    // Calculate review statistics - always use all reviews, not filtered ones
    const totalReviews = reviews?.length || 0;
    const repliedReviews = reviews?.filter(review => review.reviewReply?.comment).length || 0;
    const pendingReviews = totalReviews - repliedReviews;
    
    // Calculate average rating from all reviews
    const averageRating = reviews?.length > 0 
        ? (reviews.reduce((sum, review) => sum + (parseFloat(review.starRating) || 0), 0) / reviews.length).toFixed(1)
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
        setAiSuggestion('');
        setIsEditMode(false);
        setReplyLoading(false);
        setReplyDialogOpen(true);
    };

    // Handle edit button click
    const handleEditReply = (review) => {
        setCurrentReview(review);
        setReplyText(review.reply || '');
        setAiSuggestion('');
        setIsEditMode(true);
        setReplyLoading(false);
        setReplyDialogOpen(true);
    };

    // Generate AI reply for the current review
    const generateAIReply = async () => {
        if (!currentReview || !selectedBusiness) return;

        setIsGeneratingAI(true);
        setAiSuggestion('');
        try {
            const reply = await generateAIReviewReply(
                currentReview.comment,
                selectedBusiness.categories?.join(', ') || 'business',
                'professional',
                isEditMode,
                currentReview.rating,
                selectedBusiness.title || selectedBusiness.locationName
            );
            
            setAiSuggestion(reply);
            toast.success('AI reply generated!');
        } catch (error) {
            console.error('Error generating AI reply:', error);
            toast.error(error.message || 'Failed to generate AI reply');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Copy AI suggestion to reply text
    const copyAISuggestion = () => {
        if (aiSuggestion) {
            setReplyText(aiSuggestion);
            // Add visual feedback
            const copyButton = document.querySelector('.copy-ai-suggestion');
            if (copyButton) {
                copyButton.innerHTML = '<CheckCircle2 className="w-4 h-4" />';
                copyButton.classList.remove('text-blue-600', 'dark:text-blue-400');
                copyButton.classList.add('text-green-600', 'dark:text-green-400');
                
                // Revert back after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = '<Copy className="w-4 h-4" />';
                    copyButton.classList.add('text-blue-600', 'dark:text-blue-400');
                    copyButton.classList.remove('text-green-600', 'dark:text-green-400');
                }, 2000);
            }
            toast.success('Reply copied to text area', {
                duration: 2000,
                position: 'top-center',
            });
        } else {
            toast.error('No AI suggestion to copy', {
                duration: 2000,
                position: 'top-center',
            });
        }
    };

    const handleSubmitReply = async (reviewId, replyText) => {
        setReplyLoading(true);
        try {
            // Submit the reply to Google
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/google/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reviewId,
                    comment: replyText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit reply');
            }

            // Show success toast
            toast.success('Reply sent successfully!');
            
            // Always reset UI state regardless of response
            setReplyLoading(false);
            setReplyDialogOpen(false);
            setReplyText('');
            
            // Refresh reviews to show the new reply
            if (selectedBusinesses && selectedBusinesses.length > 0) {
                // For multiple selections, use the first one
                await selectBusiness(selectedBusinesses[0]);
            } else if (selectedBusiness) {
                await selectBusiness(selectedBusiness);
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            // Show error toast
            toast.error('Failed to send reply. Please try again.');
            
            // Always reset UI state even on error
            setReplyLoading(false);
            setReplyDialogOpen(false);
            setReplyText('');
            
            // Refresh reviews to show any changes
            if (selectedBusinesses && selectedBusinesses.length > 0) {
                // For multiple selections, use the first one
                await selectBusiness(selectedBusinesses[0]);
            } else if (selectedBusiness) {
                await selectBusiness(selectedBusiness);
            }
        }
    };

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
                                            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            {/* Business Profile Dropdown */}
            <div className="mt-5 mb-8 mx-4 sm:mx-6 lg:mx-8">
                <BusinessProfileDropdown 
                    multiple={selectedBusinesses && selectedBusinesses.length > 1}
                />
            </div>

            {/* Stats Cards */}
            <div className="mx-4 sm:mx-6 lg:mx-8 mb-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Reviews */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/20 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500/10 dark:bg-blue-500/20 p-3 rounded-lg">
                                    <MessageSquareText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
                                    <div className="flex items-baseline">
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalReviews}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/20 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-amber-500/10 dark:bg-amber-500/20 p-3 rounded-lg">
                                    <StarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{averageRating}</p>
                                        <div className="flex">
                                            {renderStars(averageRating)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Replied Reviews */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 rounded-xl shadow-sm border border-green-100 dark:border-green-900/20 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500/10 dark:bg-green-500/20 p-3 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Replied</p>
                                    <div className="flex items-baseline">
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{repliedReviews}</p>
                                        <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                                            {totalReviews > 0 ? `(${Math.round((repliedReviews / totalReviews) * 100)}%)` : '(0%)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Reviews */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/20 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-orange-500/10 dark:bg-orange-500/20 p-3 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reply</p>
                                    <div className="flex items-baseline">
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingReviews}</p>
                                        <span className="ml-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                                            {totalReviews > 0 ? `(${Math.round((pendingReviews / totalReviews) * 100)}%)` : '(0%)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 sm:px-6 lg:px-8 mb-6">
                <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-full">
                    {[
                        { id: 'all', label: 'All Reviews' },
                        { id: 'replied', label: 'Replied' },
                        { id: 'needsReply', label: 'Needs Reply' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                                activeFilter === tab.id
                                    ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                        >
                            <span className="flex items-center">
                                {tab.label}
                                {tab.id === 'replied' && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {repliedReviews}
                                    </span>
                                )}
                                {tab.id === 'needsReply' && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                        {pendingReviews}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {isEditMode ? 'Edit Reply' : 'Reply to Review'}
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500"
                                    onClick={() => {
                                        setReplyDialogOpen(false);
                                        setAiSuggestion('');
                                    }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            {/* Review Preview */}
                            <div className="md:w-1/2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review</h4>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                                    <div className="flex items-center mb-2">
                                        <div className="flex items-center">
                                            {renderStars(currentReview?.rating || 0)}
                                        </div>
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                            {currentReview?.name || 'Anonymous'}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                                        {currentReview?.comment}
                                    </p>
                                </div>
                                
                                <div className="mt-4">
                                    <label htmlFor="reply-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Response
                                    </label>
                                    <textarea
                                        id="reply-text"
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Type your response here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            
                            {/* AI Suggestion Box */}
                            <div className="md:w-1/2">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 h-full border border-blue-200 dark:border-blue-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            AI Reply Assistant
                                        </h4>
                                        <button
                                            onClick={generateAIReply}
                                            disabled={isGeneratingAI}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                    Generate Suggestion
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {aiSuggestion ? (
                                        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                {aiSuggestion}
                                            </div>
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <button
                                                    onClick={copyAISuggestion}
                                                    className="copy-ai-suggestion p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    title="Copy to reply"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-center h-64">
                                            <Sparkles className="w-8 h-8 text-gray-400 mb-2" />
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                AI-Powered Reply Suggestion
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                Click "Generate Suggestion" to get AI-generated response
                                            </p>
                                            <button
                                                onClick={generateAIReply}
                                                disabled={isGeneratingAI}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                {isGeneratingAI ? 'Generating...' : 'Generate Suggestion'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyDialogOpen(false);
                                    setAiSuggestion('');
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitReply}
                                disabled={replyLoading || !replyText.trim()}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {replyLoading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Sending...
                                    </span>
                                ) : (
                                    isEditMode ? 'Update Reply' : 'Send Reply'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;