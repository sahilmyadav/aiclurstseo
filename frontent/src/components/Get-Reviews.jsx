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
                <div className="h-full">
                  <SMSComponent />
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
