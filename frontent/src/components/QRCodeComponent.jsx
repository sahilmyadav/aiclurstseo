import React, { useState, useEffect } from 'react';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import QRCode from 'qrcode';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';

const HowToGetReviewLinkModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1b2e] rounded-xl max-w-md w-full p-6 shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">How to Get Your Google Review Link</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm font-bold">1</div>
            <p>Open <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Business Profile Manager</a></p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm font-bold">2</div>
            <p>Select your business location from the dashboard</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm font-bold">3</div>
            <p>Click on <span className="bg-white/10 px-2 py-0.5 rounded">Home</span> or <span className="bg-white/10 px-2 py-0.5 rounded">Get more reviews</span></p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm font-bold">4</div>
            <p>Copy the review link (it should look like: <code className="bg-black/30 px-1.5 py-0.5 rounded">https://g.page/r/YOUR_PLACE_ID/review</code>)</p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-400">
              <span className="font-semibold">Note:</span> The link should be in the format: <code className="bg-black/30 px-1.5 py-0.5 rounded text-purple-300">https://g.page/r/YOUR_PLACE_ID/review</code>
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const QRCodeComponent = () => {
  const { businesses, selectedBusinesses,selectedBusiness, isConnected, loading } = useGoogleBusiness();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [editablePath, setEditablePath] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [manualReviewUri, setManualReviewUri] = useState('');

  console.log("selectedBusiness", selectedBusiness);
  
  // Set initial manualReviewUri when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      // Extract just the review URI part from the stored URL if it exists
      const storedUri = extractReviewUri(selectedBusiness.metadata?.newReviewUri) || '';
      setManualReviewUri(storedUri);
      setEditablePath('');
      // Don't generate QR code here, it will be handled by the manualReviewUri effect
    }
  }, [selectedBusiness]);

  // Update QR code when manualReviewUri changes
  useEffect(() => {
    if (selectedBusiness) {
      generateQRCode();
    }
  }, [manualReviewUri, selectedBusiness]);

  // Function to extract just the review URI part from a full URL
  const extractReviewUri = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('reviewUri') || '';
    } catch (e) {
      return '';
    }
  };

  const generateQRCode = async () => {
    if (!selectedBusiness) return;
    
    const business = selectedBusiness;
    const locationId = business.name.split('/').pop();
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    
    // Create base URL up to reviewUri=
    const baseUrl = `${frontendUrl}/review/${locationId}?reviewUri=`;
    
    // Always use manualReviewUri if it exists, otherwise fall back to business metadata
    const reviewUri = manualReviewUri || extractReviewUri(business.metadata?.newReviewUri) || '';
    
    // Combine base URL with review URI
    const fullUrl = baseUrl + encodeURIComponent(reviewUri);
    
    // Set the full review link for the QR code and display
    setReviewLink(fullUrl);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(reviewLink, {
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

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-${selectedBusinesses?.title || 'business'}.png`;
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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Main Container */}
      <div className="bg-[#171624]/50 border border-white/5 rounded-lg p-6 sm:p-8 backdrop-blur-sm flex-1 flex flex-col">
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
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-300 text-sm">
            Generate and share your review link
          </p>
        </div>

        {/* Business Selection - Using BusinessProfileDropdown component */}
        <div className="mb-6">
          <BusinessProfileDropdown 
            multiple={selectedBusinesses && selectedBusinesses.length > 1}
          />
        </div>

        {/* Main Content Area - Side by Side Layout */}
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* Left Side - URL Input */}
          <div className="w-full md:w-1/2">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Google Review Link
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    How to get review URL
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Google Review URL
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/20 rounded-lg overflow-hidden">
                      <input
                        type="text"
                        value={manualReviewUri}
                        onChange={(e) => {
                          // Only update the manualReviewUri, generateQRCode will be called by the effect
                          setManualReviewUri(e.target.value);
                        }}
                        placeholder="https://g.page/r/YOUR_PLACE_ID/review"
                        className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none focus:ring-1 focus:ring-purple-500 w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your Google Review URL (e.g., https://g.page/r/YOUR_PLACE_ID/review)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Review Page URL
                    </label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 pr-10 border border-white/20 rounded-lg bg-white/10 text-white text-sm break-all">
                        {reviewLink || 'Enter a review URI above to generate the full URL'}
                      </div>
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
                    <p className="text-xs text-gray-400 mt-2">
                      {reviewLink ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                          <span>QR code will be generated from the review URL above</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Enter a valid Google Review URL to generate QR code</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadQRCode}
                    disabled={!qrCodeUrl}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1v-5a1 1 0 112 0v5a1 1 0 01-1 1zm9-15a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L11 13.586V3a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Download</span>
                  </button>

                  <button
                    onClick={copyLink}
                    disabled={!reviewLink}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  className="flex items-center justify-center gap-2 w-full text-blue-400 hover:text-blue-300 font-medium py-2 px-4 rounded-lg border border-blue-400 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  <span>Open Review Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - QR Code */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-4 rounded-lg shadow-lg h-full flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-800">Scan to Review</h3>
                <p className="text-sm text-gray-500">Share this QR code</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-50 flex items-center justify-center rounded">
                    <span className="text-xs text-gray-400 text-center px-2">QR Code will appear here</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">Scan this code with your phone's camera</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            Share this QR code to get more reviews
          </p>
        </div>
      </div>
      
      <HowToGetReviewLinkModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  )
}

export default QRCodeComponent;