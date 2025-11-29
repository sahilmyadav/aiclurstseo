import React from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import { useNavigate } from 'react-router-dom';
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
  XCircle
} from 'lucide-react';

const BusinessDetails = () => {
  const { selectedBusiness, loading } = useGoogleBusiness();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1020]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1020]">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Business Selected</h2>
          <p className="text-white/60 mb-4">Please select a business to view details</p>
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

  return (
    <div className="min-h-screen bg-[#0f1020] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/integrations')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Integrations
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{businessTitle}</h1>
          <p className="text-white/60">Complete business information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/60">Business Name</label>
                  <p className="text-white font-semibold mt-1">{businessTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/60">Store Code</label>
                  <p className="text-white mt-1">{storeCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/60">Location ID</label>
                  <p className="text-white font-mono text-sm mt-1">{locationId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/60">Account ID</label>
                  <p className="text-white font-mono text-sm mt-1">{accountId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/60">Language</label>
                  <p className="text-white mt-1 uppercase">{languageCode}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Contact Information</h2>
              </div>
              <div className="space-y-4">
                {primaryPhone && primaryPhone !== 'N/A' && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-white/60 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-white/60">Primary Phone</label>
                      <p className="text-white font-semibold">
                        <a href={`tel:${primaryPhone}`} className="hover:text-purple-400">
                          {primaryPhone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {selectedBusiness.phoneNumbers?.additionalPhones?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">Additional Phones</label>
                    <div className="space-y-2">
                      {selectedBusiness.phoneNumbers.additionalPhones.map((phone, idx) => {
                        const phoneNumber = extractValue(phone, 'number', 'phoneNumber');
                        return (
                          <div key={idx} className="flex items-center">
                            <Phone className="w-4 h-4 text-white/60 mr-2" />
                            <a href={`tel:${phoneNumber}`} className="text-white hover:text-purple-400">
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
                    <Globe className="w-5 h-5 text-white/60 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-white/60">Website</label>
                      <p className="text-white">
                        <a 
                          href={websiteUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center"
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
              <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Location</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white/60">Latitude</label>
                      <p className="text-white font-mono">{extractValue(selectedBusiness.latlng?.latitude, 'value', 'lat')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/60">Longitude</label>
                      <p className="text-white font-mono">{extractValue(selectedBusiness.latlng?.longitude, 'value', 'lng')}</p>
                    </div>
                  </div>
                  {selectedBusiness.metadata?.mapsUri && (
                    <a
                      href={extractValue(selectedBusiness.metadata?.mapsUri, 'url', 'uri')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-400 hover:text-purple-300"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {selectedBusiness.latlng?.latitude && selectedBusiness.latlng?.longitude && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
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
              <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Business Hours</h2>
                </div>
                <div className="space-y-2">
                  {selectedBusiness.regularHours.periods.map((period, idx) => {
                    // Extract values properly for open/close days and times
                    const openDay = extractValue(period.openDay, 'day', 'openDay');
                    const closeDay = extractValue(period.closeDay, 'day', 'closeDay');
                    const openTime = period.openTime || {};
                    const closeTime = period.closeTime || {};
                    
                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <span className="text-white font-medium">{getDayName(openDay)}</span>
                        <span className="text-white">
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
              <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
                <div className="flex items-center mb-4">
                  <Tag className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Categories</h2>
                </div>
                <div className="space-y-4">
                  {selectedBusiness.categories.primaryCategory && (
                    <div>
                      <label className="text-sm font-medium text-white/60 mb-2 block">Primary Category</label>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <p className="text-white font-semibold">
                          {extractValue(selectedBusiness.categories.primaryCategory, 'displayName', 'name')}
                        </p>
                        {selectedBusiness.categories.primaryCategory.name && (
                          <p className="text-purple-300 text-sm mt-1 font-mono">
                            {extractValue(selectedBusiness.categories.primaryCategory.name)}
                          </p>
                        )}
                      </div>
                      {selectedBusiness.categories.primaryCategory.serviceTypes?.length > 0 && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-white/60 mb-2 block">Service Types</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBusiness.categories.primaryCategory.serviceTypes.map((type, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
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
                      <label className="text-sm font-medium text-white/60 mb-2 block">Additional Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedBusiness.categories.additionalCategories.map((cat, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
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
            <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {selectedBusiness.metadata?.newReviewUri && (
                  <a
                    href={extractValue(selectedBusiness.metadata.newReviewUri, 'url', 'uri')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition"
                  >
                    <span className="text-purple-300 font-medium">Get Reviews</span>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </a>
                )}
                {selectedBusiness.metadata?.mapsUri && (
                  <a
                    href={extractValue(selectedBusiness.metadata.mapsUri, 'url', 'uri')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition"
                  >
                    <span className="text-green-300 font-medium">View on Maps</span>
                    <ExternalLink className="w-4 h-4 text-green-400" />
                  </a>
                )}
                {websiteUri && websiteUri !== 'N/A' && (
                  <a
                    href={websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition"
                  >
                    <span className="text-blue-300 font-medium">Visit Website</span>
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Metadata & Status */}
            {selectedBusiness.metadata && (
              <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Status & Permissions</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Can Delete</span>
                    {selectedBusiness.metadata.canDelete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Can Modify Service List</span>
                    {selectedBusiness.metadata.canModifyServicelist ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Google Updated</span>
                    {selectedBusiness.metadata.hasGoogleUpdated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Voice of Merchant</span>
                    {selectedBusiness.metadata.hasVoiceOfMerchant ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  {selectedBusiness.metadata.placeId && (
                    <div className="pt-3 border-t border-white/10">
                      <label className="text-sm font-medium text-white/60">Place ID</label>
                      <p className="text-white font-mono text-xs mt-1 break-all">
                        {extractValue(selectedBusiness.metadata.placeId, 'id', 'placeId')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-[#1a1b2e]/90 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Additional Info</h2>
              <div className="space-y-3 text-sm">
                {selectedBusiness.storefrontAddress && (
                  <div>
                    <label className="text-white/60 font-medium">Address</label>
                    <p className="text-white mt-1">{JSON.stringify(selectedBusiness.storefrontAddress)}</p>
                  </div>
                )}
                {selectedBusiness.serviceArea && (
                  <div>
                    <label className="text-white/60 font-medium">Service Area</label>
                    <p className="text-white mt-1">
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
                    <label className="text-white/60 font-medium">Labels</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBusiness.labels.map((label, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
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