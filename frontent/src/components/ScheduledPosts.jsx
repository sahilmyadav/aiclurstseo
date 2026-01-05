import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaInfoCircle,
  FaSync,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';

const ScheduledPosts = ({ scheduledPosts, loadingScheduled, onDelete, deletingPostId }) => {
  const { theme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);


  console.log("scheduled posts",scheduledPosts)
  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (postToDelete && onDelete) {
      onDelete(postToDelete);
    }
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayStatus = (post) => {
    if (post.isRecurring) {
      return `Recurring - ${post.repeatType}`;
    }
    return `Scheduled for ${formatDate(post.scheduledFor || post.nextRun)}`;
  };

  if (loadingScheduled) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!scheduledPosts || scheduledPosts.length === 0) {
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl ${theme === 'dark' ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-2 rounded-full ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <FaExclamationTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Delete Scheduled Post
              </h3>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                Are you sure you want to delete this scheduled post? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deletingPostId === postToDelete}
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
                  disabled={deletingPostId === postToDelete}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${
                    deletingPostId === postToDelete
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deletingPostId === postToDelete ? (
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
      {scheduledPosts.map((post) => (
        <div 
          key={post._id || post.id} 
          className={`rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col ${
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
                  {post.businessName || 'Scheduled Post'}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                  {formatDate(post.scheduledFor || post.nextRun)}
                </div>
              </div>
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
                  <FaSync className={`flex-shrink-0 text-xs ${theme === 'dark' ? 'text-indigo-300' : 'text-purple-600'}`} />
                  <div className="truncate">
                    <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Repeat:</span>{' '}
                    <span className={`capitalize ${theme === 'dark' ? 'text-indigo-300' : 'text-purple-600'}`}>
                      {post.repeatType} {post.repeatDays && `(${post.repeatDays.join(', ')})`}
                    </span>
                  </div>
                </div>
              )}
              
              {post.lastRun && (
                <div className="flex items-center gap-1.5">
                  <FaInfoCircle className={`flex-shrink-0 text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
                  <div className="truncate">
                    <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Last Run:</span>{' '}
                    <span className={theme === 'dark' ? 'text-green-300' : 'text-green-600'}>
                      {formatDate(post.lastRun)}
                    </span>
                  </div>
                </div>
              )}
              
              {post.nextRun && (
                <div className="flex items-center gap-1.5">
                  <FaClock className={`flex-shrink-0 text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
                  <div className="truncate">
                    <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Next Run:</span>{' '}
                    <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}>
                      {formatDate(post.nextRun)}
                    </span>
                  </div>
                </div>
              )}
              
              {post.status && (
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    post.status === 'completed' ? 'bg-green-500' : 
                    post.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className={theme === 'dark' ? 'text-white/70 capitalize' : 'text-gray-600 capitalize'}>
                    {post.status}
                  </div>
                  
                  {onDelete && (
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(post._id || post.id);
                        }}
                        disabled={!onDelete || deletingPostId === (post._id || post.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                        title="Delete scheduled post"
                      >
                        {deletingPostId === (post._id || post.id) ? (
                          <FaSpinner className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <FaTrash className="w-3 h-3" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ScheduledPosts;