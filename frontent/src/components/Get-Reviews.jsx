import React, { Suspense, lazy, useState } from "react";
import QRCodeComponent from "./QRCodeComponent";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

// Lazy load components for better performance
const SMSComponent = lazy(() => import("./SMSComponent"));
const EmailComponent = lazy(() => import("./EmailComponent"));

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <FaSpinner className="animate-spin text-2xl text-purple-500" />
  </div>
);

const GetReviews = () => {
  const [activeTab, setActiveTab] = useState('email');
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'
    }`}>
      <div className="flex-1 transition-all duration-300 ease-in-out min-h-screen flex flex-col">
        <div className="p-2 sm:p-6 pb-0 flex-shrink-0">
          <div className="flex justify-center gap-1 sm:gap-4 mb-2 sm:mb-6">
            <button 
              onClick={() => setActiveTab('sms')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-base font-medium shadow-md ${
                activeTab === 'sms' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90' 
                  : theme === 'dark' 
                    ? 'bg-[#1a1433] hover:bg-[#241b4d] text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              SMS
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-base font-medium shadow-md ${
                activeTab === 'email' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90' 
                  : theme === 'dark' 
                    ? 'bg-[#1a1433] hover:bg-[#241b4d] text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              EMAIL
            </button>
            <button 
              onClick={() => setActiveTab('qrcode')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-base font-medium shadow-md ${
                activeTab === 'qrcode' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90' 
                  : theme === 'dark' 
                    ? 'bg-[#1a1433] hover:bg-[#241b4d] text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              QR CODE
            </button>
          </div>
        </div>

        <main className={`flex-1 px-2 sm:px-6 pb-2 sm:pb-6 overflow-y-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <div className="h-full">
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === 'sms' && (
                <div className={`h-full flex flex-col items-center justify-center py-12 px-4 text-center ${
                  theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
                } rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-1 rounded-full mb-6">
                    <div className={`${theme === 'dark' ? 'bg-[#1a1433]' : 'bg-white'} p-3 rounded-full`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 3v.01M16 3v.01M12 12h.01M12 21c3.5-2.5 6-4.5 6-7.5 0-3.5-3-4-6-4s-6 .5-6 4c0 3 2.5 5 6 7.5z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>SMS Reviews Coming Soon</h2>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} max-w-md mx-auto`}>
                    We're working on an amazing SMS review collection feature that will help you gather more customer feedback effortlessly.
                  </p>
                </div>
              )}
              {activeTab === 'email' && (
                <div className={`h-full ${
                  theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
                } rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <EmailComponent />
                </div>
              )}
            </Suspense>
            {activeTab === 'qrcode' && (
              <div className={theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'}>
                <QRCodeComponent />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GetReviews;
