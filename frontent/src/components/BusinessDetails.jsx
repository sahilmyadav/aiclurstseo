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
    if (!timeObj || timeObj.hours === undefined) return 'N/A';
    const hours = timeObj.hours || 0;
    const minutes = timeObj.minutes || 0;
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

  const locationId = selectedBusiness.name?.split("/")[1] || 'N/A';
  const accountId = selectedBusiness.accountId || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/integrations')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Integrations
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{typeof selectedBusiness.title === 'object' ? (selectedBusiness.title.name || selectedBusiness.title.displayName || 'Business Details') : (selectedBusiness.title || 'Business Details')}</h1>
          <p className="text-gray-600">Complete business information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{typeof selectedBusiness.title === 'object' ? (selectedBusiness.title.name || selectedBusiness.title.displayName || 'N/A') : (selectedBusiness.title || 'N/A')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Store Code</label>
                  <p className="text-gray-900 mt-1">{typeof selectedBusiness.storeCode === 'object' ? (selectedBusiness.storeCode.code || selectedBusiness.storeCode.storeCode || 'N/A') : (selectedBusiness.storeCode || 'N/A')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location ID</label>
                  <p className="text-gray-900 font-mono text-sm mt-1">{typeof locationId === 'object' ? (locationId.id || locationId.locationId || 'N/A') : locationId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account ID</label>
                  <p className="text-gray-900 font-mono text-sm mt-1">{typeof accountId === 'object' ? (accountId.id || accountId.accountId || 'N/A') : accountId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <p className="text-gray-900 mt-1 uppercase">{typeof selectedBusiness.languageCode === 'object' ? (selectedBusiness.languageCode.code || selectedBusiness.languageCode.languageCode || 'N/A') : (selectedBusiness.languageCode || 'N/A')}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="space-y-4">
                {selectedBusiness.phoneNumbers?.primaryPhone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Primary Phone</label>
                      <p className="text-gray-900 font-semibold">
                        <a href={`tel:${typeof selectedBusiness.phoneNumbers.primaryPhone === 'object' ? selectedBusiness.phoneNumbers.primaryPhone.number || selectedBusiness.phoneNumbers.primaryPhone.phoneNumber || '' : selectedBusiness.phoneNumbers.primaryPhone}`} className="hover:text-indigo-600">
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
                          <a href={`tel:${typeof phone === 'object' ? phone.number || phone.phoneNumber || '' : phone}`} className="text-gray-900 hover:text-indigo-600">
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
                      <p className="text-gray-900">
                        <a 
                          href={typeof selectedBusiness.websiteUri === 'object' ? selectedBusiness.websiteUri.url || selectedBusiness.websiteUri.websiteUrl || '' : selectedBusiness.websiteUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 flex items-center"
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

            {/* Location & Map */}
            {selectedBusiness.latlng && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Latitude</label>
                      <p className="text-gray-900 font-mono">{typeof selectedBusiness.latlng.latitude === 'object' ? (selectedBusiness.latlng.latitude.value || selectedBusiness.latlng.latitude.lat || 'N/A') : (selectedBusiness.latlng.latitude || 'N/A')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Longitude</label>
                      <p className="text-gray-900 font-mono">{typeof selectedBusiness.latlng.longitude === 'object' ? (selectedBusiness.latlng.longitude.value || selectedBusiness.latlng.longitude.lng || 'N/A') : (selectedBusiness.latlng.longitude || 'N/A')}</p>
                    </div>
                  </div>
                  {selectedBusiness.metadata?.mapsUri && (
                    <a
                      href={typeof selectedBusiness.metadata.mapsUri === 'object' ? selectedBusiness.metadata.mapsUri.url || selectedBusiness.metadata.mapsUri.uri || '' : selectedBusiness.metadata.mapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {selectedBusiness.latlng.latitude && selectedBusiness.latlng.longitude && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
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

            {/* Business Hours */}
            {selectedBusiness.regularHours && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
                </div>
                {selectedBusiness.regularHours.periods && selectedBusiness.regularHours.periods.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBusiness.regularHours.periods.map((period, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 font-medium">{getDayName(typeof period.openDay === 'object' ? (period.openDay.day || period.openDay.openDay || '') : period.openDay)}</span>
                        <span className="text-gray-900">
                          {formatTime(typeof period.openTime === 'object' ? (period.openTime.time || period.openTime.openTime || {}) : period.openTime)} - {formatTime(typeof period.closeTime === 'object' ? (period.closeTime.time || period.closeTime.closeTime || {}) : period.closeTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hours available</p>
                )}
              </div>
            )}

            {/* Categories */}
            {selectedBusiness.categories && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Tag className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                </div>
                <div className="space-y-4">
                  {selectedBusiness.categories.primaryCategory && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Primary Category</label>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-indigo-900 font-semibold">
                          {typeof selectedBusiness.categories.primaryCategory.displayName === 'object' ? (selectedBusiness.categories.primaryCategory.displayName.name || selectedBusiness.categories.primaryCategory.displayName.displayName || 'N/A') : (selectedBusiness.categories.primaryCategory.displayName || 'N/A')}
                        </p>
                        {selectedBusiness.categories.primaryCategory.name && (
                          <p className="text-indigo-600 text-sm mt-1 font-mono">
                            {typeof selectedBusiness.categories.primaryCategory.name === 'object' ? (selectedBusiness.categories.primaryCategory.name.name || selectedBusiness.categories.primaryCategory.name.categoryName || 'N/A') : selectedBusiness.categories.primaryCategory.name}
                          </p>
                        )}
                      </div>
                      {selectedBusiness.categories.primaryCategory.serviceTypes?.length > 0 && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-500 mb-2 block">Service Types</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBusiness.categories.primaryCategory.serviceTypes.map((type, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
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
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Additional Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedBusiness.categories.additionalCategories.map((cat, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {typeof cat === 'object' ? (cat.displayName || cat.name || 'Unnamed Category') : cat}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {selectedBusiness.metadata?.newReviewUri && (
                  <a
                    href={typeof selectedBusiness.metadata.newReviewUri === 'object' ? selectedBusiness.metadata.newReviewUri.url || selectedBusiness.metadata.newReviewUri.uri || '' : selectedBusiness.metadata.newReviewUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    <span className="text-indigo-700 font-medium">Get Reviews</span>
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                  </a>
                )}
                {selectedBusiness.metadata?.mapsUri && (
                  <a
                    href={typeof selectedBusiness.metadata.mapsUri === 'object' ? selectedBusiness.metadata.mapsUri.url || selectedBusiness.metadata.mapsUri.uri || '' : selectedBusiness.metadata.mapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
                  >
                    <span className="text-green-700 font-medium">View on Maps</span>
                    <ExternalLink className="w-4 h-4 text-green-600" />
                  </a>
                )}
                {selectedBusiness.websiteUri && (
                  <a
                    href={typeof selectedBusiness.websiteUri === 'object' ? selectedBusiness.websiteUri.url || selectedBusiness.websiteUri.websiteUrl || '' : selectedBusiness.websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    <span className="text-blue-700 font-medium">Visit Website</span>
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Metadata & Status */}
            {selectedBusiness.metadata && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Status & Permissions</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Delete</span>
                    {selectedBusiness.metadata.canDelete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Modify Service List</span>
                    {selectedBusiness.metadata.canModifyServicelist ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Google Updated</span>
                    {selectedBusiness.metadata.hasGoogleUpdated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice of Merchant</span>
                    {selectedBusiness.metadata.hasVoiceOfMerchant ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {selectedBusiness.metadata.placeId && (
                    <div className="pt-3 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-500">Place ID</label>
                      <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                        {typeof selectedBusiness.metadata.placeId === 'object' ? (selectedBusiness.metadata.placeId.id || selectedBusiness.metadata.placeId.placeId || 'N/A') : (selectedBusiness.metadata.placeId || 'N/A')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Info</h2>
              <div className="space-y-3 text-sm">
                {selectedBusiness.storefrontAddress && (
                  <div>
                    <label className="text-gray-500 font-medium">Address</label>
                    <p className="text-gray-900 mt-1">{typeof selectedBusiness.storefrontAddress === 'object' ? JSON.stringify(selectedBusiness.storefrontAddress) : selectedBusiness.storefrontAddress}</p>
                  </div>
                )}
                {selectedBusiness.serviceArea && (
                  <div>
                    <label className="text-gray-500 font-medium">Service Area</label>
                    <p className="text-gray-900 mt-1">
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
                    <label className="text-gray-500 font-medium">Labels</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBusiness.labels.map((label, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {typeof label === 'object' ? (label.displayName || label.name || 'Unnamed Label') : label}
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

