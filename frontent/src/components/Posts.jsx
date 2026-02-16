import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "./SideNav";
import { useSidebar } from "./context/SidebarContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MyScheduledPosts from "./MyScheduledPosts";
import BusinessProfileDropdown from "./common/BusinessProfileDropdown";
import {
  FaGoogle,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSpinner,
  FaCheckCircle,
  FaSync,
  FaInfoCircle,
  FaRobot
} from "react-icons/fa";
import { generateAIPost } from '../utils/suggestion';
import { toast } from 'sonner';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Get BACKEND_URL from environment variables with fallback
const BACKEND_URL = import.meta.env.VITE_API_BASE

// Validate BACKEND_URL
if (!BACKEND_URL) {
  console.error('BACKEND_URL is not defined. Please set VITE_BACKEND_URL in your .env file.');
  toast.error('Configuration error: BACKEND_URL is not defined');
}

const PostCard = ({ post, onEdit, onDelete, selectedBusiness }) => {
  const { theme } = useTheme();

  // console.log("BACKEND_URL  ",BACKEND_URL);
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  // Get business name from the selected business in the dropdown
  const displayBusinessName = selectedBusiness?.title ||
    selectedBusiness?.locationName ||
    selectedBusiness?.name?.split('/').pop() ||
    'Business';

  return (
    <div className={`rounded-xl p-4 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-[#1a1b2e] to-[#121324] border border-white/5 hover:border-blue-500/30'
      : 'bg-white border border-gray-200 hover:border-blue-500/30'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shadow-inner ${theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
            : 'bg-blue-100'}`}>
            <FaGoogle className={`text-lg ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div>
            <div className="flex items-center">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${theme === 'dark'
                ? 'text-blue-300 bg-blue-500/20 border-blue-400/20'
                : 'text-blue-700 bg-blue-100 border-blue-200'}`}>
                {displayBusinessName}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="pl-1">
        <p className={`text-sm leading-relaxed mb-3 line-clamp-3 ${theme === 'dark' ? 'text-white/90' : 'text-gray-700'}`}>
          {post.content}
        </p>
        {post.media && (
          <div className={`mt-2 w-full h-36 rounded-lg flex items-center justify-center overflow-hidden ${theme === 'dark'
            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-white/5'
            : 'bg-blue-50 border border-gray-200'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className={`text-xs px-3 py-1.5 rounded-full backdrop-blur-sm ${theme === 'dark'
              ? 'text-white/70 bg-black/40'
              : 'text-gray-600 bg-gray-200'}`}>
              View Media
            </span>
          </div>
        )}
        <div className={`mt-3 pt-2 text-xs space-y-1.5 ${theme === 'dark'
          ? 'border-t border-white/5 text-white/50'
          : 'border-t border-gray-200 text-gray-500'}`}>
          {post.status === 'scheduled' ? (
            <>
              <div className="flex items-center gap-1.5">
                <FaCalendarAlt className={`flex-shrink-0 ${theme === 'dark' ? 'text-blue-400/80' : 'text-blue-500'}`} />
                <span>
                  {post.isRecurring ? 'Next run: ' : 'Scheduled for: '}
                  {formatDate(post.nextRun || post.scheduledFor)}
                </span>
              </div>
              {post.isRecurring && (
                <div className="flex items-start gap-1.5">
                  <FaSync className={`mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400/80' : 'text-blue-500'}`} />
                  <div>
                    <div>Recurring: {post.repeatType}</div>
                    {post.lastRun && (
                      <div className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>
                        Last run: {formatDate(post.lastRun)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-blue-300/80' : 'text-blue-600'}`}>
                <FaInfoCircle className="flex-shrink-0" />
                <span>{post.statusFromApi === 'pending' ? 'Pending' : 'Scheduled'}</span>
              </div>
            </>
          ) : post.status === 'published' ? (
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className={`flex-shrink-0 ${theme === 'dark' ? 'text-green-400/80' : 'text-green-500'}`} />
              <span>Posted on {formatDate(post.postedAt)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <FaEdit className={`flex-shrink-0 ${theme === 'dark' ? 'text-amber-400/80' : 'text-amber-500'}`} />
              <span className={theme === 'dark' ? 'text-amber-400/80' : 'text-amber-500'}>
                Draft - Not published
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Posts = () => {
  const { isCollapsed } = useSidebar();
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const {
    isConnected: isGoogleConnected,
    businesses,
    selectedBusiness,
    selectedBusinesses,
    selectBusiness,
    selectMultipleBusinesses,
    scheduledPosts,
    loadingScheduled
  } = useGoogleBusiness();

  const [activeTab, setActiveTab] = useState('published');
  const [showEditor, setShowEditor] = useState(false);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    hasMore: false,
    nextPageToken: null,
    loadingMore: false,
    pageSize: 20,
    totalItems: 0,
    currentPage: 1
  });
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const navigate = useNavigate();

  const [currentPost, setCurrentPost] = useState({
    id: null,
    content: '',
    scheduledFor: null,
    media: null,
    isRecurring: false,
    frequency: 'daily',
    time: '09:00',
    days: [1, 2, 3, 4, 5],
    keywords: '',
    keywordsArray: []
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);

  const fetchPosts = async (accountId, locationId, loadMore = false) => {
    if (loadMore) {
      setPagination(prev => ({ ...prev, loadingMore: true }));
    } else {
      setIsLoadingPosts(true);
    }

    try {
      // Ensure BACKEND_URL is defined and doesn't end with a slash
      if (!BACKEND_URL) {
        throw new Error('BACKEND_URL is not defined');
      }

      const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;

      // Get Google OAuth tokens from localStorage
      const oauthKey = `google_oauth_tokens_${authUser?.id || 'guest'}`;
      const oauthTokens = JSON.parse(localStorage.getItem(oauthKey) || '{}');

      // Build URL with pagination and OAuth parameters
      const params = new URLSearchParams({
        pageSize: pagination.pageSize,
        ...(loadMore && pagination.nextPageToken && { pageToken: pagination.nextPageToken }),
        ...(oauthTokens.access_token && { access_token: oauthTokens.access_token }),
        ...(oauthTokens.refresh_token && { refresh_token: oauthTokens.refresh_token }),
        ...(oauthTokens.expiry_date && { expiry_date: oauthTokens.expiry_date })
      });

      const url = `${baseUrl}/auth/google/accounts/${accountId}/locations/${locationId}/localPosts?${params}`;

      // console.log(`🔄 Fetching posts from:`, url);

      const postsResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!postsResponse.ok) {
        let errorMessage = 'Failed to fetch posts';
        try {
          const errorData = await postsResponse.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(`${errorMessage} (Status: ${postsResponse.status})`);
      }

      const responseData = await postsResponse.json();
      // console.log('✅ Posts fetched successfully:', responseData);

      // Get business details from the context
      const business = selectedBusiness || (businesses && businesses[0]);
      const businessName = business?.locationName || business?.name?.split('/').pop() || 'Business';

      // Handle both response formats
      const postsList = responseData.localPosts || responseData.posts || [];
      const nextPageToken = responseData.nextPageToken || null;
      const totalItems = responseData.totalItems || 0;

      // Update pagination state
      setPagination(prev => ({
        ...prev,
        hasMore: !!nextPageToken,
        nextPageToken,
        loadingMore: false,
        totalItems,
        currentPage: loadMore ? prev.currentPage + 1 : 1
      }));

      const formattedPosts = postsList.map((post) => {
        const statusFromApi = (post.state || post.status || 'published').toLowerCase();

        let normalizedStatus = 'drafts';
        if (statusFromApi === 'live' || statusFromApi === 'posted' || statusFromApi === 'processing') {
          normalizedStatus = 'published';
        } else if (statusFromApi === 'scheduled') {
          normalizedStatus = 'scheduled';
        }

        // Get the business name from the selected business or use the one from the post
        const postBusinessName = selectedBusiness?.locationName ||
          selectedBusiness?.name?.split('/').pop() ||
          businessName;

        return {
          id: post.name || post.id,
          content: post.summary || post.content,
          status: normalizedStatus,
          statusFromApi: statusFromApi,
          scheduledFor: post.createTime || post.scheduledFor || new Date().toISOString(),
          postedAt: post.createTime || post.postedAt || new Date().toISOString(),
          platform: 'google',
          media: post.media?.[0]?.sourceUrl || post.mediaUrl || null,
          businessName: postBusinessName,
          businessId: selectedBusiness?.id || null,
          locationId: locationId
        };
      });

      // Update posts state based on whether we're loading more or refreshing
      if (loadMore) {
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
      } else {
        setPosts(formattedPosts);
      }

      // console.log(`📊 ${loadMore ? 'Added' : 'Loaded'} ${formattedPosts.length} posts`);
      return formattedPosts;
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      setPosts([]);
      return [];
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isGoogleConnected && businesses && businesses.length > 0) {
      const business = selectedBusiness || businesses[0];
      setBusinessDetails(business);

      if (business && business.name) {
        const locationId = business.name.split('/')[1];
        fetchPosts(business.accountId, locationId);
      }
    }
  }, [isGoogleConnected, businesses, selectedBusiness]);

  useEffect(() => {
    if (selectedBusiness) {
      const autoKeywords = getAutoKeywords();
      // console.log('Auto keywords for selected business:', autoKeywords);

      setCurrentPost(prev => ({
        ...prev,
        keywordsArray: [...autoKeywords],
        keywords: ''
      }));
    }
  }, [selectedBusiness]);

  // In Posts.jsx, update the getAutoKeywords function to include the address
  // In Posts.jsx, update the getAutoKeywords function
  const getAutoKeywords = () => {
    const autoKeywords = [];

    if (!selectedBusiness) return autoKeywords;

    // Add business name as a keyword
    if (selectedBusiness.title) {
      const cleanName = selectedBusiness.title
        .replace(/[^\w\s-]/g, '') // Keep hyphens
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanName) {
        autoKeywords.push(cleanName);
      }
    }

    // Add primary category
    if (selectedBusiness.categories?.primaryCategory?.displayName) {
      const cleanCategory = selectedBusiness.categories.primaryCategory.displayName
        .replace(/[^\w\s-]/g, '') // Keep hyphens
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanCategory && !autoKeywords.includes(cleanCategory)) {
        autoKeywords.push(cleanCategory);
      }
    }

    // Add address from storefrontAddress
    if (selectedBusiness.storefrontAddress) {
      const address = selectedBusiness.storefrontAddress;
      const addressComponents = [];

      // Add street address if available
      if (address.addressLines && address.addressLines.length > 0) {
        const streetAddress = address.addressLines[0]
          .replace(/[^\w\s-]/g, '') // Keep hyphens and spaces
          .trim();

        if (streetAddress) {
          addressComponents.push(streetAddress);
        }
      }

      // Add city if available
      if (address.locality) {
        addressComponents.push(address.locality);
      }

      // Add state if available
      if (address.administrativeArea) {
        addressComponents.push(address.administrativeArea);
      }

      // Join the address components and add as a keyword
      if (addressComponents.length > 0) {
        const fullAddress = addressComponents.join(', ');
        if (fullAddress && !autoKeywords.includes(fullAddress)) {
          autoKeywords.push(fullAddress);
        }
      }
    }

    return autoKeywords;
  };

  // Add this useEffect right after the getAutoKeywords function
  useEffect(() => {
    if (selectedBusiness) {
      // console.log('selectedBusiness:', selectedBusiness);
      // console.log('selectedBusiness.location:', selectedBusiness.location);
      // console.log('selectedBusiness.address:', selectedBusiness.address);
      // console.log('selectedBusiness.categories:', selectedBusiness.categories);

      // Test the getAutoKeywords function
      const keywords = getAutoKeywords();
      // console.log('Auto-generated keywords:', keywords);
    }
  }, [selectedBusiness]);
  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setCurrentPost(prev => ({
      ...prev,
      keywords: value
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = currentPost.keywords.trim();
      if (keyword && !currentPost.keywordsArray.includes(keyword)) {
        setCurrentPost(prev => ({
          ...prev,
          keywordsArray: [...prev.keywordsArray, keyword],
          keywords: ''
        }));
      }
    }
  };

  const removeKeyword = (keywordToRemove) => {
    // Prevent removal of auto keywords (business name and category)
    const autoKeywords = getAutoKeywords();
    if (autoKeywords.includes(keywordToRemove)) {
      toast.error('Cannot remove auto-generated keywords');
      return;
    }

    setCurrentPost(prev => ({
      ...prev,
      keywordsArray: prev.keywordsArray.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const generateAIPostContent = async () => {
    if (!selectedBusiness) {
      toast.error('Please select a business location first');
      return;
    }

    if (currentPost.keywordsArray.length === 0) {
      toast.error('At least one keyword is required for AI generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const postType = currentPost.scheduledFor ? 'promotional' : 'engagement';
      const aiContent = await generateAIPost(selectedBusiness, currentPost.keywordsArray, postType);

      setCurrentPost(prev => ({
        ...prev,
        content: aiContent
      }));

      toast.success('AI post generated successfully!');
    } catch (error) {
      console.error('Error generating AI post:', error);
      toast.error('Failed to generate AI post. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();

    if (!businessDetails) {
      toast.error('No business details available');
      return;
    }

    setIsCreatingPost(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token is found, redirect to login
        localStorage.removeItem('token');
        navigate('/login');
        throw new Error('Your session has expired. Please log in again.');
      }

      const locationId = businessDetails.name.split('/')[1];
      if (!locationId) {
        throw new Error('Invalid location ID');
      }

      // Include keywords in the post data if present
      const postKeywords = currentPost.keywordsArray.length > 0
        ? currentPost.keywordsArray.join(', ')
        : undefined;

      const postData = {
        languageCode: 'en-US',
        summary: currentPost.content,
        topicType: 'STANDARD',
        ...(postKeywords && { keywords: postKeywords }),
        ...(currentPost.media && typeof currentPost.media === 'string' && {
          media: [{
            mediaFormat: 'PHOTO',
            sourceUrl: currentPost.media,
            thumbnail: currentPost.media
          }]
        })
      };

      // Set scheduled time if applicable
      if (currentPost.scheduledFor) {
        postData.createTime = currentPost.scheduledFor.toISOString();
      }

      // console.log('🔄 Creating new post...', { 
      //   accountId: businessDetails.accountId, 
      //   locationId,
      //   postData 
      // });

      // Ensure BACKEND_URL is defined and doesn't end with a slash
      if (!BACKEND_URL) {
        throw new Error('BACKEND_URL is not defined');
      }
      const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;

      // Get Google OAuth tokens from localStorage
      const oauthKey = `google_oauth_tokens_${authUser?.id || 'guest'}`;
      const oauthTokens = JSON.parse(localStorage.getItem(oauthKey) || '{}');

      // Build URL with OAuth parameters
      const params = new URLSearchParams({
        ...(oauthTokens.access_token && { access_token: oauthTokens.access_token }),
        ...(oauthTokens.refresh_token && { refresh_token: oauthTokens.refresh_token }),
        ...(oauthTokens.expiry_date && { expiry_date: oauthTokens.expiry_date })
      });

      const url = `${baseUrl}/auth/google/accounts/${businessDetails.accountId}/locations/${locationId}/localPosts?${params}`;

      // console.log(' Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(' Server error response:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });

        let errorMessage = responseData.error?.message || 'Failed to create post';
        if (response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to create posts';
        } else if (response.status === 404) {
          errorMessage = 'The requested resource was not found. Please check the business account and location.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      // console.log(' Post created successfully:', responseData);

      // Create the new post object from the response
      const newPost = {
        id: responseData.name || `post-${Date.now()}`, // Use server-generated ID or create a temporary one
        createTime: responseData.createTime || new Date().toISOString(),
        updateTime: responseData.updateTime || new Date().toISOString(),
        state: responseData.state || 'LIVE',
        summary: currentPost.content,
        searchUrl: responseData.searchUrl || '',
        topicType: responseData.topicType || 'STANDARD',
        ...(currentPost.media && {
          media: [{
            mediaFormat: 'PHOTO',
            sourceUrl: currentPost.media,
            thumbnail: currentPost.media
          }]
        }),
        // Add any additional fields that your posts list expects
        status: currentPost.scheduledFor ? 'scheduled' : 'published',
        scheduledFor: currentPost.scheduledFor || new Date().toISOString(),
        postedAt: new Date().toISOString(),
        media: currentPost.media || null
      };

      // Update the UI immediately with the new post
      setPosts(prevPosts => [newPost, ...prevPosts]);

      // Close the dialog and reset the form
      setShowEditor(false);
      setCurrentPost({
        id: null,
        content: '',
        scheduledFor: null,
        media: null,
        isRecurring: false,
        frequency: 'daily',
        time: '09:00',
        days: [1, 2, 3, 4, 5],
        keywords: '',
        keywordsArray: []
      });

      // Show success message
      toast.success('Post created successfully!');

      // Refresh posts from server in the background to ensure consistency
      try {
        await fetchPosts(businessDetails.accountId, locationId);
      } catch (err) {
        console.error('Background refresh failed:', err);
        // Keep the optimistic update even if refresh fails
      }

    } catch (error) {
      console.error(" Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      setDeletingPostId(id);
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('auth')) || {}).token;

      if (!token) {
        toast.error('Please log in to delete posts');
        setDeletingPostId(null);
        return;
      }

      // Make API call to delete the post
      await axios.delete(
        `${BACKEND_URL}/api/post/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the UI by removing the deleted post from posts state
      setPosts(posts.filter(post => post.id !== id));

      // Refresh the page to update the UI with the latest data
      window.location.reload();

      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete post';
      toast.error(errorMessage);
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleEditPost = (post) => {
    setCurrentPost({
      id: post.id,
      content: post.content,
      scheduledFor: post.status === 'scheduled' ? new Date(post.scheduledFor) : null,
      media: post.media || null,
      isRecurring: false,
      frequency: 'daily',
      time: '09:00',
      days: [1, 2, 3, 4, 5],
      keywords: '',
      keywordsArray: []
    });
    setShowEditor(true);
  };

  // Format scheduled posts to match the PostCard component's expected format
  const formattedScheduledPosts = (scheduledPosts || []).map(post => ({
    id: post._id || post.id,
    content: post.content,
    status: 'scheduled',
    statusFromApi: post.status,
    scheduledFor: post.scheduledFor || post.nextRun,
    postedAt: post.createdAt,
    platform: 'google',
    isRecurring: post.isRecurring,
    repeatType: post.repeatType,
    repeatDays: post.repeatDays,
    lastRun: post.lastRun,
    nextRun: post.nextRun
  }));

  // Filter posts based on active tab (excluding scheduled posts which are handled separately)
  const filteredPosts = posts.filter(post => post.status === activeTab);
  // Handle loading more posts
  const handleLoadMore = () => {
    if (selectedBusiness?.accountId && selectedBusiness?.name && pagination.hasMore && !pagination.loadingMore) {
      const locationId = selectedBusiness.name.split('/')[1];
      fetchPosts(selectedBusiness.accountId, locationId, true);
    }
  };

  return (
    <div className={`min-h-screen w-full flex ${theme === 'dark' ? 'text-white bg-transparent' : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
      <SideNav />
      <div className="flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden pl-0 md:pl-4">
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Google My Business Posts</h1>
                {selectedBusiness && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    Business: {selectedBusiness.title || selectedBusiness.locationName || selectedBusiness.name?.split('/').pop()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Business Profile Dropdown */}
                <BusinessProfileDropdown
                  onSelect={(businessOrBusinesses) => {
                    // Fetch posts for the selected business
                    if (Array.isArray(businessOrBusinesses)) {
                      // Handle multiple selections - use the first one
                      if (businessOrBusinesses.length > 0) {
                        const business = businessOrBusinesses[0];
                        if (business && business.name) {
                          const locationId = business.name.split('/')[1];
                          fetchPosts(business.accountId, locationId);
                        }
                      }
                    } else {
                      // Handle single selection
                      if (businessOrBusinesses && businessOrBusinesses.name) {
                        const locationId = businessOrBusinesses.name.split('/')[1];
                        fetchPosts(businessOrBusinesses.accountId, locationId);
                      }
                    }
                  }}
                  className="w-64"
                  multiple={selectedBusinesses && selectedBusinesses.length > 1}
                />
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                <div>
                  <button
                    onClick={() => {
                      // Get auto keywords if business is selected
                      const autoKeywords = selectedBusiness ? getAutoKeywords() : [];

                      setCurrentPost({
                        id: null,
                        content: '',
                        scheduledFor: null,
                        media: null,
                        isRecurring: false,
                        frequency: 'daily',
                        time: '09:00',
                        days: [1, 2, 3, 4, 5],
                        keywords: '',
                        keywordsArray: [...autoKeywords] // Initialize with auto-keywords
                      });
                      setShowEditor(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    disabled={!isGoogleConnected}
                  >
                    <FaPlus /> New Post
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/dashboard/schedule-post')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    disabled={!isGoogleConnected}
                  >
                    <FaCalendarAlt /> Schedule Post
                  </button>
                </div>
                {!isGoogleConnected && (
                  <p className={`text-xs mt-1 text-center sm:text-right ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    <a
                      href="/dashboard/integrations"
                      className={`underline transition-colors ${theme === 'dark' ? 'hover:text-red-300' : 'hover:text-red-700'}`}
                    >
                      Connect to Google
                    </a> to create posts.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`border-b mb-6 backdrop-blur-sm rounded-t-lg ${theme === 'dark'
            ? 'border-white/10 bg-[#1a1b2e]/50'
            : 'border-gray-200 bg-white'}`}>
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
              {['published', 'scheduled',].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg mx-1 transition-all duration-200 ${activeTab === tab
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                      : theme === 'dark'
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab
                      ? 'bg-white/20 text-white'
                      : theme === 'dark'
                        ? 'bg-white/10 text-white/60'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab === 'scheduled' ? formattedScheduledPosts.length : posts.filter(p => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            {!isGoogleConnected ? (
              <div className="text-center py-12">
                <div className={`bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border rounded-xl p-8 ${theme === 'dark' ? 'border-blue-500/30' : 'border-blue-300'
                  }`}>
                  <FaGoogle className="mx-auto text-5xl mb-4 text-blue-400" />
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Connect Your Google Business</h3>
                  <p className={`mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                    Connect your Google My Business account to create, schedule, and manage posts directly from here.
                  </p>
                  <a
                    href="/dashboard/integrations"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FaGoogle /> Connect Google Business
                  </a>
                </div>
              </div>) : isLoadingPosts ? (
                <div className="text-center py-12">
                  <div className={`border rounded-xl p-8 ${theme === 'dark' ? 'bg-[#121324]/90 border-white/5' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex flex-col items-center gap-4">
                      <FaSpinner className="text-4xl text-blue-400 animate-spin" />
                      <div>
                        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading Posts...</h3>
                        <p className={theme === 'dark' ? 'text-white/60 text-sm' : 'text-gray-600 text-sm'}>
                          Fetching your Google My Business posts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>) : activeTab === 'scheduled' ? (

                  <MyScheduledPosts businessId={selectedBusiness.name} />

                ) : filteredPosts.length > 0 ? (
                  <>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                          selectedBusiness={selectedBusiness}
                        />
                      ))}
                    </div>
                    {pagination.hasMore && (
                      <div className="col-span-full flex justify-center mt-6">
                        <button
                          onClick={handleLoadMore}
                          disabled={pagination.loadingMore}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pagination.loadingMore ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
              <div className="col-span-full text-center py-12">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100'
                  }`}>
                  <FaEdit className={`text-2xl ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activeTab === 'published' ? 'No published posts' : 'No drafts'}
                </h3>
                <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>
                  {activeTab === 'published'
                    ? 'Create your first post to get started.'
                    : 'Create a draft to get started.'}
                </p>
              </div>)}
          </div>
        </div>

        {showEditor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#121324]' : 'bg-white shadow-xl'
              }`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {currentPost.id ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className={`text-2xl ${theme === 'dark'
                        ? 'text-white/60 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleSavePost}>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        Post Content
                      </label>
                      <button
                        type="button"
                        onClick={generateAIPostContent}
                        disabled={isGeneratingAI || !selectedBusiness || currentPost.keywordsArray.length === 0}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <FaRobot className="text-xs" />
                        {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                      </button>
                    </div>
                    <textarea
                      value={currentPost.content}
                      onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                      className={`w-full border rounded-lg p-3 h-40 resize-none ${theme === 'dark'
                          ? 'bg-[#1a1a2e] border-white/10 text-white/90'
                          : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      placeholder="What would you like to post?"
                      required={currentPost.keywordsArray.length === 0}
                    />
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                      }`}>
                      {currentPost.content.length}/1500 characters
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Keywords for AI Generation</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {currentPost.keywordsArray.map((keyword, index) => {
                          const autoKeywords = getAutoKeywords();
                          const isAutoKeyword = autoKeywords.includes(keyword);

                          return (
                            <div
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isAutoKeyword
                                  ? theme === 'dark'
                                    ? 'bg-purple-600/30 text-purple-100'
                                    : 'bg-purple-100 text-purple-800'
                                  : theme === 'dark'
                                    ? 'bg-blue-500/20 text-blue-100'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                              {keyword}
                              {isAutoKeyword ? (
                                <span className="text-[10px] opacity-70 ml-0.5">(auto)</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(keyword)}
                                  className="text-black hover:text-black"
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentPost.keywords}
                          onChange={handleKeywordChange}
                          onKeyDown={handleKeywordKeyPress}
                          className={`w-full border rounded-lg px-3 py-2  pr-8 ${theme === 'dark'
                              ? 'bg-[#1a1a2e] border-white/10'
                              : 'bg-white border-gray-300 text-black'
                            }`}
                          placeholder="Add keywords and press Enter"
                        />
                        <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black'
                          }`}>
                          Press Enter to add
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 
                  <div className="mb-6">
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Add Media (Optional)</label>
                    <div className={`border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:bg-white/5 transition-colors ${
                      theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'
                    }`}>
                      <div className="flex flex-col items-center">
                        <FaPlus className="text-2xl mb-2 opacity-60" />
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}>Click to upload or drag and drop</p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                        }`}>JPG, PNG up to 10MB</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCurrentPost({...currentPost, media: e.target.files[0]});
                          }
                        }}
                      />
                    </div>
                  </div> */}

                  <div className="mb-6">
                    {currentPost.scheduledFor && (
                      <div className="pl-6 space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>Date & Time</label>
                          <div className="flex gap-4">
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaCalendarAlt className={`text-white/50 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                                  }`} />
                              </div>
                              <DatePicker
                                selected={currentPost.scheduledFor}
                                onChange={(date) => setCurrentPost({ ...currentPost, scheduledFor: date })}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className={`w-full border rounded-lg pl-10 pr-3 py-2 ${theme === 'dark'
                                    ? 'bg-[#1a1a2e] border-white/10 text-white/90'
                                    : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                minDate={new Date()}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={currentPost.isRecurring}
                              onChange={(e) => {
                                setCurrentPost({
                                  ...currentPost,
                                  isRecurring: e.target.checked
                                });
                              }}
                              className="rounded border-white/20"
                            />
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>Repeat post</span>
                          </label>

                          {currentPost.isRecurring && (
                            <div className="pl-6 space-y-3">
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>Frequency</label>
                                <select
                                  value={currentPost.frequency}
                                  onChange={(e) => setCurrentPost({ ...currentPost, frequency: e.target.value })}
                                  className={`w-full border rounded-lg px-3 py-2 ${theme === 'dark'
                                      ? 'bg-[#1a1a2e] border-white/10 text-white/90'
                                      : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>

                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>Time</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaClock className={`text-white/50 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                                      }`} />
                                  </div>
                                  <input
                                    type="time"
                                    value={currentPost.time}
                                    onChange={(e) => setCurrentPost({ ...currentPost, time: e.target.value })}
                                    className={`w-full border rounded-lg pl-10 pr-3 py-2 ${theme === 'dark'
                                        ? 'bg-[#1a1a2e] border-white/10 text-white/90'
                                        : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                  />
                                </div>
                              </div>

                              {currentPost.frequency === 'weekly' && (
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>Days of the week</label>
                                  <div className="flex flex-wrap gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                          const days = [...currentPost.days];
                                          const dayIndex = days.indexOf(index);

                                          if (dayIndex === -1) {
                                            days.push(index);
                                          } else {
                                            days.splice(dayIndex, 1);
                                          }

                                          setCurrentPost({
                                            ...currentPost,
                                            days: days.sort((a, b) => a - b)
                                          });
                                        }}
                                        className={`px-3 py-1 text-sm rounded-full ${currentPost.days.includes(index)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                          }`}
                                      >
                                        {day}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex justify-end gap-3 pt-4 ${theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-200'
                    }`}>
                    <button
                      type="button"
                      onClick={() => setShowEditor(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                          ? 'border border-white/20 text-white/90 hover:bg-white/5'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingPost || (currentPost.keywordsArray.length === 0 && !currentPost.content)}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isCreatingPost && <FaSpinner className="animate-spin" />}
                      {isCreatingPost
                        ? 'Creating...'
                        : currentPost.id ? 'Update Post' : 'Schedule Post'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;