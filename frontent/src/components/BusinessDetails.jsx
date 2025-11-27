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
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

const BusinessDetails = () => {
  const { selectedBusiness, loading } = useGoogleBusiness();
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
          <p className="text-gray-600 mb-4">Please select a business to view details</p>
          <button
            onClick={() => navigate('/dashboard/integrations')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Integrations
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatTime = (timeObj) => {
    if (!timeObj) return 'Closed';
    
    // Handle different time object structures
    let hours, minutes = 0; // Default minutes to 0 if not provided
    
    // Handle object format: { hours: number, minutes?: number } or { hour: number, minute?: number }
    if (typeof timeObj === 'object') {
      hours = timeObj.hours !== undefined ? timeObj.hours : timeObj.hour;
      minutes = timeObj.minutes !== undefined ? timeObj.minutes : (timeObj.minute || 0);
    }
    
    // If hours is still undefined, return 'Closed'
    if (hours === undefined) return 'Closed';
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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

  const locationId = selectedBusiness.name?.split("/")[1] || 'N/A';
  const accountId = selectedBusiness.accountId || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/integrations')}
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Integrations
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{typeof selectedBusiness.title === 'object' ? (selectedBusiness.title.name || selectedBusiness.title.displayName || 'Business Details') : (selectedBusiness.title || 'Business Details')}</h1>
          <p className="text-gray-400">Complete business information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-indigo-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Business Name</label>
                  <p className="text-white font-semibold mt-1">{typeof selectedBusiness.title === 'object' ? (selectedBusiness.title.name || selectedBusiness.title.displayName || 'N/A') : (selectedBusiness.title || 'N/A')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Store Code</label>
                  <p className="text-gray-200 mt-1">{typeof selectedBusiness.storeCode === 'object' ? (selectedBusiness.storeCode.code || selectedBusiness.storeCode.storeCode || 'N/A') : (selectedBusiness.storeCode || 'N/A')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Location ID</label>
                  <p className="text-indigo-300 font-mono text-sm mt-1">{typeof locationId === 'object' ? (locationId.id || locationId.locationId || 'N/A') : locationId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Account ID</label>
                  <p className="text-indigo-300 font-mono text-sm mt-1">{typeof accountId === 'object' ? (accountId.id || accountId.accountId || 'N/A') : accountId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Language</label>
                  <p className="text-gray-200 mt-1 uppercase">{typeof selectedBusiness.languageCode === 'object' ? (selectedBusiness.languageCode.code || selectedBusiness.languageCode.languageCode || 'N/A') : (selectedBusiness.languageCode || 'N/A')}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-indigo-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Contact Information</h2>
              </div>
              <div className="space-y-4">
                {selectedBusiness.phoneNumbers?.primaryPhone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Primary Phone</label>
                      <p className="text-white font-semibold">
                        <a href={`tel:${typeof selectedBusiness.phoneNumbers.primaryPhone === 'object' ? selectedBusiness.phoneNumbers.primaryPhone.number || selectedBusiness.phoneNumbers.primaryPhone.phoneNumber || '' : selectedBusiness.phoneNumbers.primaryPhone}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                          {typeof selectedBusiness.phoneNumbers.primaryPhone === 'object' ? (selectedBusiness.phoneNumbers.primaryPhone.number || selectedBusiness.phoneNumbers.primaryPhone.phoneNumber || 'Unknown Number') : selectedBusiness.phoneNumbers.primaryPhone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {selectedBusiness.phoneNumbers?.additionalPhones?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Additional Phones</label>
                    <div className="space-y-2">
                      {selectedBusiness.phoneNumbers.additionalPhones.map((phone, idx) => (
                        <div key={idx} className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`tel:${typeof phone === 'object' ? phone.number || phone.phoneNumber || '' : phone}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            {typeof phone === 'object' ? (phone.number || phone.phoneNumber || 'Unknown Number') : phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedBusiness.websiteUri && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-white">
                        <a 
                          href={typeof selectedBusiness.websiteUri === 'object' ? selectedBusiness.websiteUri.url || selectedBusiness.websiteUri.websiteUrl || '' : selectedBusiness.websiteUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center transition-colors"
                        >
                          {typeof selectedBusiness.websiteUri === 'object' ? (selectedBusiness.websiteUri.url || selectedBusiness.websiteUri.websiteUrl || 'Unknown Website') : selectedBusiness.websiteUri}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {selectedBusiness.categories && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
                <div className="flex items-center mb-4">
                  <Tag className="w-6 h-6 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Categories</h2>
                </div>
                <div className="space-y-4">
                  {selectedBusiness.categories.primaryCategory && (
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Primary Category</label>
                      <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-3">
                        <p className="text-indigo-300 font-semibold">
                          {typeof selectedBusiness.categories.primaryCategory.displayName === 'object' ? (selectedBusiness.categories.primaryCategory.displayName.name || selectedBusiness.categories.primaryCategory.displayName.displayName || 'N/A') : (selectedBusiness.categories.primaryCategory.displayName || 'N/A')}
                        </p>
                        {selectedBusiness.categories.primaryCategory.name && (
                          <p className="text-indigo-400 text-sm mt-1 font-mono">
                            {typeof selectedBusiness.categories.primaryCategory.name === 'object' ? (selectedBusiness.categories.primaryCategory.name.name || selectedBusiness.categories.primaryCategory.name.categoryName || 'N/A') : selectedBusiness.categories.primaryCategory.name}
                          </p>
                        )}
                      </div>
                      {selectedBusiness.categories.primaryCategory.serviceTypes?.length > 0 && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Service Types</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBusiness.categories.primaryCategory.serviceTypes.map((type, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm hover:bg-indigo-600/50 transition-colors">
                                {typeof type === 'object' ? (type.displayName || type.serviceTypeId || 'Unnamed Service') : type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedBusiness.categories.additionalCategories?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Additional Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedBusiness.categories.additionalCategories.map((cat, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm hover:bg-indigo-600/50 transition-colors">
                            {typeof cat === 'object' ? (cat.displayName || cat.name || 'Unnamed Category') : cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location & Map */}
            {selectedBusiness.latlng && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Location</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Latitude</label>
                      <p className="text-indigo-300 font-mono">{typeof selectedBusiness.latlng.latitude === 'object' ? (selectedBusiness.latlng.latitude.value || selectedBusiness.latlng.latitude.lat || 'N/A') : (selectedBusiness.latlng.latitude || 'N/A')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Longitude</label>
                      <p className="text-indigo-300 font-mono">{typeof selectedBusiness.latlng.longitude === 'object' ? (selectedBusiness.latlng.longitude.value || selectedBusiness.latlng.longitude.lng || 'N/A') : (selectedBusiness.latlng.longitude || 'N/A')}</p>
                    </div>
                  </div>
                  {selectedBusiness.metadata?.mapsUri && (
                    <a
                      href={typeof selectedBusiness.metadata.mapsUri === 'object' ? selectedBusiness.metadata.mapsUri.url || selectedBusiness.metadata.mapsUri.uri || '' : selectedBusiness.metadata.mapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {selectedBusiness.latlng.latitude && selectedBusiness.latlng.longitude && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-600">
                      <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${typeof selectedBusiness.latlng.latitude === 'object' ? (selectedBusiness.latlng.latitude.value || selectedBusiness.latlng.latitude.lat || 0) : (selectedBusiness.latlng.latitude || 0)},${typeof selectedBusiness.latlng.longitude === 'object' ? (selectedBusiness.latlng.longitude.value || selectedBusiness.latlng.longitude.lng || 0) : (selectedBusiness.latlng.longitude || 0)}`}
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Hours - Moved to right column */}
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-4">
                {/* Review Link */}
                {selectedBusiness.metadata?.newReviewUri && (() => {
                  const reviewUrl = typeof selectedBusiness.metadata.newReviewUri === 'object' 
                    ? selectedBusiness.metadata.newReviewUri.url || selectedBusiness.metadata.newReviewUri.uri || '' 
                    : selectedBusiness.metadata.newReviewUri;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">Review Link</span>
                        <button
                          onClick={() => copyToClipboard(reviewUrl, 'review')}
                          className="text-gray-500 hover:text-indigo-400 transition flex items-center gap-1 text-xs"
                          title="Copy to clipboard"
                        >
                          {copied === 'review' ? 'Copied!' : 'Copy'}
                          {copied === 'review' ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-300 break-all">{reviewUrl}</p>
                      </div>
                      <a
                        href={reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-3 bg-indigo-900/30 hover:bg-indigo-800/50 rounded-lg transition border border-indigo-800/50 hover:border-indigo-600"
                      >
                        <span className="text-indigo-300 font-medium">Get Reviews</span>
                        <ExternalLink className="w-4 h-4 text-indigo-400" />
                      </a>
                    </div>
                  );
                })()}

                {/* Maps Link */}
                {selectedBusiness.metadata?.mapsUri && (() => {
                  const mapsUrl = typeof selectedBusiness.metadata.mapsUri === 'object' 
                    ? selectedBusiness.metadata.mapsUri.url || selectedBusiness.metadata.mapsUri.uri || '' 
                    : selectedBusiness.metadata.mapsUri;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">Maps Link</span>
                        <button
                          onClick={() => copyToClipboard(mapsUrl, 'maps')}
                          className="text-gray-500 hover:text-green-400 transition flex items-center gap-1 text-xs"
                          title="Copy to clipboard"
                        >
                          {copied === 'maps' ? 'Copied!' : 'Copy'}
                          {copied === 'maps' ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-300 break-all">{mapsUrl}</p>
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-3 bg-green-900/20 hover:bg-green-800/30 rounded-lg transition border border-green-800/30 hover:border-green-600"
                      >
                        <span className="text-green-300 font-medium">View on Maps</span>
                        <ExternalLink className="w-4 h-4 text-green-400" />
                      </a>
                    </div>
                  );
                })()}

                {/* Website Link */}
                {selectedBusiness.websiteUri && (() => {
                  const websiteUrl = typeof selectedBusiness.websiteUri === 'object' 
                    ? selectedBusiness.websiteUri.url || selectedBusiness.websiteUri.websiteUrl || '' 
                    : selectedBusiness.websiteUri;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">Website URL</span>
                        <button
                          onClick={() => copyToClipboard(websiteUrl, 'website')}
                          className="text-gray-500 hover:text-blue-400 transition flex items-center gap-1 text-xs"
                          title="Copy to clipboard"
                        >
                          {copied === 'website' ? 'Copied!' : 'Copy'}
                          {copied === 'website' ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-300 break-all">{websiteUrl}</p>
                      </div>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 rounded-lg transition border border-blue-800/30 hover:border-blue-600"
                      >
                        <span className="text-blue-300 font-medium">Visit Website</span>
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </a>
                    </div>
                  );
                })()}

                {/* Business Address */}
                {selectedBusiness.address && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-400">Business Address</span>
                      <button
                        onClick={() => copyToClipboard(
                          typeof selectedBusiness.address === 'object' 
                            ? selectedBusiness.address.formattedAddress || 
                              Object.values(selectedBusiness.address).filter(Boolean).join(', ')
                            : selectedBusiness.address,
                          'address'
                        )}
                        className="text-gray-500 hover:text-gray-300 transition"
                        title="Copy to clipboard"
                      >
                        {copied === 'address' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <p className="text-gray-200">
                        {typeof selectedBusiness.address === 'object' 
                          ? selectedBusiness.address.formattedAddress || 
                            Object.values(selectedBusiness.address).filter(Boolean).join(', ')
                          : selectedBusiness.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata & Status */}
            {selectedBusiness.metadata && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Status & Permissions</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Can Delete</span>
                    {selectedBusiness.metadata.canDelete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Can Modify Service List</span>
                    {selectedBusiness.metadata.canModifyServicelist ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Google Updated</span>
                    {selectedBusiness.metadata.hasGoogleUpdated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Voice of Merchant</span>
                    {selectedBusiness.metadata.hasVoiceOfMerchant ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  {selectedBusiness.metadata.placeId && (
                    <div className="pt-3 border-t border-gray-700">
                      <label className="text-sm font-medium text-gray-400">Place ID</label>
                      <p className="text-indigo-300 font-mono text-xs mt-1 break-all">
                        {typeof selectedBusiness.metadata.placeId === 'object' ? (selectedBusiness.metadata.placeId.id || selectedBusiness.metadata.placeId.placeId || 'N/A') : (selectedBusiness.metadata.placeId || 'N/A')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Hours */}
            {selectedBusiness.regularHours && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:border-indigo-500 transition-colors">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">Business Hours</h2>
                </div>
                {selectedBusiness.regularHours.periods && selectedBusiness.regularHours.periods.length > 0 ? (
                  <div className="space-y-2">
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                      // Find the period for this day
                      const dayPeriod = selectedBusiness.regularHours.periods.find(p => {
                        const openDay = typeof p.openDay === 'object' ? (p.openDay.day || p.openDay.openDay) : p.openDay;
                        return openDay === day;
                      });
                      
                      // Get open and close times directly from the period
                      const openTime = dayPeriod?.openTime || null;
                      const closeTime = dayPeriod?.closeTime || null;
                      
                      return (
                        <div key={day} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                          <span className="text-gray-300 font-medium">{getDayName(day)}</span>
                          <span className="text-white">
                            {openTime ? formatTime(openTime) : 'Closed'}
                            {openTime && closeTime ? ' - ' + formatTime(closeTime) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400">No hours available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;

