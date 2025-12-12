import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import BusinessProfileDropdown from "./common/BusinessProfileDropdown";
import { FiExternalLink, FiStar, FiChevronRight, FiLogOut, FiAlertCircle, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

const SkeletonLoader = ({ count = 1, height = 20, className = '' }) => (
  <div className="animate-pulse space-y-3">
    {[...Array(count)].map((_, i) => (
      <div 
        key={i} 
        className={`bg-gray-700 rounded ${className}`}
        style={{ height: `${height}px` }}
      />
    ))}
  </div>
);

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current w-4 h-4" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current w-4 h-4" />);
    } else {
      stars.push(<FiStar key={i} className="text-gray-400 w-4 h-4" />);
    }
  }

  return <div className="flex space-x-0.5">{stars}</div>;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStarRating = (starRating) => {
  const ratingMap = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5
  };
  return ratingMap[starRating] || 0;
};

const Integrations = () => {
  const navigate = useNavigate();
  const { user: authUser, subscriptionData } = useAuth();

  const {
    googleOAuth,         // NEW token state
    user,
    businesses,
    reviews,
    selectedBusiness,
    selectedBusinesses,
    loading,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    selectBusiness,
    selectMultipleBusinesses,
    fetchBusinesses,     // use this instead of status
  } = useGoogleBusiness();
  console.log("Reviews Alll",reviews)
  
  const [selectedLocation, setSelectedLocation] = useState(null);

  // If token exists & no business loaded
  useEffect(() => {
    if (googleOAuth?.access_token && businesses.length === 0) {
      fetchBusinesses();
    }
  }, [googleOAuth?.access_token]);

  useEffect(() => {
    if (selectedBusiness) {
      const locationId = selectedBusiness.name.split("/")[1];
      setSelectedLocation(locationId);
    }
  }, [selectedBusiness]);

  const handleConnect = async () => {
    if (!authUser) {
      toast.error('Please log in to connect Google Business Profile');
      return;
    }

    if (!subscriptionData?.active) {
      toast.error('Please subscribe to a plan to connect Google Business Profile');
      navigate('/dashboard/subscription');
      return;
    }

    await connectGoogle();
  };

  const handleBusinessSelect = (businessOrBusinesses) => {
    if (Array.isArray(businessOrBusinesses)) {
      selectMultipleBusinesses(businessOrBusinesses);
    } else {
      selectBusiness(businessOrBusinesses);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogle();
    setSelectedLocation(null);
  };

  // Connected = OAuth tokens exist
  const connected = !!googleOAuth?.access_token;

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="flex-1 p-4 md:p-8 transition-all duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Google Business Integration</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your Google Business Profile and reviews in one place</p>
            </div>

            {connected && (
              <button 
                onClick={handleDisconnect} 
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-100 dark:border-red-800/50"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>

          {!connected ? (
            // ===================
            // CONNECT UI
            // ===================
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center max-w-2xl mx-auto">
              <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGoogle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect Your Google Business Account</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Connect your Google Business account to manage reviews and respond to customers all in one place.
              </p>
              <button 
                onClick={handleConnect} 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2 mx-auto"
              >
                <FaGoogle className="w-5 h-5" />
                <span>Connect with Google</span>
              </button>
            </div>

          ) : (
            // ===================
            // CONNECTED UI
            // ===================
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <FaGoogle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.email || 'Google Account'}</h2>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Connected
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Business Locations</h3>

                  <div className="mb-6">
                    <BusinessProfileDropdown 
                      onSelect={handleBusinessSelect}
                      className="w-full max-w-md"
                      multiple={selectedBusinesses && selectedBusinesses.length > 1}
                    />
                  </div>

                  {loading && businesses.length === 0 ? (
                    <div className="space-y-4">
                      <SkeletonLoader count={3} height={120} className="rounded-lg" />
                    </div>
                  ) : businesses.length > 0 && selectedBusiness ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <div 
                        className="border rounded-xl p-5 transition-all border-blue-500 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30 bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">{selectedBusiness.title}</h4>
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs px-2.5 py-0.5 rounded-full">
                            {selectedBusiness.primaryCategory?.displayName || 'Business'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <FiMapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="truncate">
                            {[
                              selectedBusiness.location?.address?.addressLines?.[0], 
                              selectedBusiness.location?.address?.locality, 
                              selectedBusiness.location?.address?.postalCode
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <button 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors"
                            onClick={() => handleBusinessSelect(selectedBusiness)}
                          >
                            View Reviews
                            <FiChevronRight className="w-4 h-4 ml-1" />
                          </button>
                          {selectedBusiness.websiteUri && (
                            <a 
                              href={selectedBusiness.websiteUri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <FiAlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No business locations found</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedLocation && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                        <FiStar className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {(reviews.reduce((acc, curr) => acc + getStarRating(curr.starRating), 0) / (reviews.length || 1)).toFixed(1)}
                          <span className="text-yellow-600 dark:text-yellow-400">/5</span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total: {reviews.length} reviews
                      </div>
                    </div>
                  </div>

                  {loading && reviews.length === 0 ? (
                    <SkeletonLoader count={3} height={80} />
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, i) => (
                        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-5 hover:shadow-sm dark:hover:shadow-gray-800/20 transition-all bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {review.reviewer?.profilePhotoUrl ? (
                                <img 
                                  src={review.reviewer.profilePhotoUrl.replace(/=s\d+(-c)?(-rp-mo-br100)?$/, '=s120-c')} 
                                  alt={review.reviewer.displayName || 'Reviewer'}
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg ${
                                review.reviewer?.profilePhotoUrl ? 'hidden' : 'flex'
                              }`}>
                                {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {review.reviewer?.displayName || 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <StarRating rating={getStarRating(review.starRating)} />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                      {getStarRating(review.starRating)}/5 stars
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                  {review.createTime && formatDate(review.createTime)}
                                </div>
                              </div>

                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-4">
                                {review.comment || 'No review text provided.'}
                              </p>
                              
                              {review.reviewReply && (
                                <div className="mt-4 pl-4 border-l-4 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-r-lg">
                                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    <span className="text-blue-600 dark:text-blue-400">Your Response</span>
                                    <span className="mx-2 text-gray-400">•</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                      {review.reviewReply.updateTime && formatDate(review.reviewReply.updateTime)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {review.reviewReply.comment}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <FiStar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <h4 className="text-gray-700 dark:text-gray-200 font-medium mb-1">No reviews yet</h4>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        No reviews found for this business.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
