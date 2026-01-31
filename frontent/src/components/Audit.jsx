import { BarChart3, Brain, TrendingUp, Star, Target, Sparkles, AlertCircle, RefreshCw, Calendar, Phone, Globe } from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

import { toast } from 'sonner';

import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import BusinessProfileDropdown from './common/BusinessProfileDropdown';
import { useTheme } from '../context/ThemeContext';

const Audit = () => {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    new Date() // today
  ]);
  const [tempDateRange, setTempDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    new Date() // today
  ]);
  const [aiInsights, setAIInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const navigate = useNavigate();

  const {
    businesses,
    selectedBusiness,
    selectedBusinesses,
    reviews,
    loading,
    isConnected,
    selectBusiness,
    selectMultipleBusinesses,
    reviewStats,
    performanceData,
    performanceLoading,
    fetchPerformanceMetrics
  } = useGoogleBusiness();

  const timerRef = useRef(null);
  // Handle date range change for temp state
  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setTempDateRange(dates);
    }
  };

  // Apply date range and fetch new performance data
  const applyDateRange = () => {
    setDateRange(tempDateRange);
    fetchPerformanceMetrics({
      startDate: tempDateRange[0],
      endDate: tempDateRange[1]
    });
  };

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTimer > 0) {
      timerRef.current = setTimeout(() => {
        setCooldownTimer(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [cooldownTimer]);

  // Cleanup timer on unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

 
  const handleBusinessSelect = (businessOrBusinesses) => {
    if (Array.isArray(businessOrBusinesses)) {
      // Multiple selections
      selectMultipleBusinesses(businessOrBusinesses);
    } else {
      // Single selection
      selectBusiness(businessOrBusinesses);
    }
  };

 

  const handleGenerateInsights = useCallback(async () => {
    // Prevent multiple simultaneous calls or during cooldown
    if (insightsLoading || cooldownTimer > 0) return;

    // Validation
    if (!selectedBusiness) {
      toast.error('Please select a business first');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your Google Business account first');
      navigate('/dashboard/integrations');
      return;
    }

    if (!reviews?.length) {
      toast.error('No reviews available for analysis');
      return;
    }

    setInsightsLoading(true);
    setInsightsError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/audit`,
        {
          businessId: selectedBusiness.name || selectedBusiness.id,
          businessName: selectedBusiness.title || selectedBusiness.name,
          reviews: reviews
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data) {
        console.log("response", response.data)
        setAIInsights(response.data.audit);
        toast.success(`✨ AI insights generated!`,);
        // Start 30-second cooldown timer
        setCooldownTimer(2);
      } else {
        throw new Error('No data received from the server');
      }
    } catch (error) {
      console.error('Insights generation error:', error);
      const errorMessage = error.message || 'Failed to generate AI insights';
      // setInsightsError(errorMessage);
      // toast.error(errorMessage);
    } finally {
      setInsightsLoading(false);
    }
  }, [selectedBusiness, isConnected, reviews, insightsLoading, cooldownTimer, navigate]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ], []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%),white]'
    }`}>
      <div className="p-3 sm:p-6">
        <div className="min-h-screen overflow-hidden">
          {/* Header */}
         <div className="space-y-4">
  {/* Business Profile Audit Section */}
  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
    <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      Select Business Profile to Audit
    </h2>
    
    <div className="space-y-4">
      {/* Business Selection */}
      <div>
        <div className="relative">
          <BusinessProfileDropdown
            onSelect={handleBusinessSelect}
            showLabel={false}
            multiple={false}
            className="w-full"
          />
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
          1 of 1 profiles available
        </p>
      </div>

      {/* Selected Profile Status */}
      {selectedBusiness && (
        <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-[#242538]' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>Selected Profile</h3>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="font-medium text-sm">{selectedBusiness.title || selectedBusiness.locationName || 'Business Profile'}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
              Active
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-180px)] overflow-y-auto">
              {!isConnected ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Brain className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Connect Your Business</h3>
                    <p className={`max-w-md ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                      Connect your Google Business Profile to access performance insights and AI-powered audit features.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/integrations')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-medium transition-all duration-200"
                    >
                      Go to Integrations
                    </button>
                  </div>
                </div>
              ) : !selectedBusiness ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Target className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Select a Business Profile</h3>
                    <p className={`max-w-md ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                      Choose which business profile you want to analyze from the dropdown above.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`border-b mb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex overflow-x-auto scrollbar-hide">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                            ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5'
                            : theme === 'dark' ? 'text-white/60 hover:text-white/80' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 pb-4" style={{ scrollbarWidth: 'thin' }}>
                    {activeTab === 'overview' && (
                      <div className="space-y-6 pb-8">
                        {/* Date Range Picker for Overview */}
                        {/* <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                          ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                          : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance Metrics Filter</h3>
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
                              <div className="custom-datepicker">
                                <DatePicker
                                  selectsRange={true}
                                  startDate={tempDateRange[0]}
                                  endDate={tempDateRange[1]}
                                  onChange={handleDateRangeChange}
                                  maxDate={new Date()}
                                  className={`rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === 'dark' 
                                    ? 'bg-[#242538] border border-[#3a3b5a] text-white' 
                                    : 'bg-white border border-gray-300 text-gray-900'}`}
                                />
                              </div>
                              <button
                                onClick={applyDateRange}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-all"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div> */}

                        {loading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Loading business data...</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Average Rating</span>
                                  <Star className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div className="text-3xl font-bold text-yellow-400">
                                  {performanceData?.averageRating ? performanceData.averageRating.toFixed(1) : '0.0'}
                                </div>
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>out of 5.0</div>
                              </div>

                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Total Reviews</span>
                                  <BarChart3 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="text-3xl font-bold text-blue-400">
                                  {performanceData?.totalReviews || 0}
                                </div>
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>all time</div>
                              </div>

                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Recent Reviews</span>
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="text-3xl font-bold text-green-400">
                                  {performanceData?.recentReviewsCount || 0}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <span className={`ml-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>last 30 days</span>
                                </div>
                              </div>

                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Rating Trend</span>
                                  <Sparkles className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="text-3xl font-bold text-purple-400">
                                  {performanceData?.averageRating ? performanceData.averageRating.toFixed(1) : '0.0'}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                  <span className={`ml-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>last 30 days</span>
                                </div>
                              </div>
                            </div>

                            {/* Performance Metrics in Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Impressions Card */}
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Total Impressions</span>
                                  <BarChart3 className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="text-2xl font-bold text-purple-400">
                                  {performanceLoading ? '...' : performanceData?.impressions || 0}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                  <div className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                    <div>Search</div>
                                    <div className="font-medium">
                                      {performanceLoading ? '...' : (performanceData?.desktopSearchImpressions || 0) + (performanceData?.mobileSearchImpressions || 0)}
                                    </div>
                                  </div>
                                  <div className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                    <div>Maps</div>
                                    <div className="font-medium">
                                      {performanceLoading ? '...' : (performanceData?.desktopMapsImpressions || 0) + (performanceData?.mobileMapsImpressions || 0)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Engagement Card */}
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Engagement</span>
                                  <TrendingUp className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xl font-bold text-blue-400">
                                      {performanceLoading ? '...' : performanceData?.views || 0}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Profile Views</div>
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-green-400">
                                      {performanceLoading ? '...' : performanceData?.directionRequests || 0}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Directions</div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions Card */}
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Actions</span>
                                  <Phone className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xl font-bold text-green-400">
                                      {performanceLoading ? '...' : performanceData?.calls || 0}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Calls</div>
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-blue-400">
                                      {performanceLoading ? '...' : performanceData?.websiteClicks || 0}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Website Clicks</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">

                            </div>

                            <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                              ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                              : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  <div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-green-800'}`}>Selected Profile</div>
                                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedBusiness.title}</div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-green-700'}`}>{selectedBusiness.primaryCategory?.displayName}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-400">{performanceData?.totalReviews || 0}</div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-green-700'}`}>Total Reviews</div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === 'performance' && (
                      <div className="space-y-6 pb-8">
                        {reviews && reviews.length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-white/5 hover:bg-[#121324]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Recent Reviews</div>
                                <div className="text-2xl font-bold text-green-400">{performanceData?.recentReviewsCount || 0}</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>Last 30 days</div>
                              </div>
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-white/5 hover:bg-[#121324]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Avg Rating</div>
                                <div className="text-2xl font-bold text-yellow-400">{performanceData?.averageRating ? performanceData.averageRating.toFixed(1) : '0.0'}</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>Last 30 days</div>
                              </div>
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-white/5 hover:bg-[#121324]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Total Reviews</div>
                                <div className="text-2xl font-bold text-blue-400">{performanceData?.totalReviews || 0}</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>All time</div>
                              </div>
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-white/5 hover:bg-[#121324]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>Response Rate</div>
                                <div className="text-2xl font-bold text-purple-400">
                                  {reviews?.length > 0 ? ((reviews.filter(r => r.reviewReply).length / reviews.length) * 100).toFixed(0) : '0'}%
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>Replied reviews</div>
                              </div>
                            </div>

                            <div className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                              ? 'bg-[#121324]/90 border border-white/5 hover:bg-[#121324]' 
                              : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Rating Quality Analysis</h3>
                              <div className="space-y-3">
                                {performanceData?.ratingDistribution ? Object.entries(performanceData.ratingDistribution).sort((a, b) => b[0] - a[0]).map(([rating, count]) => (
                                  <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center w-20">
                                      {[...Array(parseInt(rating))].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                      ))}
                                    </div>
                                    <div className={`flex-1 h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                                      <div
                                        className={`h-full rounded-full ${rating >= 4 ? 'bg-green-500' :
                                          rating == 3 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                        style={{ width: `${performanceData.totalReviews > 0 ? (count / performanceData.totalReviews) * 100 : 0}%` }}
                                      />
                                    </div>
                                    <span className={`w-16 text-sm text-right ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>{count} ({performanceData.totalReviews > 0 ? ((count / performanceData.totalReviews) * 100).toFixed(0) : 0}%)</span>
                                  </div>
                                )) : (
                                  <div className={`text-center py-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                    {loading ? 'Loading rating data...' : 'No rating data available'}
                                  </div>
                                )}
                              </div>
                              <h3 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance Summary</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Total Reviews</span>
                                  <span className="font-semibold">{performanceData?.totalReviews || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Average Rating</span>
                                  <span className="font-semibold">{performanceData?.averageRating ? performanceData.averageRating.toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Recent Activity (30d)</span>
                                  <span className="font-semibold">{performanceData?.recentReviewsCount || 0} reviews</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Response Rate</span>
                                  <span className="font-semibold">
                                    {((reviews.filter(r => r.reviewReply).length / reviews.length) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-4">
                              <BarChart3 className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Performance Data</h3>
                              <p className={`max-w-md ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                No reviews available yet. Performance metrics will appear once you receive customer reviews.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'insights' && (
                      <div className="space-y-6 pb-8">
                        {!aiInsights ? (
                          <div className="text-center py-8">
                            <Brain className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Get AI-Powered Insights</h3>
                            <p className={`max-w-2xl mx-auto mb-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                              Generate comprehensive AI analysis of your reviews including strengths, weaknesses, and actionable recommendations.
                            </p>

                            {insightsError && (
                              <div className={`mb-4 p-4 rounded-lg text-sm transition-all duration-300 ${theme === 'dark' 
                                ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                                : 'bg-red-50 border border-red-200 text-red-600 hover:shadow-sm'}`}>
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                {insightsError}
                              </div>
                            )}

                            <button
                              onClick={handleGenerateInsights}
                              disabled={insightsLoading || !reviews?.length || cooldownTimer > 0}
                              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                            >
                              {insightsLoading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              ) : cooldownTimer > 0 ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              ) : (
                                <Sparkles className="w-5 h-5" />
                              )}
                              <span>
                                {insightsLoading
                                  ? 'Generating Insights...'
                                  : cooldownTimer > 0
                                    ? `Wait ${cooldownTimer}s`
                                    : 'Generate AI Insights'
                                }
                              </span>
                            </button>

                            {!reviews?.length && (
                              <p className="text-red-400 text-sm mt-4">Need at least 1 review to generate insights</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Header with regenerate button */}
                            <div className={`rounded-lg p-6 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                              ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                              : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  <Brain className="w-6 h-6 text-purple-400" />
                                  AI-Powered Business Insights
                                </h3>
                                <button
                                  onClick={handleGenerateInsights}
                                  disabled={insightsLoading || cooldownTimer > 0}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-white"
                                >
                                  {insightsLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : cooldownTimer > 0 ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                  {insightsLoading
                                    ? 'Regenerating...'
                                    : cooldownTimer > 0
                                      ? `Wait ${cooldownTimer}s`
                                      : 'Regenerate'
                                  }
                                </button>
                              </div>
                              {aiInsights.analyzedAt && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                                  Generated on {new Date(aiInsights.analyzedAt).toLocaleString()}
                                </p>
                              )}
                            </div>

                            {/* Overall Score */}
                            {aiInsights.overallScore !== undefined && (
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <h4 className={`text-lg font-semibold mb-3 text-blue-400`}>📊 Overall Score</h4>
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl font-bold text-blue-400">{aiInsights.overallScore}/100</div>
                                  <div className={`flex-1 h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                                      style={{ width: `${aiInsights.overallScore}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {aiInsights.summary && (
                              <div className={`rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' 
                                ? 'bg-[#1a1b2e]/90 border border-white/10 hover:bg-[#1a1b2e]' 
                                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-[radial-gradient(at_40%_20%,hsl(250,91%,99%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,99%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,99%)_0px,transparent_50%),white]'}`}>
                                <h4 className={`text-lg font-semibold mb-3 text-indigo-400`}>📝 Summary</h4>
                                <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'}`}>{aiInsights.summary}</p>
                              </div>
                            )}

                            {/* Sentiment Analysis */}
                            {aiInsights.sentimentAnalysis && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-purple-500/20' 
                                : 'bg-white border border-purple-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-purple-400`}>💭 Sentiment Analysis</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className={`p-4 rounded-lg ${theme === 'dark' 
                                    ? 'bg-green-500/10 border border-green-500/30' 
                                    : 'bg-green-50 border border-green-200'}`}>
                                    <div className="text-2xl font-bold text-green-400">{aiInsights.sentimentAnalysis.positive}</div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-green-800'}`}>Positive</div>
                                  </div>
                                  <div className={`p-4 rounded-lg ${theme === 'dark' 
                                    ? 'bg-yellow-500/10 border border-yellow-500/30' 
                                    : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <div className="text-2xl font-bold text-yellow-400">{aiInsights.sentimentAnalysis.neutral}</div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-yellow-800'}`}>Neutral</div>
                                  </div>
                                  <div className={`p-4 rounded-lg ${theme === 'dark' 
                                    ? 'bg-red-500/10 border border-red-500/30' 
                                    : 'bg-red-50 border border-red-200'}`}>
                                    <div className="text-2xl font-bold text-red-400">{aiInsights.sentimentAnalysis.negative}</div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-red-800'}`}>Negative</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Key Topics */}
                            {aiInsights.keyTopics?.length > 0 && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-blue-500/20' 
                                : 'bg-white border border-blue-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-blue-400`}>🏷️ Key Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                  {aiInsights.keyTopics.map((topic, index) => (
                                    <span key={index} className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' 
                                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' 
                                      : 'bg-blue-100 border border-blue-200 text-blue-800'}`}>
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Strengths */}
                            {aiInsights.strengths?.length > 0 && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-green-500/20' 
                                : 'bg-white border border-green-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-green-400`}>✅ Key Strengths</h4>
                                <ul className="space-y-3">
                                  {aiInsights.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-green-400 mt-1">•</span>
                                      <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-800'}>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Weaknesses */}
                            {aiInsights.weaknesses?.length > 0 && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-red-500/20' 
                                : 'bg-white border border-red-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-red-400`}>⚠️ Areas for Improvement</h4>
                                <ul className="space-y-3">
                                  {aiInsights.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-red-400 mt-1">•</span>
                                      <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-800'}>{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Priority Actions */}
                            {aiInsights.priorityActions?.length > 0 && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-orange-500/20' 
                                : 'bg-white border border-orange-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-orange-400`}>🎯 Priority Actions</h4>
                                <ul className="space-y-3">
                                  {aiInsights.priorityActions.map((action, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-orange-400 mt-1 font-bold">{index + 1}.</span>
                                      <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-800'}>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Recommendations */}
                            {aiInsights.recommendations?.length > 0 && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-[#121324]/90 border border-yellow-500/20' 
                                : 'bg-white border border-yellow-200 shadow-sm'}`}>
                                <h4 className={`text-lg font-semibold mb-4 text-yellow-400`}>💡 Recommendations</h4>
                                <ul className="space-y-3">
                                  {aiInsights.recommendations.map((recommendation, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-yellow-400 mt-1">💡</span>
                                      <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-800'}>{recommendation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Trend Analysis */}
                            {aiInsights.trendAnalysis && (
                              <div className={`rounded-lg p-6 ${theme === 'dark' 
                                ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30' 
                                : 'bg-indigo-50 border border-indigo-200'}`}>
                                <h4 className={`text-lg font-semibold mb-3 text-indigo-400`}>📈 Trend Analysis</h4>
                                <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'}`}>{aiInsights.trendAnalysis}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;