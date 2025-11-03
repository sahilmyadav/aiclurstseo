import React, { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import QRCode from 'qrcode';

function QRCodeComponent() {
  const { businesses, selectedBusiness, selectBusiness, isConnected, loading } = useGoogleBusiness();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  
  // Generate QR code when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      generateQRCode();
    }
  }, [selectedBusiness]);

  const generateQRCode = async () => {
    if (!selectedBusiness) return;
    
    // Extract location ID from business name
    const locationId = selectedBusiness.name.split('/').pop();
    const businessName = selectedBusiness.title || 'Business';
    
    // Get frontend URL from env or use current origin
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    
    // Create review link with business info
    const reviewUrl = `${frontendUrl}/review/${locationId}?name=${encodeURIComponent(businessName)}`;
    setReviewLink(reviewUrl);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleBusinessChange = (e) => {
    const businessName = e.target.value;
    const business = businesses.find(b => b.name === businessName);
    if (business) {
      selectBusiness(business);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-${selectedBusiness?.title || 'business'}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const copyLink = () => {
    if (!reviewLink) return;
    navigator.clipboard.writeText(reviewLink);
    // Could add toast notification here
  };

  const openReviewLink = () => {
    if (!reviewLink) return;
    // Open in new tab without affecting current page
    window.open(reviewLink, '_blank', 'noopener,noreferrer');
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-[#171624]/50 border border-white/5 rounded-lg p-8 backdrop-blur-sm text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-purple-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Connect Google Business</h3>
          <p className="text-gray-400 mb-4">
            Please connect your Google Business account to generate QR codes
          </p>
        </div>
      </div>
    );
  }

  if (loading || businesses.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-[#171624]/50 border border-white/5 rounded-lg p-8 backdrop-blur-sm text-center">
          <p className="text-gray-400">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main Container */}
      <div className="bg-[#171624]/50 border border-white/5 rounded-lg p-6 sm:p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">QR Code Generator</h2>
            <button
              className="ml-2 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              title="Refresh local businesses"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-300 text-sm">
            Generate and share your review link
          </p>
        </div>


        {/* Business Selection */}
        {businesses.length > 1 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Business
            </label>
            <div className="relative">
              <select
                value={selectedBusiness?.name || ''}
                onChange={handleBusinessChange}
                className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 text-white transition-all duration-200 appearance-none cursor-pointer"
              >
                {businesses.map((business) => (
                  <option key={business.name} value={business.name} className="bg-[#1a1433] text-white">
                    {business.title || business.name}
                  </option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selected Business
            </label>
            <div className="px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white">
              {selectedBusiness?.title || 'Business'}
            </div>
          </div>
        )}

        {/* Review Link Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review Link
          </label>
          <div className="relative">
            <input
              type="text"
              value={reviewLink}
              readOnly
              className="w-full px-4 py-3 pr-10 border border-white/20 rounded-lg bg-white/10 text-white transition-all duration-200"
            />
            {reviewLink && (
              <button
                onClick={copyLink}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded transition-colors"
                title="Copy link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Generating QR...</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download</span>
            </button>

            <button
              onClick={copyLink}
              disabled={!reviewLink}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>

          <button
            onClick={openReviewLink}
            disabled={!reviewLink}
            className="flex items-center justify-center gap-2 w-full text-blue-400 hover:text-blue-300 font-medium py-3 px-4 rounded-lg border border-blue-400 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            <span>Open Review Link</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            Share this QR code to get more reviews
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRCodeComponent