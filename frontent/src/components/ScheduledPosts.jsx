import React from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaInfoCircle,
  FaSync
} from 'react-icons/fa';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';

const ScheduledPosts = ({ scheduledPosts, loadingScheduled }) => {
  const { theme } = useTheme();
  
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