import React from 'react';
import { FaGoogle, FaCalendarAlt, FaClock, FaTrash, FaEdit, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'sonner';

const ScheduledPosts = ({ scheduledPosts, loadingScheduled, onEdit, onDelete }) => {
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-full mb-4">
          <FaCalendarAlt className="text-indigo-400 text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No scheduled posts</h3>
        <p className="text-white/60 max-w-md mx-auto">
          You don't have any scheduled posts. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledPosts.map((post) => (
        <div key={post._id || post.id} className="bg-gradient-to-br from-[#1a1b2e] to-[#121324] border border-white/5 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/30">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2.5 rounded-xl shadow-inner">
                <FaGoogle className="text-blue-300 text-lg" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-blue-300 text-xs font-medium bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/20">
                    {post.businessName || 'Business'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => onEdit && onEdit(post)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-105"
                aria-label="Edit post"
              >
                <FaEdit className="text-blue-300 hover:text-blue-200" />
              </button>
              <button 
                onClick={() => onDelete && onDelete(post._id || post.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-105"
                aria-label="Delete post"
              >
                <FaTrash className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          </div>
          
          <div className="pl-1">
            <p className="text-sm text-white/90 leading-relaxed mb-3">{post.content}</p>
            
            <div className="flex items-center text-xs text-white/60 mt-3">
              <div className="flex items-center mr-4">
                <FaClock className="mr-1.5 text-blue-400" />
                <span>{getDisplayStatus(post)}</span>
              </div>
              
              {post.isRecurring && post.nextRun && (
                <div className="flex items-center">
                  <FaInfoCircle className="mr-1.5 text-indigo-400" />
                  <span>Next: {formatDate(post.nextRun)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledPosts;
