import React from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaInfoCircle,
  FaSync
} from 'react-icons/fa';
import { toast } from 'sonner';

const ScheduledPosts = ({ scheduledPosts, loadingScheduled }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scheduledPosts.map((post) => (
        <div key={post._id || post.id} className="bg-gradient-to-br from-[#1a1b2e] to-[#121324] border border-white/5 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/30 h-full flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2 rounded-lg flex-shrink-0">
                <FaCalendarAlt className="text-blue-300" />
              </div>
              <div className="min-w-0">
                <div className="text-blue-300 text-sm font-medium truncate">
                  {post.businessName || 'Scheduled Post'}
                </div>
                <div className="text-xs text-white/60">
                  {formatDate(post.scheduledFor || post.nextRun)}
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 mb-3 h-32 overflow-hidden">
              <p className="text-sm text-white/90 leading-relaxed line-clamp-5">
                {post.content}
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-3 mt-auto">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {post.isRecurring && (
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <FaSync className="flex-shrink-0 text-xs" />
                  <div className="truncate">
                    <span className="text-white/70">Repeat:</span>{' '}
                    <span className="capitalize">
                      {post.repeatType} {post.repeatDays && `(${post.repeatDays.join(', ')})`}
                    </span>
                  </div>
                </div>
              )}
              
              {post.lastRun && (
                <div className="flex items-center gap-1.5 text-green-300">
                  <FaInfoCircle className="flex-shrink-0 text-xs" />
                  <div className="truncate">
                    <span className="text-white/70">Last Run:</span>{' '}
                    <span>{formatDate(post.lastRun)}</span>
                  </div>
                </div>
              )}
              
              {post.nextRun && (
                <div className="flex items-center gap-1.5 text-blue-300">
                  <FaClock className="flex-shrink-0 text-xs" />
                  <div className="truncate">
                    <span className="text-white/70">Next Run:</span>{' '}
                    <span>{formatDate(post.nextRun)}</span>
                  </div>
                </div>
              )}
              
              {post.status && (
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    post.status === 'completed' ? 'bg-green-500' : 
                    post.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="text-white/70 capitalize">{post.status}</div>
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
