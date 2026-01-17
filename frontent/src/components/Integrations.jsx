import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./context/AuthContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { useTheme } from "../context/ThemeContext";
import BusinessProfileDropdown from "./common/BusinessProfileDropdown";
import { FiExternalLink, FiStar, FiChevronRight, FiLogOut, FiAlertCircle, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

const SkeletonLoader = ({ count = 1, height = 20, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={`rounded ${className} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

const StarRating = ({ rating }) => {
  const { theme } = useTheme();
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FiStar key={i} className="fill-current w-4 h-4 text-yellow-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FiStar key={i} className="fill-current w-4 h-4 text-yellow-400" />);
    } else {
      stars.push(<FiStar key={i} className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />);
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
  const { theme } = useTheme();
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
    <div className={`flex min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' 
        : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'
    }`}>
      <div className="flex-1 p-4 md:p-8 transition-all duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Google Business Integration</h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Manage your Google Business Profile and reviews in one place</p>
            </div>

            {connected && (
              <button 
                onClick={handleDisconnect} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${theme === 'dark' 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border-red-800/50' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'}`}
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
            <div className={`rounded-xl shadow-sm border p-8 text-center max-w-2xl mx-auto ${theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${theme === 'dark' 
                ? 'bg-blue-900/30' 
                : 'bg-blue-50'}`}>
                <FaGoogle className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Connect Your Google Business Account</h2>
              <p className={`mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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
              <div className={`rounded-xl shadow-sm border p-6 mb-8 ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full mr-2 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                    <FaGoogle className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.email || 'Google Account'}</h2>
                    <p className={`text-sm font-medium flex items-center ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Connected
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Business Locations</h3>

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
                        className={`border rounded-xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${theme === 'dark' 
                          ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 hover:shadow-gray-800/20' 
                          : 'border-gray-100 bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white] shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className={`font-medium line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedBusiness.title}</h4>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${theme === 'dark' 
                            ? 'bg-blue-900/50 text-blue-200' 
                            : 'bg-blue-100 text-blue-800'}`}>
                            {selectedBusiness.primaryCategory?.displayName || 'Business'}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className={`flex items-start text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {/* <FiMapPin className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" /> */}
                            <div>
                              {/* <div className="font-medium mb-1">Location Address:</div> */}
                              <div className="space-y-1">
                                {selectedBusiness.location?.address?.addressLines?.map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                                <div>
                                  {[
                                    selectedBusiness.location?.address?.locality,
                                    selectedBusiness.location?.address?.administrativeArea,
                                    selectedBusiness.location?.address?.postalCode,
                                    selectedBusiness.location?.address?.regionCode
                                  ].filter(Boolean).join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedBusiness.storefrontAddress && (
                            <div className={`flex items-start text-sm pt-2 border-t font-bold ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                              <FiMapPin className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                {selectedBusiness.storefrontAddress.addressLines?.map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                                <div>
                                  {[
                                    selectedBusiness.storefrontAddress.locality,
                                    selectedBusiness.storefrontAddress.administrativeArea,
                                    selectedBusiness.storefrontAddress.postalCode,
                                    selectedBusiness.storefrontAddress.regionCode
                                  ].filter(Boolean).join(', ')}
                                </div>
                                <div className="text-xs opacity-75">
                                  Language: {selectedBusiness.storefrontAddress.languageCode || 'en'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center justify-between pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                          <button 
                            className={`text-sm font-medium flex items-center transition-colors ${theme === 'dark' 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-800'}`}
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
                              className={`transition-colors ${theme === 'dark' 
                                ? 'text-blue-400' 
                                : 'text-blue-600'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-8 border-2 border-dashed rounded-lg ${theme === 'dark' 
                      ? 'border-gray-700 bg-gray-800/50' 
                      : 'border-gray-200 bg-gray-50'}`}>
                      <FiAlertCircle className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No business locations found</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedLocation && (
                <div className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center px-3 py-1.5 rounded-lg border ${theme === 'dark' 
                        ? 'bg-yellow-900/30 border-yellow-800/50' 
                        : 'bg-yellow-50 border-yellow-100'}`}>
                        <FiStar className={`w-4 h-4 fill-current mr-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          {(reviews.reduce((acc, curr) => acc + getStarRating(curr.starRating), 0) / (reviews.length || 1)).toFixed(1)}
                          <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>/5</span>
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total: {reviews.length} reviews
                      </div>
                    </div>
                  </div>

                  {loading && reviews.length === 0 ? (
                    <SkeletonLoader count={3} height={80} />
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, i) => (
                        <div key={i} className={`border rounded-lg p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${theme === 'dark' 
                          ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 hover:shadow-gray-800/20' 
                          : 'border-gray-100 bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white] shadow-sm'}`}>
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
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                                review.reviewer?.profilePhotoUrl ? 'hidden' : 'flex'
                              } ${theme === 'dark' 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                                : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                                {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {review.reviewer?.displayName || 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <StarRating rating={getStarRating(review.starRating)} />
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {getStarRating(review.starRating)}/5 stars
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {review.createTime && formatDate(review.createTime)}
                                </div>
                              </div>

                              <p className={`leading-relaxed whitespace-pre-line mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                {review.comment || 'No review text provided.'}
                              </p>
                              
                              {review.reviewReply && (
                                <div className={`p-3 rounded-lg border-2 transition-all ${theme === 'dark' 
                                  ? 'border-blue-500/30 bg-blue-900/20' 
                                  : 'border-blue-100 bg-blue-50 hover:bg-blue-100/50'}`}>
                                  <div className={`flex items-center text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Your Response</span>
                                    <span className="mx-2 text-gray-400">•</span>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {review.reviewReply.updateTime && formatDate(review.reviewReply.updateTime)}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    <div className={`text-center py-12 border-2 border-dashed rounded-xl ${theme === 'dark' 
                      ? 'border-gray-700 bg-gray-800/50' 
                      : 'border-gray-200 bg-gray-50'}`}>
                      <FiStar className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                      <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>No reviews yet</h4>
                      <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
