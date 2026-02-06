import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';
import PerformanceGraph from './PerformanceGraph';
import AuditInsights from './AuditInsights';

import {
  Brain,
  Target,
  BarChart,
  Activity,
  Star,
  Globe,
  Eye,
  MousePointer,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';

const AuditTool = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const {
    selectedBusiness,
    isConnected,
    selectBusiness,
    selectMultipleBusinesses,
    performanceData,
    businesses
  } = useGoogleBusiness();

  const [activeTab, setActiveTab] = useState('overview');

  const handleBusinessSelect = (businessOrBusinesses) => {
    if (Array.isArray(businessOrBusinesses)) {
      selectMultipleBusinesses(businessOrBusinesses);
    } else {
      selectBusiness(businessOrBusinesses);
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
          : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] text-gray-900'
      }`}
    >
      <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">

        {/* ================= Business Selection ================= */}
        <div
          className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] ${
            theme === 'dark'
              ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 backdrop-blur-sm text-white shadow-lg'
              : 'bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200'
          }`}
        >
          <h2 className="text-lg font-semibold mb-3">
            Select Business Profile to Audit
          </h2>

          <BusinessProfileDropdown
            onSelect={handleBusinessSelect}
            showLabel={false}
            multiple={false}
            className="w-full"
          />

          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {businesses?.length || 0} profiles available
          </p>

          {selectedBusiness && (
          <div
  className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] ${
    theme === 'dark'
      ? 'bg-gray-800/80 border border-gray-700 hover:border-gray-600 shadow-lg'
      : 'bg-green-50/60 backdrop-blur-sm shadow-sm hover:shadow-md border border-green-100 hover:border-green-200'
  }`}
>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedBusiness.title ||
                    selectedBusiness.locationName ||
                    'Business Profile'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === 'dark'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-green-100 text-green-800'
                }`}>
                  Active
                </span>
              </div>
            </div>
          )}

          {/* ================= Tabs ================= */}
          {selectedBusiness && (
            <div
              className={`flex gap-2 mt-4 p-1 rounded-xl w-fit transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/70 border border-white/10'
                  : 'bg-white/80 border border-gray-100 shadow-sm'
              }`}
            >
              {['overview', 'performance', 'insights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300
                    ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : theme === 'dark'
                        ? 'text-white/60 hover:text-white hover:bg-gray-700/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= Connection States ================= */}
        {!isConnected ? (
          <div className="text-center py-24">
            <Brain className="w-14 h-14 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Connect Your Business
            </h3>
            <button
              onClick={() => navigate('/dashboard/integrations')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
            >
              Go to Integrations
            </button>
          </div>
        ) : !selectedBusiness ? (
          <div className="text-center py-24">
            <Target className="w-14 h-14 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold">
              Select a Business Profile
            </h3>
          </div>
        ) : (
          <>
            {/* ================= OVERVIEW (STATS ONLY) ================= */}
            {activeTab === 'overview' && (
              <>
                {/* Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Performance', value: performanceData?.scores?.performance, icon: BarChart, color: 'purple' },
                    { label: 'Engagement', value: performanceData?.scores?.engagement, icon: Activity, color: 'green' },
                    { label: 'Overall', value: performanceData?.scores?.overall, icon: Star, color: 'yellow' },
                    { label: 'SEO', value: performanceData?.scores?.seo, icon: Globe, color: 'blue' }
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className={`p-6 rounded-2xl flex flex-col justify-between h-48 transition-all duration-300 transform hover:scale-[1.02] ${
                        theme === 'dark'
                          ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 backdrop-blur-sm shadow-lg'
                          : `bg-${color}-50 shadow-sm border border-${color}-100 hover:border-${color}-200 hover:shadow-md`
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${color}-200/70`}>
                              <Icon className={`w-5 h-5 text-${color}-700`} />
                            </div>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {label}
                            </span>
                          </div>
                          <div className={`text-3xl font-bold mt-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {value || 0}%
                          </div>
                        </div>
                        <div
                          className={`h-14 w-14 rounded-full border-4 border-${color}-200 ${theme === 'dark' ? 'bg-gray-700/80' : 'bg-white/80'} flex items-center justify-center font-bold ${
                            theme === 'dark' ? 'text-white' : `text-${color}-700`
                          }`}
                        >
                          {value || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  {[
                    { label: 'Views', value: performanceData?.totals?.views, icon: Eye },
                    { label: 'Impressions', value: performanceData?.totals?.impressions, icon: MousePointer },
                    { label: 'Calls', value: performanceData?.totals?.calls, icon: Phone },
                    { label: 'Directions', value: performanceData?.totals?.directionRequests, icon: MapPin },
                    { label: 'Website Clicks', value: performanceData?.totals?.websiteClicks, icon: MousePointer },
                    { label: 'Conversations', value: performanceData?.totals?.conversations, icon: MessageSquare }
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        theme === 'dark'
                          ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 backdrop-blur-sm shadow-lg'
                          : 'bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-purple-500" />
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {label}
                        </span>
                      </div>
                      <div className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {value || 0}
                      </div>
                      <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last 30 days
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ================= PERFORMANCE (GRAPH ONLY) ================= */}
            {activeTab === 'performance' && (
              <PerformanceGraph
                data={performanceData?.daily || []}
                theme={theme}
              />
            )}

            {/* ================= INSIGHTS ================= */}
            {activeTab === 'insights' && (
              <AuditInsights
                performanceData={performanceData}
                theme={theme}
                selectedBusiness={selectedBusiness}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditTool;
