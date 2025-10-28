import { BarChart3, Brain, ChevronDown, TrendingUp, Star, Target, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toast } from 'sonner';

import { useSidebar } from "./context/SidebarContext";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import fetchWithAuth from '../utils/fetchWithAuth';

const Audit = () => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAIInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const navigate = useNavigate();
  
  const {
    businesses,
    selectedBusiness,
    reviews,
    loading,
    isConnected,
    selectBusiness,
    reviewStats
  } = useGoogleBusiness();
  
  const { isCollapsed } = useSidebar();

  const timerRef = useRef(null);

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleBusinessSelect = useCallback(async (business) => {
    try {
      await selectBusiness(business);
      setShowBusinessDropdown(false);
      // Reset insights when business changes
      setAIInsights(null);
      setInsightsError(null);
      setCooldownTimer(0); // Reset cooldown when business changes
    } catch (error) {
      toast.error('Failed to select business');
    }
  }, [selectBusiness]);

  const monthlyData = useMemo(() => {
    if (!reviews?.length) return [];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0).map((_, i) => ({ 
      month: monthNames[i], 
      reviews: 0 
    }));

    reviews.forEach(review => {
      if (review.createTime) {
        const reviewDate = new Date(review.createTime);
        if (reviewDate.getFullYear() === currentYear) {
          const month = reviewDate.getMonth();
          monthlyCounts[month].reviews++;
        }
      }
    });
    
    return monthlyCounts;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    if (!reviewStats?.ratings) return [];
    
    return reviewStats.ratings.map(item => ({
      name: `${item.rating} Stars`,
      value: item.count,
      rating: item.rating
    }));
  }, [reviewStats]);

  const reviewTrend = useMemo(() => {
    if (!reviews?.length) return { current: 0, previous: 0, change: 0 };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const currentPeriod = reviews.filter(r => 
      new Date(r.createTime) > thirtyDaysAgo
    ).length;
    
    const previousPeriod = reviews.filter(r => {
      const date = new Date(r.createTime);
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    }).length;
    
    const change = previousPeriod > 0 
      ? ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1)
      : currentPeriod > 0 ? 100 : 0;
    
    return { current: currentPeriod, previous: previousPeriod, change: parseFloat(change) };
  }, [reviews]);

  const ratingTrend = useMemo(() => {
    if (!reviews?.length) return { current: 0, previous: 0, change: 0 };
    
    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const currentReviews = reviews.filter(r => new Date(r.createTime) > thirtyDaysAgo);
    const previousReviews = reviews.filter(r => {
      const date = new Date(r.createTime);
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    });
    
    const currentAvg = currentReviews.length > 0
      ? currentReviews.reduce((sum, r) => sum + (ratingMap[r.starRating] || 0), 0) / currentReviews.length
      : 0;
    
    const previousAvg = previousReviews.length > 0
      ? previousReviews.reduce((sum, r) => sum + (ratingMap[r.starRating] || 0), 0) / previousReviews.length
      : 0;
    
    const change = previousAvg > 0 
      ? ((currentAvg - previousAvg) / previousAvg * 100).toFixed(1)
      : currentAvg > 0 ? 100 : 0;
    
    return { current: currentAvg.toFixed(1), previous: previousAvg.toFixed(1), change: parseFloat(change) };
  }, [reviews]);

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
      navigate('/integrations');
      return;
    }

    if (!reviews?.length) {
      toast.error('No reviews available for analysis');
      return;
    }

    setInsightsLoading(true);
    setInsightsError(null);

    try {
      const response = await fetchWithAuth('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.name || selectedBusiness.id,
          businessName: selectedBusiness.title || selectedBusiness.name,
          reviews: reviews
        })
      });

      if (response.success && response.audit) {
        setAIInsights(response.audit);
        toast.success(`✨ AI insights generated! Analyzed ${response.reviewCount || reviews.length} reviews`);
        // Start 30-second cooldown timer
        setCooldownTimer(30);
      } else {
        throw new Error(response.error || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Insights generation error:', error);
      const errorMessage = error.message || 'Failed to generate AI insights';
      setInsightsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setInsightsLoading(false);
    }
  }, [selectedBusiness, isConnected, reviews, insightsLoading, cooldownTimer, navigate]);


  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ], []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="min-h-screen w-full text-white">
      <div className="p-3 sm:p-6">
        <div className="min-h-screen overflow-hidden">
          {/* Header */}
          <div className="pb-4 space-y-4">
            {/* Title and Description */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">Business Profile Audit</h1>
              <p className="text-sm text-white/60 mt-1">Real-time performance insights and review analytics</p>
            </div>

            {/* Selected Business Info - Mobile Optimized */}
            {selectedBusiness && (
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-white/70 text-center sm:text-left">
                    <span className="text-white/50">Analyzing:</span> 
                    <span className="font-semibold block sm:inline mt-1 sm:mt-0 sm:ml-1">{selectedBusiness.title}</span>
                  </span>
                </div>
              </div>
            )}
            
            {/* Business Selection Only */}
            {businesses && businesses.length > 0 && (
              <div className="flex justify-center sm:justify-start">
                <div className="relative w-full sm:w-auto max-w-sm">
                  <button
                    onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-[#1a1b2e]/90 border border-white/10 rounded-lg text-white hover:bg-[#1a1b2e] transition-colors"
                  >
                    <span className="text-sm truncate mr-2">{selectedBusiness ? selectedBusiness.title : 'Select Business'}</span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </button>
                
                  {showBusinessDropdown && (
                    <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-64 bg-[#1a1b2e] border border-white/10 rounded-lg shadow-lg z-50">
                      <div className="p-2 border-b border-white/10">
                        <p className="text-xs text-white/60">1 of {businesses.length} profiles available</p>
                      </div>
                      {businesses.map((business, index) => (
                        <button
                          key={index}
                          onClick={() => handleBusinessSelect(business)}
                          className={`w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors ${
                            selectedBusiness?.name === business.name ? 'bg-green-400/10' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium flex items-center">
                                {selectedBusiness?.name === business.name && <div className="w-2 h-2 rounded-full bg-green-400 mr-2 flex-shrink-0"></div>}
                                <span className="truncate">{business.title}</span>
                              </div>
                              <div className="text-xs text-white/60 mt-1 truncate">{business.primaryCategory?.displayName || 'Business'}</div>
                            </div>
                            {selectedBusiness?.name === business.name && (
                              <span className="text-xs text-green-400 px-2 py-1 bg-green-400/20 rounded ml-2 flex-shrink-0">Active</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-180px)] overflow-y-auto">
            {!isConnected ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Brain className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                  <h3 className="text-xl font-semibold">Connect Your Business</h3>
                  <p className="text-white/60 max-w-md">
                    Connect your Google Business Profile to access performance insights and AI-powered audit features.
                  </p>
                  <button
                    onClick={() => navigate('/integrations')}
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
                  <h3 className="text-xl font-semibold">Select a Business Profile</h3>
                  <p className="text-white/60 max-w-md">
                    Choose which business profile you want to analyze from the dropdown above.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-white/10 mb-6">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab.id
                            ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-4" style={{scrollbarWidth: 'thin'}}>
                  {activeTab === 'overview' && (
                    <div className="space-y-6 pb-8">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-white/60">Loading business data...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-lg bg-[#1a1b2e]/90 border border-white/10 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">Average Rating</span>
                                <Star className="w-4 h-4 text-yellow-400" />
                              </div>
                              <div className="text-3xl font-bold text-yellow-400">
                                {reviewStats?.average ? reviewStats.average.toFixed(1) : '0.0'}
                              </div>
                              <div className="text-xs text-white/60 mt-1">out of 5.0</div>
                            </div>

                            <div className="rounded-lg bg-[#1a1b2e]/90 border border-white/10 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">Total Reviews</span>
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="text-3xl font-bold text-blue-400">
                                {reviewStats?.total || 0}
                              </div>
                              <div className="text-xs text-white/60 mt-1">all time</div>
                            </div>

                            <div className="rounded-lg bg-[#1a1b2e]/90 border border-white/10 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">Recent Reviews</span>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              </div>
                              <div className="text-3xl font-bold text-green-400">
                                {reviewTrend.current}
                              </div>
                              <div className="flex items-center text-xs mt-1">
                                {reviewTrend.change >= 0 ? (
                                  <span className="text-green-400">+{reviewTrend.change}%</span>
                                ) : (
                                  <span className="text-red-400">{reviewTrend.change}%</span>
                                )}
                                <span className="text-white/60 ml-1">vs last 30 days</span>
                              </div>
                            </div>

                            <div className="rounded-lg bg-[#1a1b2e]/90 border border-white/10 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">Rating Trend</span>
                                <Sparkles className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="text-3xl font-bold text-purple-400">
                                {ratingTrend.current}
                              </div>
                              <div className="flex items-center text-xs mt-1">
                                {ratingTrend.change >= 0 ? (
                                  <span className="text-green-400">+{ratingTrend.change}%</span>
                                ) : (
                                  <span className="text-red-400">{ratingTrend.change}%</span>
                                )}
                                <span className="text-white/60 ml-1">vs last 30 days</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-[#121324]/90 border border-white/5 p-6">
                              <h3 className="text-sm font-semibold mb-4">Monthly Review Trend ({new Date().getFullYear()})</h3>
                              {monthlyData.length > 0 && monthlyData.some(d => d.reviews > 0) ? (
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3b3b5a" />
                                    <XAxis dataKey="month" stroke="#b9b9d2" fontSize={12} />
                                    <YAxis stroke="#b9b9d2" fontSize={12} />
                                    <Tooltip 
                                      contentStyle={{ 
                                        background: "#1b1c2f", 
                                        border: "1px solid #2a2b45", 
                                        borderRadius: 8, 
                                        color: "#fff" 
                                      }} 
                                    />
                                    <Bar dataKey="reviews" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[200px] flex items-center justify-center text-white/40 text-sm">
                                  <div className="text-center">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p>No reviews for {new Date().getFullYear()}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="rounded-2xl bg-[#121324]/90 border border-white/5 p-6">
                              <h3 className="text-sm font-semibold mb-4">Rating Distribution</h3>
                              {ratingDistribution.length > 0 && ratingDistribution.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={ratingDistribution}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {ratingDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ 
                                        background: "#1b1c2f", 
                                        border: "1px solid #2a2b45", 
                                        borderRadius: 8, 
                                        color: "#fff" 
                                      }} 
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[200px] flex items-center justify-center text-white/40 text-sm">
                                  <div className="text-center">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p>No rating data available</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <div>
                                  <div className="text-sm text-white/60">Selected Profile</div>
                                  <div className="font-semibold">{selectedBusiness.title}</div>
                                  <div className="text-xs text-white/60">{selectedBusiness.primaryCategory?.displayName}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">{reviewStats?.total || 0}</div>
                                <div className="text-xs text-white/60">Total Reviews</div>
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
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-4">
                              <div className="text-sm text-white/60 mb-2">Current Period</div>
                              <div className="text-2xl font-bold text-green-400">{reviewTrend.current}</div>
                              <div className="text-xs text-white/50">Last 30 days</div>
                            </div>
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-4">
                              <div className="text-sm text-white/60 mb-2">Previous Period</div>
                              <div className="text-2xl font-bold text-blue-400">{reviewTrend.previous}</div>
                              <div className="text-xs text-white/50">30-60 days ago</div>
                            </div>
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-4">
                              <div className="text-sm text-white/60 mb-2">Change</div>
                              <div className={`text-2xl font-bold ${reviewTrend.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {reviewTrend.change >= 0 ? '+' : ''}{reviewTrend.change}%
                              </div>
                              <div className="text-xs text-white/50">Growth rate</div>
                            </div>
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-4">
                              <div className="text-sm text-white/60 mb-2">Avg Rating</div>
                              <div className="text-2xl font-bold text-yellow-400">{ratingTrend.current}</div>
                              <div className="text-xs text-white/50">Last 30 days</div>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-[#121324]/90 border border-white/5 p-6">
                            <h3 className="text-lg font-semibold mb-4">Rating Quality Analysis</h3>
                            <div className="space-y-3">
                              {reviewStats.ratings.sort((a, b) => b.rating - a.rating).map((item) => (
                                <div key={item.rating} className="flex items-center gap-3">
                                  <div className="flex items-center w-20">
                                    {[...Array(item.rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                  <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        item.rating >= 4 ? 'bg-green-500' : 
                                        item.rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${reviewStats.total > 0 ? (item.count / reviewStats.total) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="w-16 text-sm text-white/70 text-right">{item.count} ({reviewStats.total > 0 ? ((item.count / reviewStats.total) * 100).toFixed(0) : 0}%)</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-6">
                            <h3 className="text-sm font-semibold mb-4">Performance Summary</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Total Reviews</span>
                                <span className="font-semibold">{reviewStats.total}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Average Rating</span>
                                <span className="font-semibold">{reviewStats.average.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Recent Activity (30d)</span>
                                <span className="font-semibold">{reviewStats.recentCount} reviews</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Response Rate</span>
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
                            <h3 className="text-xl font-semibold">No Performance Data</h3>
                            <p className="text-white/60 max-w-md">
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
                          <h3 className="text-xl font-semibold mb-2">Get AI-Powered Insights</h3>
                          <p className="text-white/60 max-w-2xl mx-auto mb-6">
                            Generate comprehensive AI analysis of your reviews including strengths, weaknesses, and actionable recommendations.
                          </p>
                          
                          {insightsError && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
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
                          <div className="rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold flex items-center gap-2">
                                <Brain className="w-6 h-6 text-purple-400" />
                                AI-Powered Business Insights
                              </h3>
                              <button
                                onClick={handleGenerateInsights}
                                disabled={insightsLoading || cooldownTimer > 0}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
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
                              <p className="text-sm text-white/60">
                                Generated on {new Date(aiInsights.analyzedAt).toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Overall Score */}
                          {aiInsights.overallScore !== undefined && (
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-6">
                              <h4 className="text-lg font-semibold mb-3 text-blue-400">📊 Overall Score</h4>
                              <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-blue-400">{aiInsights.overallScore}/100</div>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
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
                            <div className="rounded-lg bg-[#121324]/90 border border-white/5 p-6">
                              <h4 className="text-lg font-semibold mb-3 text-indigo-400">📝 Summary</h4>
                              <p className="text-white/80 leading-relaxed">{aiInsights.summary}</p>
                            </div>
                          )}

                          {/* Sentiment Analysis */}
                          {aiInsights.sentimentAnalysis && (
                            <div className="rounded-lg bg-[#121324]/90 border border-purple-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-purple-400">💭 Sentiment Analysis</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                  <div className="text-2xl font-bold text-green-400">{aiInsights.sentimentAnalysis.positive}</div>
                                  <div className="text-sm text-white/60">Positive</div>
                                </div>
                                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                  <div className="text-2xl font-bold text-yellow-400">{aiInsights.sentimentAnalysis.neutral}</div>
                                  <div className="text-sm text-white/60">Neutral</div>
                                </div>
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                  <div className="text-2xl font-bold text-red-400">{aiInsights.sentimentAnalysis.negative}</div>
                                  <div className="text-sm text-white/60">Negative</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Key Topics */}
                          {aiInsights.keyTopics?.length > 0 && (
                            <div className="rounded-lg bg-[#121324]/90 border border-blue-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-blue-400">🏷️ Key Topics</h4>
                              <div className="flex flex-wrap gap-2">
                                {aiInsights.keyTopics.map((topic, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Strengths */}
                          {aiInsights.strengths?.length > 0 && (
                            <div className="rounded-lg bg-[#121324]/90 border border-green-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-green-400">✅ Key Strengths</h4>
                              <ul className="space-y-3">
                                {aiInsights.strengths.map((strength, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span className="text-white/80">{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Weaknesses */}
                          {aiInsights.weaknesses?.length > 0 && (
                            <div className="rounded-lg bg-[#121324]/90 border border-red-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-red-400">⚠️ Areas for Improvement</h4>
                              <ul className="space-y-3">
                                {aiInsights.weaknesses.map((weakness, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="text-red-400 mt-1">•</span>
                                    <span className="text-white/80">{weakness}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Priority Actions */}
                          {aiInsights.priorityActions?.length > 0 && (
                            <div className="rounded-lg bg-[#121324]/90 border border-orange-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-orange-400">🎯 Priority Actions</h4>
                              <ul className="space-y-3">
                                {aiInsights.priorityActions.map((action, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="text-orange-400 mt-1 font-bold">{index + 1}.</span>
                                    <span className="text-white/80">{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommendations */}
                          {aiInsights.recommendations?.length > 0 && (
                            <div className="rounded-lg bg-[#121324]/90 border border-yellow-500/20 p-6">
                              <h4 className="text-lg font-semibold mb-4 text-yellow-400">💡 Recommendations</h4>
                              <ul className="space-y-3">
                                {aiInsights.recommendations.map((recommendation, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <span className="text-yellow-400 mt-1">💡</span>
                                    <span className="text-white/80">{recommendation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Trend Analysis */}
                          {aiInsights.trendAnalysis && (
                            <div className="rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-6">
                              <h4 className="text-lg font-semibold mb-3 text-indigo-400">📈 Trend Analysis</h4>
                              <p className="text-white/80 leading-relaxed">{aiInsights.trendAnalysis}</p>
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
