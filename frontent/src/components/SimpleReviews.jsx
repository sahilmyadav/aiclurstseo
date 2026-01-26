import { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';

const SimpleReviews = () => {
  const { reviews, selectedBusiness, tokenDetails } = useGoogleBusiness();
  const { user, token, toggleAutoReply } = useAuth();
  const [isAutoReplyOn, setIsAutoReplyOn] = useState(user?.autoReply || false);

  useEffect(() => {
    setIsAutoReplyOn(user?.autoReply || false);
  }, [user?.autoReply]);

  const handleAutoReplyToggle = async () => {
    try {
      const result = await toggleAutoReply();
      if (result.success) {
        setIsAutoReplyOn(result.autoReply);
        toast.success(`Auto-reply ${result.autoReply ? 'enabled' : 'disabled'}`);
        
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Reviews Management</h1>
        
        {/* Auto-reply Toggle */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Auto Reply System</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Automatically respond to new reviews with AI-generated responses
              </p>
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
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {isAutoReplyOn ? 'AUTO' : 'MANUAL'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div 
              key={review.name} 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {review.reviewer?.displayName || 'Anonymous Reviewer'}
                  </h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < (review.starRating === 'ONE' ? 1 : review.starRating === 'TWO' ? 2 : review.starRating === 'THREE' ? 3 : review.starRating === 'FOUR' ? 4 : 5) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {review.starRating === 'ONE' ? 1 : 
                       review.starRating === 'TWO' ? 2 : 
                       review.starRating === 'THREE' ? 3 : 
                       review.starRating === 'FOUR' ? 4 : 5} 
                      stars
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <p className="mt-2 text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
                {review.comment}
              </p>
              
              {review.reviewReply ? (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 mt-0.5 flex items-center justify-center rounded-full bg-blue-500 flex-shrink-0">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Response
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                        {review.reviewReply.comment}
                      </p>
                      {review.reviewReply.updateTime && (
                        <span className="inline-block mt-2 text-xs text-gray-500 dark:text-gray-400">
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
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-dashed border-orange-200 dark:border-orange-700">
                  <p className="text-center text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    No response yet - Auto-reply will generate a response
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No reviews found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              There are no reviews for this location yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleReviews;