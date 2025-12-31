import React, { Suspense, lazy, useState } from "react";
import QRCodeComponent from "./QRCodeComponent";
import { FaSpinner } from "react-icons/fa";

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
  const [activeTab, setActiveTab] = useState('sms');

  return (
    <div className="min-h-screen w-full text-white">
      <div className="flex-1 transition-all duration-300 ease-in-out h-screen flex flex-col">
        <div className="p-2 sm:p-6 pb-0 flex-shrink-0">
          <div className="flex justify-center gap-1 sm:gap-4 mb-2 sm:mb-6">
            <button 
              onClick={() => setActiveTab('sms')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-base ${
                activeTab === 'sms' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-[#1a1433] hover:bg-[#241b4d]'
              }`}
            >
              SMS
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-base ${
                activeTab === 'email' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-[#1a1433] hover:bg-[#241b4d]'
              }`}
            >
              EMAIL
            </button>
            <button 
              onClick={() => setActiveTab('qrcode')}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-base ${
                activeTab === 'qrcode' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-[#1a1433] hover:bg-[#241b4d]'
              }`}
            >
              QR CODE
            </button>
          </div>
        </div>

        <main className="flex-1 px-2 sm:px-6 pb-2 sm:pb-6 overflow-y-auto">
          <div className="h-full">
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === 'sms' && (
                <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-1 rounded-full mb-6">
                    <div className="bg-[#1a1433] p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 3v.01M16 3v.01M12 12h.01M12 21c3.5-2.5 6-4.5 6-7.5 0-3.5-3-4-6-4s-6 .5-6 4c0 3 2.5 5 6 7.5z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">SMS Reviews Coming Soon</h2>
                  <p className="text-gray-300 max-w-md mx-auto">
                    We're working on an amazing SMS review collection feature that will help you gather more customer feedback effortlessly.
                  </p>
                </div>
              )}
              {activeTab === 'email' && (
                <div className="h-full">
                  <EmailComponent />
                </div>
              )}
            </Suspense>
            {activeTab === 'qrcode' && <QRCodeComponent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GetReviews;
