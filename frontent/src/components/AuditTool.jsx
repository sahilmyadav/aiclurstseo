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
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="p-4 sm:p-6 space-y-6">

        {/* ================= Business Selection ================= */}
        <div
          className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-[#1a1b2e] border-white/10'
              : 'bg-white'
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

          <p className="text-xs text-gray-500 mt-1">
            {businesses?.length || 0} profiles available
          </p>

          {selectedBusiness && (
            <div
              className={`mt-4 p-3 rounded-md border ${
                theme === 'dark'
                  ? 'bg-[#242538] border-white/10'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {selectedBusiness.title ||
                    selectedBusiness.locationName ||
                    'Business Profile'}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* ================= Tabs ================= */}
          {selectedBusiness && (
            <div
              className={`flex gap-2 mt-4 p-1 rounded-lg w-fit ${
                theme === 'dark' ? 'bg-[#242538]' : 'bg-gray-100'
              }`}
            >
              {['overview', 'performance', 'insights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition
                    ${
                      activeTab === tab
                        ? 'bg-purple-600 text-white'
                        : theme === 'dark'
                        ? 'text-white/60 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg"
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
                    { label: 'Performance', value: performanceData?.scores?.performance, icon: BarChart, color: 'blue' },
                    { label: 'Engagement', value: performanceData?.scores?.engagement, icon: Activity, color: 'green' },
                    { label: 'Profile', value: performanceData?.scores?.profile, icon: Star, color: 'yellow' },
                    { label: 'SEO', value: performanceData?.scores?.seo, icon: Globe, color: 'purple' }
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className={`p-4 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-[#1a1b2e] border-white/10'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 text-${color}-500`} />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <div className="text-3xl font-bold mt-2">
                            {value || 0}%
                          </div>
                        </div>
                        <div
                          className={`h-14 w-14 rounded-full border-4 border-${color}-500 flex items-center justify-center font-bold`}
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
                      className={`p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-[#1a1b2e] border-white/10'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <div className="text-xl font-bold">
                        {value || 0}
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
