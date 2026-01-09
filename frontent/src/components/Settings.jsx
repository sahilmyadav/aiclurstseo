import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  // Handle save changes
  const handleSaveChanges = () => {
    // Here you can add your save logic
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
