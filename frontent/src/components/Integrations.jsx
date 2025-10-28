import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { FiExternalLink, FiStar, FiChevronRight, FiLogOut, FiLoader, FiAlertCircle, FiCheckCircle, FiMapPin } from "react-icons/fi";
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
  const { user: authUser } = useAuth();
  const {
    user,
    businesses,
    reviews,
    selectedBusiness,
    loading,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    selectBusiness
  } = useGoogleBusiness();
  
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (selectedBusiness) {
      const locationId = selectedBusiness.name.split("/")[1];
      setSelectedLocation(locationId);
    }
  }, [selectedBusiness]);

  const handleConnect = async () => {
    if (!authUser) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }
    await connectGoogle();
  };

  const handleBusinessSelect = async (business) => {
    await selectBusiness(business);
  };


  const handleDisconnect = async () => {
    await disconnectGoogle();
    setSelectedLocation(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-800">
      <div className="flex-1 p-4 md:p-8 transition-all duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Google Business Integration</h1>
              <p className="text-gray-600">Manage your Google Business Profile and reviews in one place</p>
            </div>
            {user && (
              <button 
                onClick={handleDisconnect} 
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>

          {!user ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGoogle className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Google Business Account</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaGoogle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{user.name || user.email}</h2>
                    <p className="text-sm text-green-600 font-medium flex items-center">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Connected
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Business Locations</h3>
                  
                  {loading && businesses.length === 0 ? (
                    <div className="space-y-4">
                      <SkeletonLoader count={3} height={120} className="rounded-lg" />
                    </div>
                  ) : businesses.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {businesses.map((business, index) => {
                        const accountId = business.accountId;
                        const locationId = business.name.split("/")[1];
                        const isSelected = selectedLocation === locationId;
                        
                        return (
                          <div 
                            key={index} 
                            className={`border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md ${
                              isSelected ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleBusinessSelect(business)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900 line-clamp-2">{business.title}</h4>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                                {business.primaryCategory?.displayName || 'Business'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <FiMapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                              <span className="truncate">
                                {[business.location?.address?.addressLines?.[0], business.location?.address?.locality, business.location?.address?.postalCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBusinessSelect(business);
                                }}
                              >
                                View Reviews
                                <FiChevronRight className="w-4 h-4 ml-1" />
                              </button>
                              {business.websiteUri && (
                                <a 
                                  href={business.websiteUri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FiExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No business locations found</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedLocation && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center px-3 py-1.5 bg-yellow-50 rounded-lg">
                          <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-yellow-700">
                            {(reviews.reduce((acc, curr) => acc + getStarRating(curr.starRating), 0) / (reviews.length || 1)).toFixed(1)}
                            <span className="text-yellow-500">/5</span>
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: {reviews.length} reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  {loading && reviews.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 rounded"></div>
                              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
                          <div className="flex items-start space-x-4">
                            {/* Profile Avatar */}
                            <div className="flex-shrink-0">
                              {review.reviewer?.profilePhotoUrl ? (
                                <img 
                                  src={review.reviewer.profilePhotoUrl} 
                                  alt={review.reviewer.displayName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                  {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {review.reviewer?.displayName || 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <StarRating rating={getStarRating(review.starRating)} />
                                    <span className="text-sm font-medium text-gray-600">
                                      {getStarRating(review.starRating)}/5 stars
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">
                                    {review.createTime ? formatDate(review.createTime) : ''}
                                  </div>
                                  {review.updateTime && review.updateTime !== review.createTime && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Updated: {formatDate(review.updateTime)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                  {review.comment || 'No review text provided.'}
                                </p>
                              </div>

                              <div className="text-xs text-gray-400 mb-3">
                                Review ID: {review.reviewId?.slice(-8) || 'N/A'}
                              </div>
                              
                              {review.reviewReply && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-medium mr-2">
                                        Business Response
                                      </span>
                                      <span className="text-sm text-blue-700 font-medium">
                                        {formatDate(review.reviewReply.updateTime || review.reviewReply.createTime)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-blue-800 leading-relaxed">
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
                    <div className="text-center py-12">
                      <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-medium mb-1">No reviews yet</h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {businesses.find(b => b.name.includes(selectedLocation))?.title || 'This location'}
                        {' '}doesn't have any reviews yet. Check back later or share your experience!
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
