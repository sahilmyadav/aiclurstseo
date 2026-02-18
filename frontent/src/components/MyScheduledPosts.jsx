import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaTrash, 
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaInfoCircle,
  FaClock
} from 'react-icons/fa';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { useGoogleBusiness } from './context/GoogleBusinessContext';

const MyScheduledPosts = () => {
  const { selectedBusiness, token } = useGoogleBusiness();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getNextRunDate = (post) => {
    if (post.nextRun) return formatDate(post.nextRun);
    if (!post.scheduledFor) return 'N/A';
    
    const scheduledDate = new Date(post.scheduledFor);
    if (isNaN(scheduledDate.getTime())) return 'N/A';
    
    if (post.isRecurring && post.repeatType) {
      const now = new Date();
      let nextRun = new Date(scheduledDate);
      
      while (nextRun <= now) {
        if (post.repeatType === 'daily') {
          nextRun.setDate(nextRun.getDate() + 1);
        } else if (post.repeatType === 'weekly' && post.repeatDays?.length) {
          const currentDay = now.getDay();
          const daysUntilNext = post.repeatDays
            .map(day => {
              const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.toLowerCase());
              return (dayIndex - currentDay + 7) % 7 || 7;
            })
            .sort((a, b) => a - b)[0] || 7;
          
          nextRun.setDate(now.getDate() + daysUntilNext);
        } else if (post.repeatType === 'monthly') {
          nextRun.setMonth(nextRun.getMonth() + 1);
        } else {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      }
      return formatDate(nextRun);
    }
    
    return post.scheduledFor ? formatDate(post.scheduledFor) : 'N/A';
  };

  const getStatusDisplay = (post) => {
    if (post.status) return post.status;
    if (post.published) return 'Published';
    if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) return 'Scheduled';
    return 'Pending';
  };

  const fetchScheduledPosts = async () => {
    if (!selectedBusiness) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const locationId = selectedBusiness.name.split("/")[1];
    if (!locationId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/post/user/${locationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(Array.isArray(data.data) ? data.data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch scheduled posts');
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      if (error.response?.status !== 404) {
        toast.error(error.message || 'Failed to load scheduled posts');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setDeleting(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        fetchScheduledPosts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const confirmDelete = () => {
    if (postToDelete) {
      handleDeletePost(postToDelete);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [selectedBusiness, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100'
        }`}>
          <FaCalendarAlt className={`text-2xl ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          No scheduled posts
        </h3>
        <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
          You don't have any scheduled posts. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Scheduled Posts
        </h2>
        <button
          onClick={fetchScheduledPosts}
          disabled={loading}
          className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          title="Refresh posts"
        >
          <FaSync className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl ${
            theme === 'dark' ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 p-2 rounded-full ${
                theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <FaExclamationTriangle className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Delete Scheduled Post
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  Are you sure you want to delete this scheduled post? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    disabled={deleting}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      theme === 'dark'
                        ? 'text-white/70 hover:bg-white/5 hover:text-white border border-white/10'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${
                      deleting
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {deleting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Post'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <div 
            key={post._id || post.id} 
            className={`rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-[#1a1b2e] to-[#121324] border border-white/5 hover:border-blue-500/30' 
                : 'bg-white border border-gray-200 hover:border-purple-500/30'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' 
                    : 'bg-purple-100'
                }`}>
                  <FaCalendarAlt className={theme === 'dark' ? 'text-blue-300' : 'text-purple-600'} />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-blue-300' : 'text-purple-600'
                  }`}>
                    {selectedBusiness?.title?.name || 'Scheduled Post'}
                  </div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                  }`}>
                    {formatDate(post.scheduledFor || post.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPostToDelete(post._id || post.id);
                    setShowDeleteModal(true);
                  }}
                  className={`ml-auto p-2 rounded-lg hover:bg-opacity-20 ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:bg-red-400' 
                      : 'text-red-500 hover:bg-red-100'
                  }`}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
              
              <div className={`rounded-lg p-3 mb-3 h-32 overflow-hidden ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <p className={`text-sm leading-relaxed line-clamp-5 ${
                  theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                }`}>
                  {post.content}
                </p>
              </div>
            </div>
            
          <div className={`pt-3 mt-auto ${
  theme === 'dark' ? 'border-t border-white/5' : 'border-t border-gray-200'
}`}>
  <div className="grid grid-cols-2 gap-2 text-xs">
    {post.isRecurring && (
      <div className="flex items-center gap-1.5">
        <FaSync className={`flex-shrink-0 text-xs ${
          theme === 'dark' ? 'text-indigo-300' : 'text-purple-600'
        }`} />
        <div className="truncate">
          <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Repeat:</span>{' '}
          <span className={`capitalize ${
            theme === 'dark' ? 'text-indigo-300' : 'text-purple-600'
          }`}>
            {post.repeatType} {post.repeatDays?.length ? `(${post.repeatDays.join(', ')})` : ''}
          </span>
        </div>
      </div>
    )}
    
    {post.lastRun && (
      <div className="flex items-center gap-1.5">
        <FaInfoCircle className={`flex-shrink-0 text-xs ${
          theme === 'dark' ? 'text-green-300' : 'text-green-600'
        }`} />
        <div className="truncate">
          <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Last Run:</span>{' '}
          <span className={theme === 'dark' ? 'text-green-300' : 'text-green-600'}>
            {formatDate(post.lastRun)}
          </span>
        </div>
      </div>
    )}
    
    <div className="flex items-center gap-1.5">
      <FaClock className={`flex-shrink-0 text-xs ${
        theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
      }`} />
      <div className="truncate">
        <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Next Run:</span>{' '}
        <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}>
          {getNextRunDate(post)}
        </span>
      </div>
    </div>
    
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${
        getStatusDisplay(post).toLowerCase() === 'published' ? 'bg-green-500' : 
        getStatusDisplay(post).toLowerCase() === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-500'
      }`} />
      <div className="truncate">
        <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Status:</span>{' '}
        <span className={`capitalize ${
          getStatusDisplay(post).toLowerCase() === 'published' ? 
            (theme === 'dark' ? 'text-green-300' : 'text-green-600') :
          getStatusDisplay(post).toLowerCase() === 'scheduled' ? 
            (theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600') :
          (theme === 'dark' ? 'text-gray-300' : 'text-gray-600')
        }`}>
          {getStatusDisplay(post)}
        </span>
      </div>
    </div>
  </div>
</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyScheduledPosts;