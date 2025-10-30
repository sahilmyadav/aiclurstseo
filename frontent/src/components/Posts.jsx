import React, { useState, useContext, useEffect } from "react";
import SideNav from "./SideNav";
import { useSidebar } from "./context/SidebarContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { FaGoogle, FaCalendarAlt, FaClock, FaHistory, FaPlus, FaTrash, FaEdit, FaSpinner } from "react-icons/fa";
import { toast } from 'sonner';
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

  const getDisplayStatus = (status) => {
    if (status === 'scheduled') return `Scheduled for ${formatDate(post.scheduledFor)}`;
    if (status === 'published' && post.statusFromApi === 'processing') return `Status: Processing`;
    if (status === 'published') return `Posted on ${formatDate(post.postedAt)}`;
    return 'Draft';
  };

  // Get business name from the selected business in the dropdown
  const displayBusinessName = selectedBusiness?.title || 
                            selectedBusiness?.locationName || 
                            selectedBusiness?.name?.split('/').pop() || 
                            'Business';

  return (
    <div className="bg-gradient-to-br from-[#1a1b2e] to-[#121324] border border-white/5 rounded-xl p-4 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/30">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2.5 rounded-xl shadow-inner">
            <FaGoogle className="text-blue-300 text-lg" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-blue-300 text-xs font-medium bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/20">
                {displayBusinessName}
              </span>
              <span className="text-xs text-white/40">•</span>
              <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
                {getDisplayStatus(post.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => onEdit(post)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-105"
            aria-label="Edit post"
          >
            <FaEdit className="text-blue-300 hover:text-blue-200" />
          </button>
          <button 
            onClick={() => onDelete(post.id)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-105"
            aria-label="Delete post"
          >
            <FaTrash className="text-red-400 hover:text-red-300" />
          </button>
        </div>
      </div>
      <div className="pl-1">
        <p className="text-sm text-white/90 leading-relaxed mb-3 line-clamp-3">{post.content}</p>
        {post.media && (
          <div className="mt-2 w-full h-36 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-xs text-white/70 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
              View Media
            </span>
          </div>
        )}
        <div className="mt-3 pt-2 border-t border-white/5 text-xs text-white/50">
          {post.status === 'scheduled' ? (
            <div className="flex items-center gap-1">
              <FaCalendarAlt className="text-blue-400/80" />
              <span>Scheduled for {formatDate(post.scheduledFor)}</span>
            </div>
          ) : post.status === 'published' ? (
            <div className="flex items-center gap-1">
              <FaClock className="text-green-400/80" />
              <span>Posted on {formatDate(post.postedAt)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-400/80">
              <FaEdit />
              <span>Draft - Not published</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Posts = () => {
  const { isCollapsed } = useSidebar();
  const { isConnected: isGoogleConnected, businesses, selectedBusiness, selectBusiness } = useGoogleBusiness();
  const [activeTab, setActiveTab] = useState('published'); 
  const [showEditor, setShowEditor] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  const [currentPost, setCurrentPost] = useState({
    id: null,
    content: '',
    scheduledFor: null,
    media: null,
    isRecurring: false,
    frequency: 'daily',
    time: '09:00',
    days: [1, 2, 3, 4, 5]
  });

  const [businessDetails, setBusinessDetails] = useState(null);
  
  const fetchPosts = async (accountId, locationId) => {
    setIsLoadingPosts(true);
    try {
      // Ensure BACKEND_URL is defined and doesn't end with a slash
      if (!BACKEND_URL) {
        throw new Error('BACKEND_URL is not defined');
      }
      const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
      // Remove /api from the URL path since the backend route is mounted at /auth/google
      const url = `${baseUrl}/auth/google/accounts/${accountId}/locations/${locationId}/localPosts`;
      
      console.log(`🔄 Fetching posts from:`, url);
      
      const postsResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        }
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
      console.log('✅ Posts fetched successfully:', responseData);
      
      // Get business details from the context
      const business = selectedBusiness || (businesses && businesses[0]);
      const businessName = business?.locationName || business?.name?.split('/').pop() || 'Business';
      
      // Handle both response formats
      const postsList = responseData.localPosts || responseData.posts || [];
      
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
      
      console.log(`📊 Formatted ${formattedPosts.length} posts`);
      setPosts(formattedPosts);
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
        throw new Error('No authentication token found. Please log in again.');
      }

      const locationId = businessDetails.name.split('/')[1];
      if (!locationId) {
        throw new Error('Invalid location ID');
      }

      const postData = {
        languageCode: 'en-US',
        summary: currentPost.content,
        topicType: 'STANDARD',
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

      console.log('🔄 Creating new post...', { 
        accountId: businessDetails.accountId, 
        locationId,
        postData 
      });

      // Ensure BACKEND_URL is defined and doesn't end with a slash
      if (!BACKEND_URL) {
        throw new Error('BACKEND_URL is not defined');
      }
      const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
      const url = `${baseUrl}/auth/google/accounts/${businessDetails.accountId}/locations/${locationId}/localPosts`;
      
      console.log('📤 Sending request to:', url);

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
        console.error('❌ Server error response:', {
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

      console.log('✅ Post created successfully:', responseData);
      
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
        days: [1, 2, 3, 4, 5]
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
      console.error("❌ Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== id));
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
      days: [1, 2, 3, 4, 5]
    });
    setShowEditor(true);
  };

  const filteredPosts = posts.filter(post => post.status === activeTab);

  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

  const handleBusinessSelect = (business) => {
    selectBusiness(business);
    setShowBusinessDropdown(false);
    
    // Fetch posts for the selected business
    if (business && business.name) {
      const locationId = business.name.split('/')[1];
      fetchPosts(business.accountId, locationId);
    }
  };

  return (
    <div className="min-h-screen w-full text-white bg-transparent flex">
      <SideNav />
      <div className="flex-1 transition-all duration-300 ease-in-out w-full overflow-x-hidden pl-0 md:pl-4">
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Google My Business Posts</h1>
                {selectedBusiness && (
                  <p className="text-sm text-white/60">
                    Business: {selectedBusiness.title || selectedBusiness.locationName || selectedBusiness.name?.split('/').pop()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {businesses && businesses.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#1a1b2e]/90 border border-white/10 rounded-lg text-white hover:bg-[#1a1b2e] transition-colors"
                    >
                      <span className="text-sm">
                        {selectedBusiness ? (selectedBusiness.title || selectedBusiness.locationName || selectedBusiness.name?.split('/').pop()) : 'Select Business'}
                      </span>
                      <span className="text-xs">▼</span>
                    </button>

                    {showBusinessDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#1a1b2e] border border-white/10 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {businesses.map((business, index) => (
                          <button
                            key={business.name || index}
                            onClick={() => handleBusinessSelect(business)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2a2b3e] ${selectedBusiness?.name === business.name ? 'bg-blue-600/20' : ''}`}
                          >
                            {business.title || business.locationName || business.name?.split('/').pop()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    setCurrentPost({
                      id: null, content: '', scheduledFor: null, media: null, isRecurring: false, 
                      frequency: 'daily', time: '09:00', days: [1, 2, 3, 4, 5]
                    });
                    setShowEditor(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  disabled={!isGoogleConnected}
                >
                  <FaPlus /> New Post
                </button>
                {!isGoogleConnected && (
                  <p className="text-xs text-red-400 mt-1 text-center sm:text-right">
                    <a 
                      href="/integrations" 
                      className="hover:text-red-300 underline transition-colors"
                    >
                      Connect to Google
                    </a> to create posts.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10 mb-6 bg-[#1a1b2e]/50 backdrop-blur-sm rounded-t-lg">
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
              {['scheduled', 'published', 'drafts'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg mx-1 transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-white bg-blue-600 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {posts.filter(p => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isGoogleConnected ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-8">
                  <FaGoogle className="mx-auto text-5xl mb-4 text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Connect Your Google Business</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Connect your Google My Business account to create, schedule, and manage posts directly from here.
                  </p>
                  <a 
                    href="/integrations"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FaGoogle /> Connect Google Business
                  </a>
                </div>
              </div>
            ) : isLoadingPosts ? (
              <div className="text-center py-12">
                <div className="bg-[#121324]/90 border border-white/5 rounded-xl p-8">
                  <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="text-4xl text-blue-400 animate-spin" />
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Loading Posts...</h3>
                      <p className="text-white/60 text-sm">Fetching your Google My Business posts</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  selectedBusiness={selectedBusiness}
                />
              ))
            ) : (
              <div className="text-center py-12 text-white/50">
                <FaHistory className="mx-auto text-4xl mb-3 opacity-30" />
                <p>No {activeTab} posts found</p>
              </div>
            )}
          </div>
        </div>

        {showEditor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#121324] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {currentPost.id ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  <button 
                    onClick={() => setShowEditor(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePost}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Post Content</label>
                    <textarea
                      value={currentPost.content}
                      onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                      className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-white/90 h-40 resize-none"
                      placeholder="What would you like to post?"
                      required
                    />
                    <div className="text-xs text-white/50 mt-1">
                      {currentPost.content.length}/1500 characters
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Add Media (Optional)</label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex flex-col items-center">
                        <FaPlus className="text-2xl mb-2 opacity-60" />
                        <p className="text-sm">Click to upload or drag and drop</p>
                        <p className="text-xs text-white/50 mt-1">JPG, PNG up to 10MB</p>
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
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 mb-4">
                      <input 
                        type="checkbox" 
                        checked={currentPost.scheduledFor !== null}
                        onChange={(e) => {
                          setCurrentPost({
                            ...currentPost, 
                            scheduledFor: e.target.checked ? new Date() : null,
                            isRecurring: e.target.checked ? currentPost.isRecurring : false,
                          });
                        }}
                        className="rounded border-white/20"
                      />
                      <span className="text-sm font-medium">Schedule for later</span>
                    </label>

                    {currentPost.scheduledFor && (
                      <div className="pl-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Date & Time</label>
                          <div className="flex gap-4">
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaCalendarAlt className="text-white/50" />
                              </div>
                              <DatePicker
                                selected={currentPost.scheduledFor}
                                onChange={(date) => setCurrentPost({...currentPost, scheduledFor: date})}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white/90"
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
                            <span className="text-sm font-medium">Repeat post</span>
                          </label>

                          {currentPost.isRecurring && (
                            <div className="pl-6 space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                <select
                                  value={currentPost.frequency}
                                  onChange={(e) => setCurrentPost({...currentPost, frequency: e.target.value})}
                                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white/90"
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Time</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaClock className="text-white/50" />
                                  </div>
                                  <input
                                    type="time"
                                    value={currentPost.time}
                                    onChange={(e) => setCurrentPost({...currentPost, time: e.target.value})}
                                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white/90"
                                  />
                                </div>
                              </div>

                              {currentPost.frequency === 'weekly' && (
                                <div>
                                  <label className="block text-sm font-medium mb-1">Days of the week</label>
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
                                        className={`px-3 py-1 text-sm rounded-full ${
                                          currentPost.days.includes(index)
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

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowEditor(false)}
                      className="px-4 py-2 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingPost}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
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