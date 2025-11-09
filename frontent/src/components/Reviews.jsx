import { 
  Search, MoreVertical, Star, StarHalf, ChevronLeft, ChevronRight, Loader2, 
  ChevronDown, ChevronUp, MessageSquare, MessageSquareText, CheckCircle2, 
  Clock, BarChart2, Star as StarIcon, MessageSquare as MessageSquareIcon,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const Reviews = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [currentReview, setCurrentReview] = useState(null);
    const [replyLoading, setReplyLoading] = useState(false);
    const { reviews, selectedBusiness, businesses, loading, selectBusiness, tokenDetails } = useGoogleBusiness();
    
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
        setShowBusinessDropdown(false);
    };

    const filteredReviews = reviews?.filter(review =>
        review.reviewer?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.starRating?.toString().includes(searchQuery)
    ) || [];

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

    // Calculate review statistics
    const totalReviews = displayReviews.length;
    const repliedReviews = displayReviews.filter(review => 
        !!review.reply || (review.reviewData?.reviewReply?.comment)
    ).length;
    const pendingReviews = totalReviews - repliedReviews;
    const averageRating = displayReviews.length > 0 
        ? (displayReviews.reduce((sum, review) => sum + review.rating, 0) / displayReviews.length).toFixed(1)
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
        setReplyLoading(false); // Reset loading state when opening dialog
        setReplyDialogOpen(true);
    };

    // Submit reply to backend
    const submitReply = async () => {
        if (!replyText.trim() || !currentReview || !selectedBusiness) return;

        setReplyLoading(true);
        try {
            // Extract account ID and location ID from selected business
            const accountId = selectedBusiness.accountId;
            const locationId = selectedBusiness.name.split("/")[1];
            const reviewId = currentReview.reviewData.name.split("/").pop();
            
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

            const response = await api.post('/api/reviews/reply', {
                comment: replyText,
                accountId,
                locationId,
                reviewId,
                accessToken: tokenDetails?.accessToken
            });
            
            console.log('Response:', response.data);

            // Show success toast
            toast.success('Reply sent successfully!');
            
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
        <div className="mt- mb-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="relative mt-5 inline-block text-left w-full max-w-md">
                <div>
                    <button
                        type="button"
                        className="inline-flex justify-between items-center w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm px-4 py-3 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                    >
                        <span className="truncate">
                            {selectedBusiness ? (selectedBusiness.title || selectedBusiness.locationName) : 'Select a business'}
                        </span>
                        <svg className="ml-2 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {showBusinessDropdown && (
                    <div className="origin-top-right absolute left-0 mt-1 w-full rounded-lg shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-white/10 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            {businesses && businesses.length > 0 ? (
                                businesses.map((business) => (
                                    <button
                                        key={business.name}
                                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                                        onClick={() => handleBusinessSelect(business)}
                                    >
                                        {business.title || business.locationName}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">No businesses found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

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
                                        // handleEditReply(review.id);
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
                <div className="fixed inset-0 bg-opacity-50 flex items-center backdrop-blur-sm justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reply to Review</h3>
                                <button 
                                    onClick={() => setReplyDialogOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Response
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your response to this review..."
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setReplyDialogOpen(false)}
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
                                    'Send Reply'
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