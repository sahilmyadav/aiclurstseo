import React, { useState } from "react";
import QRCodeComponent from "./QRCodeComponent";

const InboxMessage = () => {
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
            {activeTab === 'sms' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-[#1a1433] rounded-lg">
                  <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                </div>
              </div>
            )}
            {activeTab === 'email' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-[#1a1433] rounded-lg">
                  <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                </div>
              </div>
            )}
            {activeTab === 'qrcode' && <QRCodeComponent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InboxMessage;
