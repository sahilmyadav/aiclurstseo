import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { selectedBusiness, tokenDetails, isConnected } = useGoogleBusiness();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Handle save changes
  const handleSaveChanges = () => {
    // Here you can add your save logic
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
  };

  // Fetch Google My Business photos
  const fetchPhotos = async () => {
    if (!isConnected || !selectedBusiness || !tokenDetails?.accessToken) {
      setPhotos([]);
      return;
    }

    setLoadingPhotos(true);
    try {
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name?.split('/')[1];
      
      if (!accountId || !locationId) {
        throw new Error('Missing account or location ID');
      }

      const BACKEND_URL = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
      
      // Build URL with OAuth parameters
      const params = new URLSearchParams({
        access_token: tokenDetails.accessToken,
        ...(tokenDetails.refreshToken && { refresh_token: tokenDetails.refreshToken }),
        ...(tokenDetails.expiryDate && { expiry_date: tokenDetails.expiryDate.getTime() })
      });

      const url = `${BACKEND_URL}/auth/google/accounts/${accountId}/locations/${locationId}/media?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setPhotos(data.mediaItems || []);
      } else {
        console.error('Failed to fetch photos:', data.error);
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load user data from AuthContext
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.displayName || user.name || '',
      email: user.email || '',
    });
    
    setIsLoading(false);
  }, [user]);

  // Fetch photos when business or tokens change
  useEffect(() => {
    fetchPhotos();
  }, [selectedBusiness, tokenDetails, isConnected]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2a2440] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex ${
      theme === 'dark' ? 'text-white bg-[#0f1020]' : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'
    }`}>
      <div className="flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-purple-900'
            }`}>
              ACCOUNT SETTINGS
            </h1>
          </div>

          <div className={`rounded-2xl p-4 sm:p-6 ${
            theme === 'dark' 
              ? 'bg-[#121324]/90 border-white/5' 
              : 'bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] border border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-purple-900'
            }`}>
              Profile Information
            </h3>
          
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                } mb-1`}>
                  Name
                </label>
                <div className={`rounded-lg p-3 ${
                  theme === 'dark' 
                    ? 'bg-[#1a1b2e]/90 border-white/10' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formData.name || 'Not set'}</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                } mb-1`}>
                  Email
                </label>
                <div className={`rounded-lg p-3 ${
                  theme === 'dark' 
                    ? 'bg-[#1a1b2e]/90 border-white/10' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formData.email || 'Not set'}</span>
                </div>
              </div>
              
              {/* Save Changes Button */}
              {/* <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  Save Changes
                </button>
              </div> */}
            </div>
          </div>

          {/* Google My Business Photos Section */}
          {isConnected && selectedBusiness && (
            <div className={`rounded-2xl p-4 sm:p-6 ${
              theme === 'dark' 
                ? 'bg-[#121324]/90 border-white/5' 
                : 'bg-white hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] border border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-purple-900'
                }`}>
                  Google My Business Photos
                </h3>
                <button
                  onClick={fetchPhotos}
                  disabled={loadingPhotos}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'
                      : 'bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50'
                  }`}
                >
                  {loadingPhotos ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loadingPhotos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => {
                    // Mobile pattern: 2-1-2-1-2-1...
                    // Desktop: uniform 4 columns
                    const isMobile = window.innerWidth < 640; // sm breakpoint
                    let rowSpan = 1;
                    let colSpan = 1;
                    
                    if (isMobile) {
                      const rowNumber = Math.floor(index / 2); // 0, 0, 1, 1, 2, 2, 3, 3...
                      // Even rows (0, 2, 4...) get 2 images
                      // Odd rows (1, 3, 5...) get 1 image that spans both columns
                      if (rowNumber % 2 === 1) {
                        // Odd row - single tall image spanning 2 columns
                        rowSpan = 2;
                        colSpan = 2;
                      }
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isMobile && rowSpan === 2 ? 'row-span-2 col-span-2' : 'row-span-1'
                        } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                      >
                        <div className="relative group">
                          <img 
                            src={photo.thumbnailUrl || photo.googleUrl} 
                            alt={`Business photo ${index + 1}`}
                            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              isMobile && rowSpan === 2 ? 'h-48' : 'h-32'
                            }`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300/800080/FFFFFF?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3">
                            <p className={`text-sm font-medium transition-opacity duration-300 group-hover:opacity-100 ${
                              theme === 'dark' 
                                ? 'text-white opacity-0' 
                                : 'text-gray-900 opacity-0'
                            }`}>
                              {photo.description || `Photo ${index + 1}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No photos found for this business
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;