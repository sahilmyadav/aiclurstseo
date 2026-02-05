import { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { MessageSquareText, MessageSquare, X, Sparkles, Loader2, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import axios from 'axios';
import { generateAIReviewReply } from '../utils/aiReplyGenerator';

const SimpleReviews = () => {
  const { reviews, selectedBusiness, tokenDetails, selectBusiness } = useGoogleBusiness();
  const { user, token, toggleAutoReply } = useAuth();
  const { theme } = useTheme();
  const [isAutoReplyOn, setIsAutoReplyOn] = useState(user?.autoReply || false);
  // Add new state for reply functionality
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentReview, setCurrentReview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  // Add AI suggestion state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  // Add auto-reply timer state
  const [nextCheckTime, setNextCheckTime] = useState(null);
  const [autoReplyDelay, setAutoReplyDelay] = useState(5); // Default 5 minutes
  // Add countdown timer state
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  // Add backend last run time
  const [lastRunTime, setLastRunTime] = useState(null);
  // Add tabs state
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'replied', 'needReply'

  // Filter reviews based on active tab
  const filteredReviews = reviews?.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'replied') return review.reviewReply !== undefined;
    if (activeTab === 'needReply') return review.reviewReply === undefined;
    return true;
  }) || [];

  useEffect(() => {
    setIsAutoReplyOn(user?.autoReply || false);
    // Fetch last run time from backend when auto-reply is enabled
    if (user?.autoReply) {
      fetchLastRunTime();
    } else {
      setLastRunTime(null);
      setNextCheckTime(null);
    }
  }, [user?.autoReply]);

  // Fetch last run time from backend
  const fetchLastRunTime = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auto-reply/last-run/${user?._id || user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Set last run time
        if (data.lastRunTime) {
          setLastRunTime(new Date(data.lastRunTime));
        } else {
          setLastRunTime(null);
        }
        
        // Set next run time from backend
        if (data.nextRunTime) {
          setNextCheckTime(new Date(data.nextRunTime));
        } else {
          // If no next run time, set to 5 minutes from now
          const now = new Date();
          setNextCheckTime(new Date(now.getTime() + autoReplyDelay * 60000));
        }
      } else {
        // Fallback to current time
        const now = new Date();
        setLastRunTime(now);
        setNextCheckTime(new Date(now.getTime() + autoReplyDelay * 60000));
      }
    } catch (error) {
      console.error('Error fetching last run time:', error);
      // Fallback to current time
      const now = new Date();
      setLastRunTime(now);
      setNextCheckTime(new Date(now.getTime() + autoReplyDelay * 60000));
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!nextCheckTime) {
      setTimeLeft({ minutes: 0, seconds: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextCheckTime - now;
      
      if (diff <= 0) {
        // Timer reached zero, fetch updated times from backend
        fetchLastRunTime();
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCheckTime, autoReplyDelay]);

  const handleAutoReplyToggle = async () => {
    try {
      const result = await toggleAutoReply();
      if (result.success) {
        setIsAutoReplyOn(result.autoReply);
        toast.success(`Auto-reply ${result.autoReply ? 'enabled' : 'disabled'}`);
        
        // Fetch last run time when enabling auto-reply
        if (result.autoReply) {
          fetchLastRunTime();
        } else {
          setNextCheckTime(null);
          setTimeLeft({ minutes: 0, seconds: 0 });
          setLastRunTime(null);
        }
        
        // Send data to backend auto-reply setup
        if (result.autoReply && selectedBusiness) {
          const payload = {
            userId: user?._id || user?.id,
            locationId: selectedBusiness.name?.split('/')[1],
            accountId: selectedBusiness.accountId,
            tokenDetails: {
              accessToken: tokenDetails?.accessToken,
              refreshToken: tokenDetails?.refreshToken,
              expiryDate: tokenDetails?.expiryDate
            }
          };
          
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auto-reply/setup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          
          const data = await response.json();
          if (data.success) {
            toast.success('Auto-reply configuration saved');
          } else {
            toast.error(data.message || 'Failed to save auto-reply configuration');
          }
        }
      } else {
        toast.error(result.error || 'Failed to update auto-reply setting');
      }
    } catch (error) {
      console.error('Error toggling auto-reply:', error);
      toast.error('Failed to update auto-reply setting');
    }
  };

  // Add reply functionality
  const handleReply = (review) => {
    setCurrentReview(review);
    setReplyText('');
    setIsEditMode(false);
    setReplyLoading(false);
    setAiSuggestion('');
    setReplyDialogOpen(true);
  };

  const handleEditReply = (review) => {
    setCurrentReview(review);
    setReplyText(review.reviewReply?.comment || '');
    setIsEditMode(true);
    setReplyLoading(false);
    setAiSuggestion('');
    setReplyDialogOpen(true);
  };

  // Add AI suggestion generation
  const generateAIReview = async () => {
    if (!currentReview) return;

    setIsGeneratingAI(true);
    setAiSuggestion('');

    try {
      const businessName = selectedBusiness?.title || selectedBusiness?.locationName || 'our business';
      const businessType = selectedBusiness?.primaryCategory?.displayName ||
        selectedBusiness?.categories?.primaryCategory?.displayName || 'business';

      const reviewText = currentReview.comment || '';
      const rating = currentReview.starRating === 'ONE' ? 1 :
        currentReview.starRating === 'TWO' ? 2 :
        currentReview.starRating === 'THREE' ? 3 :
        currentReview.starRating === 'FOUR' ? 4 : 5;

      const aiReply = await generateAIReviewReply(
        reviewText,
        businessType,
        'professional',
        isEditMode,
        rating,
        businessName
      );

      setAiSuggestion(aiReply);
      // Automatically update the reply text with the AI suggestion
      setReplyText(aiReply);
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast.error('Failed to generate AI reply. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !currentReview || !selectedBusiness) return;

    setReplyLoading(true);
    try {
      // Extract account ID and location ID from selected business
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name.split("/")[1];
      const reviewId = currentReview.name.split("/").pop();

      // Get Google OAuth tokens from localStorage
      const oauthKey = `google_oauth_tokens_${user?.id || 'guest'}`;
      const oauthTokens = JSON.parse(localStorage.getItem(oauthKey) || '{}');

      // Create axios instance
      const api = axios.create({
        baseURL: (import.meta.env.VITE_API_BASE || '').replace(/\/$/, ''),
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

      // Submit reply
      const response = await api.post(`/api/reviews/reply?${params}`, {
        comment: replyText,
        accountId,
        locationId,
        reviewId
      });

      // Show success message
      if (isEditMode) {
        toast.success('Reply updated successfully!');
      } else {
        toast.success('Reply sent successfully!');
      }

      // Reset UI state
      setReplyLoading(false);
      setReplyDialogOpen(false);
      setReplyText('');
      setAiSuggestion('');
      setCurrentReview(null);

      // Refresh reviews
      await selectBusiness(selectedBusiness);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to send reply. Please try again.');
      setReplyLoading(false);
      setReplyDialogOpen(false);
      setReplyText('');
      setAiSuggestion('');
      setCurrentReview(null);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`p-6 max-w-6xl mx-auto min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] text-gray-900'
    }`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Reviews Management
        </h1>
        
        {/* Auto-reply Toggle with Timer */}
        <div className={`rounded-2xl p-6 shadow-lg mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] bg-blue-200 backdrop-blur-sm border border-gray-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className={`font-bold text-lg ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Auto Reply System
              </h3>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Automatically respond to new reviews with AI-generated responses
              </p>
              {/* Timer display when auto-reply is on */}
              {isAutoReplyOn && nextCheckTime && (
                <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} shadow-inner`}>
                  {/* Last run time */}
                  {lastRunTime && (
                    <div className="flex items-center text-sm mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className={theme === 'dark' ? 'text-green-400' : 'text-green-700'}>
                        Last run: {formatDate(lastRunTime)}
                      </span>
                    </div>
                  )}
                  {/* Next check time */}
                  <div className="flex items-center text-sm mb-4">
                    <Clock className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-800 font-medium'}>
                      Next check at {formatTime(nextCheckTime)}
                    </span>
                  </div>
                  {/* Countdown timer - Larger and more prominent */}
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                        <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-red-600'}`}>Time until next check</div>
                        <div className="flex items-baseline">
                          <span className={`text-2xl font-bold font-mono ${
                            theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                          }`}>
                            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                          </span>
                          <span className={`ml-1 text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAutoReplyOn}
                onChange={handleAutoReplyToggle}
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"></div>
              <span className={`ml-4 text-base font-semibold ${
                isAutoReplyOn 
                  ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')
                  : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
              }`}>
                {isAutoReplyOn ? 'AUTO' : 'MANUAL'}
              </span>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className={`rounded-2xl p-2 mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? (theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg')
                  : (theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-purple-700')
              }`}
            >
              All Reviews
              <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                activeTab === 'all'
                  ? (theme === 'dark' ? 'bg-white/20' : 'bg-white/20')
                  : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
              }`}>
                {reviews?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('replied')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'replied'
                  ? (theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg')
                  : (theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-green-700')
              }`}
            >
              Replied
              <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                activeTab === 'replied'
                  ? (theme === 'dark' ? 'bg-white/20' : 'bg-white/20')
                  : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
              }`}>
                {reviews?.filter(r => r.reviewReply !== undefined).length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('needReply')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'needReply'
                  ? (theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg')
                  : (theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-orange-700')
              }`}
            >
              Need Reply
              <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                activeTab === 'needReply'
                  ? (theme === 'dark' ? 'bg-white/20' : 'bg-white/20')
                  : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
              }`}>
                {reviews?.filter(r => r.reviewReply === undefined).length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div 
              key={review.name} 
              className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`font-bold text-lg mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-purple-900'
                  }`}>
                    {review.reviewer?.displayName || 'Anonymous Reviewer'}
                  </h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < (review.starRating === 'ONE' ? 1 : review.starRating === 'TWO' ? 2 : review.starRating === 'THREE' ? 3 : review.starRating === 'FOUR' ? 4 : 5) 
                          ? 'text-yellow-400' 
                          : (theme === 'dark' ? 'text-gray-600' : 'text-gray-300')}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className={`ml-2 text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {review.starRating === 'ONE' ? 1 : 
                       review.starRating === 'TWO' ? 2 : 
                       review.starRating === 'THREE' ? 3 : 
                       review.starRating === 'FOUR' ? 4 : 5} 
                      stars
                    </span>
                  </div>
                </div>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(review.createTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <p className={`mt-2 text-base leading-relaxed mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {review.comment}
              </p>
              
              {review.reviewReply ? (
                <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 border-blue-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 mt-0.5 flex items-center justify-center rounded-full bg-blue-500 flex-shrink-0">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        Response
                      </p>
                      <p className={`text-base leading-relaxed ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {review.reviewReply.comment}
                      </p>
                      {review.reviewReply.updateTime && (
                        <span className={`inline-block mt-2 text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Replied on {new Date(review.reviewReply.updateTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`mt-4 p-4 rounded-lg border border-dashed ${
                  theme === 'dark' 
                    ? 'bg-orange-900/30 border-orange-700' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <p className={`text-center font-medium flex items-center justify-center gap-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    No response yet - Auto-reply will generate a response
                  </p>
                </div>
              )}

              {/* Add Reply/Edit Buttons */}
              <div className="mt-4 flex justify-end">
                {review.reviewReply ? (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    onClick={() => handleEditReply(review)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Edit Reply
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    onClick={() => handleReply(review)}
                  >
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-16 rounded-xl shadow-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] border border-gray-200 shadow-sm'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className={`mt-4 text-lg font-medium ${
              theme === 'dark' ? 'text-white' : 'text-purple-900'
            }`}>
              {activeTab === 'all' && 'No reviews found'}
              {activeTab === 'replied' && 'No replied reviews'}
              {activeTab === 'needReply' && 'All reviews replied!'}
            </h3>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {activeTab === 'all' && 'There are no reviews for this location yet.'}
              {activeTab === 'replied' && 'No reviews have been replied to yet.'}
              {activeTab === 'needReply' && 'Great job! All reviews have been responded to.'}
            </p>
          </div>
        )}
      </div>

      {/* Reply Dialog with AI Suggestions */}
      {replyDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            {/* Left side - Reply Form */}
            <div className={`flex-1 p-6 border-r ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-purple-900'
                }`}>
                  {isEditMode ? 'Edit Reply' : 'Reply to Review'}
                </h3>
                <button
                  type="button"
                  className={`${
                    theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'
                  }`}
                  onClick={() => setReplyDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="reply-text" className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {isEditMode ? 'Edit your reply' : 'Your Reply'}
                    </label>
                    <button
                      type="button"
                      onClick={generateAIReview}
                      disabled={isGeneratingAI || !currentReview}
                      className={`inline-flex items-center text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === 'dark' 
                          ? 'bg-blue-900/50 hover:bg-blue-900 text-blue-300 border border-blue-800' 
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100'
                      }`}
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
                    className={`w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Type your response or generate one with AI..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReplyDialogOpen(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
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
            <div className={`w-full md:w-80 p-6 overflow-y-auto max-h-[80vh] ${
              theme === 'dark' 
                ? 'bg-gray-800/80 border-t md:border-t-0 md:border-l border-gray-700' 
                : 'bg-blue-50 border-t md:border-t-0 md:border-l border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-sm font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  AI Assistant
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isGeneratingAI
                      ? (theme === 'dark' 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-yellow-100 text-yellow-800')
                      : (theme === 'dark' 
                          ? 'bg-blue-900/50 text-blue-300' 
                          : 'bg-blue-100 text-blue-800')
                  }`}>
                    {isGeneratingAI ? 'Generating...' : 'Ready'}
                  </span>
                </div>
              </div>

              {aiSuggestion ? (
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 shadow-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border border-purple-800' 
                      : 'bg-white border border-purple-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                      }`}>
                        Suggestion
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setReplyText(aiSuggestion)}
                          className={`${
                            theme === 'dark' 
                              ? 'text-purple-400 hover:text-purple-300' 
                              : 'text-purple-600 hover:text-purple-800'
                          }`}
                          title="Use this suggestion"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiSuggestion('')}
                          className={`${
                            theme === 'dark' 
                              ? 'text-gray-500 hover:text-gray-400' 
                              : 'text-gray-400 hover:text-purple-500'
                          }`}
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm whitespace-pre-line ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {aiSuggestion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={generateAIReview}
                    disabled={isGeneratingAI}
                    className={`w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark' 
                        ? 'text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50' 
                        : 'text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100'
                    }`}>
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
                  <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-3 border ${
                    theme === 'dark' 
                      ? 'bg-purple-900/30 border-purple-800' 
                      : 'bg-purple-100 border-purple-200'
                  }`}>
                    <Sparkles className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <h4 className={`text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-purple-900'
                  }`}>
                    AI-Powered Suggestions
                  </h4>
                  <p className={`text-xs mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-purple-700/80'
                  }`}>
                    Click "Generate with AI" to get a suggested response
                  </p>
                  <div className="space-y-3 text-left text-xs">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 ${
                        theme === 'dark' ? 'text-purple-500' : 'text-purple-500'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <p className={`ml-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-purple-700/80'
                      }`}>
                        Personalized based on review content
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 ${
                        theme === 'dark' ? 'text-purple-500' : 'text-purple-500'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <p className={`ml-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-purple-700/80'
                      }`}>
                        Professional and friendly tone
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 ${
                        theme === 'dark' ? 'text-purple-500' : 'text-purple-500'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <p className={`ml-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-purple-700/80'
                      }`}>
                        Customized for your business
                      </p>
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

export default SimpleReviews;