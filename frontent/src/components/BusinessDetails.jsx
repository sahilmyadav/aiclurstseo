import React, { useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Tag, 
  Navigation, 
  ExternalLink,
  ArrowLeft,
  Building2,
  Mail,
  Calendar,
  Info,
  CheckCircle2,
  XCircle,
  Image
} from 'lucide-react';
import Report from './Report';

const BusinessDetails = () => {
  const { theme } = useTheme();
  const { selectedBusiness, loading, media, loadingMedia, mediaError, fetchMedia } = useGoogleBusiness();
  const navigate = useNavigate();

  // Fetch media when component mounts and business is selected
  useEffect(() => {
    if (selectedBusiness && selectedBusiness.accountId) {
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name?.split('/')[1];
      
      if (accountId && locationId) {
        // Only fetch if no media exists (context handles caching)
        if (media.length === 0) {
          console.log('BusinessDetails: No cached media found, fetching from API...');
          fetchMedia(accountId, locationId);
        } else {
          console.log('BusinessDetails: Using cached media from context:', media.length, 'items');
        }
      }
    }
  }, [selectedBusiness, media.length, fetchMedia]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#0f1020]' : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0f1020]' : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
        <div className="text-center">
          <Building2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Business Selected</h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Please select a business to view details</p>
          <button
            onClick={() => navigate('/dashboard/integrations')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Go to Integrations
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatTime = (timeObj) => {
    // Handle different time object structures
    if (!timeObj) return 'N/A';
    
    // If timeObj is already a string or number, return it
    if (typeof timeObj === 'string' || typeof timeObj === 'number') {
      return timeObj;
    }
    
    // Extract hours and minutes from nested objects
    let hours = timeObj.hours;
    let minutes = timeObj.minutes;
    
    // Handle case where timeObj might be nested (e.g., timeObj.time)
    if (timeObj.time) {
      hours = timeObj.time.hours;
      minutes = timeObj.time.minutes;
    }
    
    // Handle case where timeObj might have different property names
    if (timeObj.hour !== undefined) {
      hours = timeObj.hour;
    }
    if (timeObj.minute !== undefined) {
      minutes = timeObj.minute;
    }
    
    // Default values if not provided
    hours = hours || 0;
    minutes = minutes || 0;
    
    // Format time properly
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getDayName = (day) => {
    const days = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday'
    };
    return days[day] || day;
  };

  // Extract values correctly from potentially nested objects
  const extractValue = (obj, ...keys) => {
    if (!obj) return 'N/A';
    if (typeof obj === 'string' || typeof obj === 'number') return obj;
    
    // Try each key in order until we find a valid value
    for (const key of keys) {
      if (obj[key] !== undefined) {
        if (typeof obj[key] === 'string' || typeof obj[key] === 'number') {
          return obj[key];
        } else if (obj[key] && typeof obj[key] === 'object') {
          // Recursively check nested objects
          const nestedKeys = ['displayName', 'name', 'value', 'id', 'code', 'title'];
          for (const nestedKey of nestedKeys) {
            if (obj[key][nestedKey] !== undefined) {
              return obj[key][nestedKey];
            }
          }
          // If no nested keys found, return stringified object
          return JSON.stringify(obj[key]);
        }
      }
    }
    
    // If none of the keys worked, return stringified object
    return JSON.stringify(obj);
  };

  // Get location ID from name
  const getLocationId = () => {
    if (selectedBusiness.name && typeof selectedBusiness.name === 'string') {
      const parts = selectedBusiness.name.split('/');
      return parts.length > 1 ? parts[1] : selectedBusiness.name;
    }
    return 'N/A';
  };

  const locationId = getLocationId();
  const accountId = extractValue(selectedBusiness.accountId);
  const storeCode = extractValue(selectedBusiness.storeCode, 'code', 'storeCode');
  const businessTitle = extractValue(selectedBusiness.title, 'name', 'displayName', 'title');
  const languageCode = extractValue(selectedBusiness.languageCode, 'code', 'languageCode');
  const primaryPhone = extractValue(selectedBusiness.phoneNumbers?.primaryPhone, 'number', 'phoneNumber');
  const websiteUri = extractValue(selectedBusiness.websiteUri, 'url', 'websiteUrl');

  // Extract business images from context (not from selectedBusiness directly)
  const displayImages = media.slice(0, 3); // Show only first 2-3 images

  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-[#0f1020] text-white' : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard/integrations')}
              className={`flex items-center mb-2 transition ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-gray-700 hover:text-gray-900'}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Integrations
            </button>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{businessTitle}</h1>
            <p className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Complete business information and settings</p>
          </div>
          <Report buttonText="Download Report" className="mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6 overflow-hidden">
            {/* Business Images Section - Enhanced */}
            {loadingMedia ? (
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <Image className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Media</h2>
                </div>
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="ml-3 text-gray-500">Loading media...</p>
                </div>
              </div>
            ) : mediaError ? (
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <Image className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Media</h2>
                </div>
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                    Error loading media: {mediaError}
                  </p>
                </div>
              </div>
            ) : displayImages.length > 0 && (
              <div className={`rounded-xl p-6 ${theme === 'dark' 
                ? 'bg-[#1a1b2e]/90 border border-white/10' 
                : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Image className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Media</h2>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedBusiness && selectedBusiness.accountId) {
                        const accountId = selectedBusiness.accountId;
                        const locationId = selectedBusiness.name?.split('/')[1];
                        if (accountId && locationId) {
                          console.log('BusinessDetails: Refreshing media...');
                          fetchMedia(accountId, locationId, true); // Force refresh
                        }
                      }
                    }}
                    disabled={loadingMedia}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                        : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                    }`}
                  >
                    {loadingMedia ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayImages.map((image, index) => {
                    // Extract image URL from various possible structures
                    const imageUrl = image?.googleUrl || 
                                     image?.thumbnailUrl || 
                                     image?.url || 
                                     image?.sourceUrl || 
                                     (typeof image === 'string' ? image : null);
                    
                    // Extract image description/caption
                    const imageDescription = image?.description || 
                                            image?.caption || 
                                            image?.name || 
                                            `Media ${index + 1}`;
                    
                    if (!imageUrl) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <div className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={imageDescription}
                            className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              console.error('Business image failed to load:', e.target.src);
                              e.target.src = 'https://via.placeholder.com/300x300/800080/FFFFFF?text=No+Image';
                            }}
                            onLoad={(e) => {
                              console.log('Business image loaded successfully:', e.target.src);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
                            <p className={`text-sm font-medium text-white transition-opacity duration-300`}>
                              {imageDescription}
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {index + 1}/{displayImages.length}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {media.length > 3 && (
                  <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    Showing {displayImages.length} of {media.length} media items
                  </p>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div className={`rounded-xl p-6 ${theme === 'dark' 
              ? 'bg-[#1a1b2e]/90 border border-white/10' 
              : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Building2 className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Business Name</label>
                  <p className={`font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{businessTitle}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Store Code</label>
                  <p className={theme === 'dark' ? 'text-white mt-1' : 'text-gray-900 mt-1'}>{storeCode}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Location ID</label>
                  <p className={`font-mono text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{locationId}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Account ID</label>
                  <p className={`font-mono text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{accountId}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Language</label>
                  <p className={`mt-1 uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{languageCode}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className={`rounded-xl p-6 ${theme === 'dark' 
              ? 'bg-[#1a1b2e]/90 border border-white/10' 
              : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="flex items-center mb-4">
                <Phone className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
              </div>
              <div className="space-y-4">
                {primaryPhone && primaryPhone !== 'N/A' && (
                  <div className="flex items-center">
                    <Phone className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
                    <div>
                      <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Primary Phone</label>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <a href={`tel:${primaryPhone}`} className={theme === 'dark' ? 'hover:text-blue-400' : 'text-blue-600 hover:text-blue-700'}>
                          {primaryPhone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {selectedBusiness.phoneNumbers?.additionalPhones?.length > 0 && (
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Additional Phones</label>
                    <div className="space-y-2">
                      {selectedBusiness.phoneNumbers.additionalPhones.map((phone, idx) => {
                        const phoneNumber = extractValue(phone, 'number', 'phoneNumber');
                        return (
                          <div key={idx} className="flex items-center">
                            <Phone className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
                            <a href={`tel:${phoneNumber}`} className={theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}>
                              {phoneNumber}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {websiteUri && websiteUri !== 'N/A' && (
                  <div className="flex items-center">
                    <Globe className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
                    <div>
                      <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Website</label>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        <a 
                          href={websiteUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {websiteUri}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Map */}
            {(selectedBusiness.latlng?.latitude || selectedBusiness.latlng?.longitude) && (
              <div className={`rounded-xl p-6 ${theme === 'dark' 
                ? 'bg-[#1a1b2e]/90 border border-white/10' 
                : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <MapPin className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Location</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Latitude</label>
                      <p className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{extractValue(selectedBusiness.latlng?.latitude, 'value', 'lat')}</p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Longitude</label>
                      <p className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{extractValue(selectedBusiness.latlng?.longitude, 'value', 'lng')}</p>
                    </div>
                  </div>
                  {selectedBusiness.metadata?.mapsUri && (
                    <a
                      href={extractValue(selectedBusiness.metadata?.mapsUri, 'url', 'uri')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={theme === 'dark' ? 'inline-flex items-center text-blue-400 hover:text-blue-300' : 'inline-flex items-center text-blue-600 hover:text-blue-700'}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {selectedBusiness.latlng?.latitude && selectedBusiness.latlng?.longitude && (
                    <div className={`mt-4 rounded-lg overflow-hidden ${theme === 'dark' ? 'border border-white/10' : 'border border-gray-200'}`}>
                      <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${extractValue(selectedBusiness.latlng?.latitude, 'value', 'lat')},${extractValue(selectedBusiness.latlng?.longitude, 'value', 'lng')}`}
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Hours */}
            {selectedBusiness.regularHours?.periods && selectedBusiness.regularHours.periods.length > 0 && (
              <div className={`rounded-xl p-6 ${theme === 'dark' 
                ? 'bg-[#1a1b2e]/90 border border-white/10' 
                : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <Clock className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Business Hours</h2>
                </div>
                <div className="space-y-2">
                  {selectedBusiness.regularHours.periods.map((period, idx) => {
                    // Extract values properly for open/close days and times
                    const openDay = extractValue(period.openDay, 'day', 'openDay');
                    const closeDay = extractValue(period.closeDay, 'day', 'closeDay');
                    const openTime = period.openTime || {};
                    const closeTime = period.closeTime || {};
                    
                    return (
                      <div key={idx} className={`flex items-center justify-between py-2 last:border-0 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getDayName(openDay)}</span>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {formatTime(openTime)} - {formatTime(closeTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories */}
            {selectedBusiness.categories && (
              <div className={`rounded-xl p-6 ${theme === 'dark' 
                ? 'bg-[#1a1b2e]/90 border border-white/10' 
                : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <Tag className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Categories</h2>
                </div>
                <div className="space-y-4">
                  {selectedBusiness.categories.primaryCategory && (
                    <div>
                      <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Primary Category</label>
                      <div className={`rounded-lg p-3 ${theme === 'dark' 
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'bg-blue-100 border border-blue-200'}`}>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {extractValue(selectedBusiness.categories.primaryCategory, 'displayName', 'name')}
                        </p>
                        {selectedBusiness.categories.primaryCategory.name && (
                          <p className={`text-sm mt-1 font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                            {extractValue(selectedBusiness.categories.primaryCategory.name)}
                          </p>
                        )}
                      </div>
                      {selectedBusiness.categories.primaryCategory.serviceTypes?.length > 0 && (
                        <div className="mt-3">
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Service Types</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBusiness.categories.primaryCategory.serviceTypes.map((type, idx) => (
                              <span key={idx} className={`rounded-full text-sm ${theme === 'dark' 
                                ? 'px-3 py-1 bg-blue-500/20 text-white' 
                                : 'px-3 py-1 bg-blue-100 text-blue-900'}`}>
                                {extractValue(type, 'displayName', 'serviceTypeId', 'name')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedBusiness.categories.additionalCategories?.length > 0 && (
                    <div>
                      <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Additional Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedBusiness.categories.additionalCategories.map((cat, idx) => (
                          <span key={idx} className={`rounded-full text-sm ${theme === 'dark' 
                            ? 'px-3 py-1 bg-blue-500/20 text-white' 
                            : 'px-3 py-1 bg-blue-100 text-blue-900'}`}>
                            {extractValue(cat, 'displayName', 'name')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className={`rounded-xl p-6 mb-6 ${theme === 'dark' 
              ? 'bg-[#1a1b2e]/90 border border-white/10' 
              : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
              <div className="space-y-3">
                {selectedBusiness.metadata?.newReviewUri && (
                  <a
                    href={extractValue(selectedBusiness.metadata.newReviewUri, 'url', 'uri')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${theme === 'dark' 
                      ? 'bg-blue-500/10 hover:bg-blue-500/20' 
                      : 'bg-blue-100 hover:bg-blue-200'}`}
                  >
                    <span className={theme === 'dark' ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium'}>Get Reviews</span>
                    <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </a>
                )}
                {selectedBusiness.metadata?.mapsUri && (
                  <a
                    href={extractValue(selectedBusiness.metadata.mapsUri, 'url', 'uri')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${theme === 'dark' 
                      ? 'bg-green-500/10 hover:bg-green-500/20' 
                      : 'bg-green-100 hover:bg-green-200'}`}
                  >
                    <span className={theme === 'dark' ? 'text-green-300 font-medium' : 'text-green-700 font-medium'}>View on Maps</span>
                    <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  </a>
                )}
                {websiteUri && websiteUri !== 'N/A' && (
                  <a
                    href={websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${theme === 'dark' 
                      ? 'bg-blue-500/10 hover:bg-blue-500/20' 
                      : 'bg-blue-100 hover:bg-blue-200'}`}
                  >
                    <span className={theme === 'dark' ? 'text-blue-300 font-medium' : 'text-blue-700 font-medium'}>Visit Website</span>
                    <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </a>
                )}
              </div>
            </div>

            {/* Metadata & Status */}
            {selectedBusiness.metadata && (
              <div className={`rounded-xl p-6 ${theme === 'dark' 
                ? 'bg-[#1a1b2e]/90 border border-white/10' 
                : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center mb-4">
                  <Info className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}`} />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Status & Permissions</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Can Delete</span>
                    {selectedBusiness.metadata.canDelete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Can Modify Service List</span>
                    {selectedBusiness.metadata.canModifyServicelist ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Google Updated</span>
                    {selectedBusiness.metadata.hasGoogleUpdated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Voice of Merchant</span>
                    {selectedBusiness.metadata.hasVoiceOfMerchant ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {selectedBusiness.metadata.placeId && (
                    <div className={`pt-3 ${theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
                      <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Place ID</label>
                      <p className={`font-mono text-xs mt-1 break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {extractValue(selectedBusiness.metadata.placeId, 'id', 'placeId')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className={`rounded-xl p-6 ${theme === 'dark' 
              ? 'bg-[#1a1b2e]/90 border border-white/10' 
              : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Additional Info</h2>
              <div className="space-y-3 text-sm">
                {selectedBusiness.storefrontAddress && (
                  <div className="mt-4">
                    <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Storefront Address</h3>
                    <div className={`p-4 rounded-lg space-y-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      {selectedBusiness.storefrontAddress.addressLines?.map((line, i) => (
                        <div key={i} className="break-words">{line}</div>
                      ))}
                      <div className="break-words">
                        {[
                          selectedBusiness.storefrontAddress.locality,
                          selectedBusiness.storefrontAddress.administrativeArea,
                          selectedBusiness.storefrontAddress.postalCode,
                          selectedBusiness.storefrontAddress.regionCode
                        ].filter(Boolean).join(', ')}
                      </div>
                      <div className="text-sm opacity-75 mt-1">
                        Language: {selectedBusiness.storefrontAddress.languageCode || 'en'}
                      </div>
                    </div>
                  </div>
                )}
                {selectedBusiness.serviceArea && (
                  <div>
                    <label className={`font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Service Area</label>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedBusiness.serviceArea.businessTypeId ? 
                        `Type: ${selectedBusiness.serviceArea.businessTypeId}` : 
                        'Service area information'}
                      {selectedBusiness.serviceArea.places?.length > 0 && 
                        ` - Places: ${selectedBusiness.serviceArea.places.length}`}
                    </p>
                  </div>
                )}
                {selectedBusiness.labels && selectedBusiness.labels.length > 0 && (
                  <div>
                    <label className={`font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Labels</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBusiness.labels.map((label, idx) => (
                        <span key={idx} className={`rounded text-xs ${theme === 'dark' 
                          ? 'px-2 py-1 bg-blue-500/20 text-blue-300' 
                          : 'px-2 py-1 bg-blue-100 text-blue-700'}`}>
                          {extractValue(label, 'displayName', 'name')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;