import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import CompetitorLineGraph from './CompetitorLineGraph';
import CompetitorPieChart from './CompetitorPieChart';
import {
  MapPin,
  Star,
  Users,
  Phone,
  Globe,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Brain,
  Sparkles,
  ShieldAlert,
  Zap,
} from 'lucide-react';

const CompetitorDetails = ({ accountId, locationId, businessName, businessCategory, businessLat, businessLng, businessRating, businessReviews, reviews = [] }) => {
  const { theme } = useTheme();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [searchType, setSearchType] = useState('business');
  const [imageModal, setImageModal] = useState(null); // { name, photos }
  const [actionPlan, setActionPlan] = useState(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionPlanError, setActionPlanError] = useState(null);

  const generateActionPlan = useCallback(async () => {
    if (actionPlanLoading || competitors.length === 0) return;
    setActionPlanLoading(true);
    setActionPlanError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/competitors/action-plan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName,
            businessCategory,
            businessRating,
            businessReviews,
            competitors: competitors.map(c => ({
              name: c.name,
              rating: c.rating,
              totalRatings: c.totalRatings
            }))
          })
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setActionPlan(data.data);
    } catch (err) {
      setActionPlanError(err.message);
    } finally {
      setActionPlanLoading(false);
    }
  }, [competitors, businessName, businessCategory, actionPlanLoading]);

  // Fetch competitors on component mount
  useEffect(() => {
    if (accountId && locationId && businessLat && businessLng) {
      fetchCompetitors();
    }
  }, [accountId, locationId, businessLat, businessLng]);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required parameters
      if (!businessLat || !businessLng) {
        throw new Error('Business location coordinates are required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/competitors/nearby?` +
        new URLSearchParams({
          lat: businessLat.toString(),
          lng: businessLng.toString(),
          keyword: businessCategory || 'business',
          radius: '15000', // Larger radius for more results
          type: 'establishment',
          accountId: accountId,
          locationId: locationId,
          searchType: searchType
        })
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch competitors');
      }

      setCompetitors(data.data.competitors || []);
      setIsCached(data.data.cached || false);

      // If we got less than 10 competitors, try with larger radius
      if (data.data.competitors.length < 10 && !data.data.cached) {
        console.log('Trying with larger radius for more competitors...');
        await fetchWithLargerRadius();
      }

    } catch (err) {
      console.error('Error fetching competitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithLargerRadius = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/competitors/nearby?` +
        new URLSearchParams({
          lat: businessLat.toString(),
          lng: businessLng.toString(),
          keyword: businessCategory || 'business',
          radius: '25000', // Much larger radius
          type: 'establishment',
          accountId: accountId,
          locationId: locationId,
          searchType: searchType
        })
      );

      const data = await response.json();
      if (data.success && data.data.competitors.length > competitors.length) {
        setCompetitors(data.data.competitors);
        setIsCached(data.data.cached || false);
      }
    } catch (err) {
      console.log('Larger radius search failed:', err);
    }
  };

  const refreshCompetitors = () => {
    fetchCompetitors();
  };

  if (loading && competitors.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#0f1020]' : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Finding Competitors...
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Searching for businesses similar to {businessName}
          </p>
        </div>
      </div>
    );
  }

  if (error && competitors.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#0f1020]' : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Competitors
          </h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={refreshCompetitors}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${theme === 'dark' ? 'bg-[#0f1020] text-white' : 'text-gray-900 bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Competitors Analysis
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            {businessName} - {businessCategory}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center text-sm px-3 py-1 rounded-full ${
                isCached
                  ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  : theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                {isCached ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Cached Data
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Live Data
                  </>
                )}
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                {competitors.length} competitors found
              </span>
            </div>
            <button
              onClick={refreshCompetitors}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                theme === 'dark'
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Ranking Graph */}
        {competitors.length > 0 && (
          <div className={`mt-8 py-4 sm:py-6 rounded-xl ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center mb-6">
              <BarChart3 className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Competitor Rankings by Rating
              </h3>
            </div>

            <div className="space-y-4 p-2">
              <div className="w-full">
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-between text-xs text-gray-500 pr-1">
                    <span>5</span>
                    <span>4</span>
                    <span>3</span>
                    <span>2</span>
                    <span>1</span>
                    <span>0</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-8 space-y-1">
                    {competitors
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                      .slice(0, 10) // Show top 10
                      .map((competitor, index) => {
                        const rating = competitor.rating || 0;
                        const percentage = (rating / 5) * 100;

                        return (
                          <div key={competitor.placeId || index} className="flex items-center space-x-2">
                            {/* Rank */}
                            <div className={`w-5 text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                              #{index + 1}
                            </div>

                            {/* Business Name - Shorter */}
                            <div className={`flex-1 min-w-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <p className="text-xs font-medium truncate">
                                {competitor.name.substring(0, 15)}...
                              </p>
                            </div>

                            {/* Rating */}
                            <div className={`w-8 text-xs font-medium text-center ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                              {rating > 0 ? rating.toFixed(1) : 'N/A'}
                            </div>

                            {/* Bar - Shorter */}
                            <div className="flex-1 relative min-w-[60px]">
                              <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div
                                  className={`h-full rounded transition-all duration-1000 ease-out ${
                                    rating >= 4.0 ? 'bg-green-500' :
                                    rating >= 3.0 ? 'bg-yellow-500' :
                                    rating >= 2.0 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Review count - Compact */}
                            <div className={`w-10 text-xs text-center ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                              {competitor.totalRatings ? `${competitor.totalRatings}` : '0'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Excellent (4.0+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Good (3.0-3.9)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Average (2.0-2.9)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Poor (0-1.9)</span>
                </div>
              </div>

              {/* Insights */}
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center mb-2">
                  <TrendingUp className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                    Market Insights
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Top Performer:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {competitors.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.name || 'N/A'}
                      ({competitors.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.rating?.toFixed(1) || 'N/A'} ⭐)
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Average Rating:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {(competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.filter(c => c.rating).length).toFixed(1)} ⭐
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Competition Level:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {competitors.filter(c => c.rating && c.rating >= 4.0).length}/{competitors.length} high-rated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Ranking Graph */}
        {competitors.length > 0 && (
          <div className={`mt-8 py-4 sm:py-6 rounded-xl ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center mb-6">
              <Users className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Competitor Rankings by Review Count
              </h3>
            </div>

            <div className="space-y-4 p-2">
              <div className="w-full">
                <div className="relative">
                  {/* Y-axis labels - Dynamic based on max reviews */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500 pr-1">
                    {(() => {
                      const maxReviews = Math.max(...competitors.map(c => c.totalRatings || 0));
                      const steps = [maxReviews, Math.floor(maxReviews * 0.5), 0];
                      return steps.map(step => (
                        <span key={step}>{step.toLocaleString()}</span>
                      ));
                    })()}
                  </div>

                  {/* Chart area */}
                  <div className="ml-10 space-y-1">
                    {competitors
                      .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
                      .slice(0, 10) // Show top 10
                      .map((competitor, index) => {
                        const reviewCount = competitor.totalRatings || 0;
                        const maxReviews = Math.max(...competitors.map(c => c.totalRatings || 0));
                        const percentage = maxReviews > 0 ? (reviewCount / maxReviews) * 100 : 0;

                        return (
                          <div key={`reviews-${competitor.placeId || index}`} className="flex items-center space-x-2">
                            {/* Rank */}
                            <div className={`w-5 text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                              #{index + 1}
                            </div>

                            {/* Business Name - Shorter */}
                            <div className={`flex-1 min-w-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <p className="text-xs font-medium truncate">
                                {competitor.name.substring(0, 15)}...
                              </p>
                            </div>

                            {/* Review Count */}
                            <div className={`w-12 text-xs font-medium text-center ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              {reviewCount.toLocaleString()}
                            </div>

                            {/* Bar - Shorter */}
                            <div className="flex-1 relative min-w-[60px]">
                              <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div
                                  className={`h-full rounded transition-all duration-1000 ease-out ${
                                    reviewCount >= maxReviews * 0.8 ? 'bg-green-500' :
                                    reviewCount >= maxReviews * 0.6 ? 'bg-blue-500' :
                                    reviewCount >= maxReviews * 0.4 ? 'bg-yellow-500' :
                                    reviewCount >= maxReviews * 0.2 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Rating - Compact */}
                            <div className={`w-8 text-xs text-center ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                              {competitor.rating ? `${competitor.rating.toFixed(1)}⭐` : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Very Popular (80%+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Popular (60-79%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Moderate (40-59%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Low (20-39%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Very Low (0-19%)</span>
                </div>
              </div>

              {/* Insights */}
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center mb-2">
                  <TrendingUp className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                    Review Volume Insights
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Most Reviewed:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {competitors.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))[0]?.name || 'N/A'}
                      ({competitors.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))[0]?.totalRatings?.toLocaleString() || '0'} reviews)
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Average Reviews:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {Math.round(competitors.reduce((sum, c) => sum + (c.totalRatings || 0), 0) / competitors.length).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Review Leaders:
                    </span>
                    <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {competitors.filter(c => c.totalRatings && c.totalRatings > 100).length}/{competitors.length} with 100+ reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined Line Comparison Graph */}
        <CompetitorLineGraph competitors={competitors} theme={theme} />

        {/* Pie Chart Distribution */}
        <CompetitorPieChart competitors={competitors} theme={theme} />

        {/* Market Benchmark + Top Competitors Comparison */}
        {competitors.length > 0 && (() => {
          const sorted = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          const benchmarkCount = Math.min(sorted.length, 10);
          const top10 = sorted.slice(0, benchmarkCount);
          const top3Count = Math.min(sorted.length, 3);
          const top3 = sorted.slice(0, top3Count);

          const avgReviews = Math.round(top10.reduce((s, c) => s + (c.totalRatings || 0), 0) / top10.length);
          const avgRating = (top10.reduce((s, c) => s + (c.rating || 0), 0) / top10.filter(c => c.rating).length);
          const avgPhotos = Math.round(top10.reduce((s, c) => s + (c.totalPhotos || 0), 0) / top10.length);

          const top3AvgReviews = Math.round(top3.reduce((s, c) => s + (c.totalRatings || 0), 0) / top3.length);
          const top3AvgRating = (top3.reduce((s, c) => s + (c.rating || 0), 0) / top3.filter(c => c.rating).length);
          const top3AvgPhotos = Math.round(top3.reduce((s, c) => s + (c.totalPhotos || 0), 0) / top3.length);

          const myReviews = businessReviews || 0;
          const myRating = businessRating || 0;
          const myPhotos = 0; // not available from props

          const BenchmarkRow = ({ label, mine, avg, isRating }) => {
            const pct = avg > 0 ? Math.min((mine / avg) * 100, 100) : 0;
            const above = isRating ? mine >= avg : mine >= avg;
            const diff = isRating ? (mine - avg).toFixed(1) : Math.round(avg - mine);
            return (
              <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${above
                    ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                    : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                    {above ? '↑ Above Avg' : '↓ Below Avg'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    You: {isRating ? myRating || 'N/A' : mine}{isRating ? '★' : ''}
                  </span>
                  <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>vs</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    Avg: {isRating ? avgRating.toFixed(1) : avg}{isRating ? '★' : ''}
                  </span>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-full rounded-full ${above ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-1 ${above ? theme === 'dark' ? 'text-green-400' : 'text-green-600' : theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  You: {isRating ? myRating || 'N/A' : mine}{isRating ? '★' : ''} — {above ? 'Above' : 'Below'} market average
                </p>
              </div>
            );
          };

          const TopRow = ({ label, mine, top, isRating }) => {
            const myPct = top > 0 ? Math.min((mine / top) * 100, 100) : 0;
            const needed = isRating ? (top - mine).toFixed(1) : Math.round(top - mine);
            const ahead = isRating ? (top / (mine || 1)).toFixed(1) : (top / (mine || 1)).toFixed(1);
            return (
              <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                  <span className={`text-xs font-semibold text-red-500`}>
                    ↘ {needed > 0 ? `+${needed} needed` : 'On par'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    You: {isRating ? (mine || 'N/A') : mine}{isRating ? '★' : ''}
                  </span>
                  <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>vs</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                    Top: {isRating ? top.toFixed(1) : top}{isRating ? '★' : ''}
                  </span>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} relative`}>
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${myPct}%` }} />
                  <div className="absolute top-0 h-full rounded-full bg-yellow-400/50" style={{ width: '100%' }} />
                  <div className="absolute top-0 h-full rounded-full bg-blue-500" style={{ width: `${myPct}%` }} />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                  Top competitors are {ahead}x ahead{label === 'Rating' ? ' in rating' : label === 'Reviews' ? ' in reviews' : ' in photos'}
                </p>
              </div>
            );
          };

          return (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Benchmark */}
              <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Market Benchmark</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>Top {benchmarkCount} Avg</span>
                </div>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>How you compare to the average of your top {benchmarkCount} competitors</p>
                <div className="space-y-3">
                  <BenchmarkRow label="Reviews" mine={myReviews} avg={avgReviews} />
                  <BenchmarkRow label="Rating" mine={myRating} avg={avgRating} isRating />
                </div>
              </div>

              {/* Top Competitors */}
              <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏆</span>
                  <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Competitors</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>Top {top3Count}</span>
                </div>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>What it takes to beat the best in your area</p>
                <div className="space-y-3">
                  {top3.map((c, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const maxReviews = Math.max(top3[0]?.totalRatings || 1, myReviews || 1);
                    const cReviewPct = Math.min(((c.totalRatings || 0) / maxReviews) * 100, 100);
                    const myReviewPct = Math.min(((myReviews || 0) / maxReviews) * 100, 100);
                    const cRatingPct = ((c.rating || 0) / 5) * 100;
                    const myRatingPct = ((myRating || 0) / 5) * 100;

                    const reviewDiff = (myReviews || 0) - (c.totalRatings || 0);
                    const ratingDiff = ((myRating || 0) - (c.rating || 0)).toFixed(1);
                    const reviewAhead = reviewDiff >= 0;
                    const ratingAhead = parseFloat(ratingDiff) >= 0;

                    return (
                      <div key={c.placeId || i} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {/* Competitor name */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{medals[i]}</span>
                          <span className={`text-sm font-semibold truncate flex-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{c.name}</span>
                        </div>

                        {/* Reviews comparison */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>Reviews</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reviewAhead
                              ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                              : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                              {reviewAhead ? `+${reviewDiff} ahead` : `${reviewDiff} behind`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs w-16 text-right font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{(c.totalRatings || 0).toLocaleString()}</span>
                            <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className="h-full rounded-full bg-yellow-400" style={{ width: `${cReviewPct}%` }} />
                            </div>
                            <span className={`text-xs w-14 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{c.name.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs w-16 text-right font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{(myReviews || 0).toLocaleString()}</span>
                            <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${myReviewPct}%` }} />
                            </div>
                            <span className={`text-xs w-14 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>You</span>
                          </div>
                        </div>

                        {/* Rating comparison */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>Rating</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingAhead
                              ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                              : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                              {ratingAhead ? `+${ratingDiff}★ ahead` : `${ratingDiff}★ behind`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs w-16 text-right font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{c.rating ? c.rating.toFixed(1) : 'N/A'} ★</span>
                            <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className="h-full rounded-full bg-yellow-400" style={{ width: `${cRatingPct}%` }} />
                            </div>
                            <span className={`text-xs w-14 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{c.name.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs w-16 text-right font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{myRating ? myRating.toFixed(1) : 'N/A'} ★</span>
                            <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${myRatingPct}%` }} />
                            </div>
                            <span className={`text-xs w-14 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>You</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Google Maps Growth Score */}
        {competitors.length > 0 && (() => {
          const topComp = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          const myReviewsScore = businessReviews || 0;
          const myRatingScore = businessRating || 0;

          // Reply rate from actual reviews data
          const totalReviews = reviews.length;
          const repliedReviews = reviews.filter(r => r.reviewReply !== undefined).length;
          const replyRatePct = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;

          // Score calculation (out of 100) — only 3 metrics
          const reviewScore = Math.min(Math.round((myReviewsScore / Math.max(topComp?.totalRatings || 1, 1)) * 100), 100);
          const ratingScore = myRatingScore ? Math.round((myRatingScore / 5) * 100) : 0;
          const replyScore = replyRatePct;

          const overallScore = Math.round((reviewScore * 0.35) + (ratingScore * 0.40) + (replyScore * 0.25));

          // Top competitor score
          const topRatingScore = topComp?.rating ? Math.round((topComp.rating / 5) * 100) : 0;
          const topOverall = Math.round((100 * 0.35) + (topRatingScore * 0.40) + (50 * 0.25));
          const pointsBehind = topOverall - overallScore;

          const radius = 54;
          const circumference = 2 * Math.PI * radius;
          const strokeDash = (overallScore / 100) * circumference;

          const metrics = [
            { label: 'Reviews', score: reviewScore, color: 'bg-blue-500', raw: myReviewsScore },
            { label: 'Rating', score: ratingScore, color: 'bg-green-500', raw: myRatingScore ? `${myRatingScore}/5` : 'N/A' },
            { label: 'Reply Rate', score: replyScore, color: 'bg-cyan-400', raw: `${repliedReviews}/${totalReviews}` },
          ];

          return (
            <div className={`mt-8 rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round"/>
                  <path d="M22 2L12 12" strokeLinecap="round"/>
                </svg>
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Google Maps Growth Score
                </h3>
              </div>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                {pointsBehind > 0
                  ? <>You are behind your top competitor by <span className="text-red-500 font-semibold">{pointsBehind} points</span></>
                  : <span className="text-green-500 font-semibold">You are ahead of your top competitor</span>
                }
              </p>

              {/* Circular Score */}
              <div className="flex justify-center mb-8">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r={radius} fill="none"
                      stroke="#3b82f6" strokeWidth="10"
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallScore}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>/100</span>
                  </div>
                </div>
              </div>

              {/* Metric Bars */}
              <div className="space-y-3">
                {metrics.map(({ label, score, color, raw }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`text-sm w-20 flex-shrink-0 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>{label}</span>
                    <div className={`flex-1 h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-16 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{raw}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Gap Visualization */}
        {competitors.length > 0 && (() => {
          const sorted = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          const top = sorted[0];
          const benchmarkN = Math.min(sorted.length, 10);
          const bench = sorted.slice(0, benchmarkN);

          const myRev = businessReviews || 0;
          const myRat = businessRating || 0;

          const marketAvgReviews = Math.round(bench.reduce((s, c) => s + (c.totalRatings || 0), 0) / bench.length);
          const topReviews = top?.totalRatings || 0;
          const maxReviews = Math.max(topReviews, myRev, 1);

          const marketAvgRating = parseFloat((bench.reduce((s, c) => s + (c.rating || 0), 0) / bench.filter(c => c.rating).length).toFixed(1));
          const topRating = top?.rating || 0;
          const maxRating = 5;

          const GapBar = ({ icon, label, mine, marketAvg, topVal, max, isRating }) => {
            const minePct = Math.min((mine / max) * 100, 100);
            const avgPct = Math.min((marketAvg / max) * 100, 100);
            const topPct = Math.min((topVal / max) * 100, 100);
            const gap = isRating
              ? parseFloat((topVal - mine).toFixed(1))
              : Math.round(topVal - mine);
            const gapLabel = gap > 0 ? `Gap: +${gap}` : gap < 0 ? `Ahead: ${Math.abs(gap)}` : 'On par';
            const gapColor = gap > 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600';

            return (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      {icon}
                    </div>
                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gapColor}`}>{gapLabel}</span>
                </div>

                {/* Bar track */}
                <div className="relative h-4 rounded-full overflow-visible" style={{ background: theme === 'dark' ? '#374151' : '#ede9fe' }}>
                  {/* Your bar */}
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-blue-500"
                    style={{ width: `${minePct}%` }}
                  />
                  {/* Market avg marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-yellow-400"
                    style={{ left: `${avgPct}%` }}
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-1 text-xs">
                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    You: {isRating ? mine.toFixed(1) : mine}
                  </span>
                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                    Market Avg: {isRating ? marketAvg.toFixed(1) : marketAvg}
                  </span>
                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Top: {isRating ? topVal.toFixed(1) : topVal}
                  </span>
                </div>
              </div>
            );
          };

          return (
            <div className={`mt-8 rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-1">
                <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Gap Visualization</h3>
              </div>
              <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                Your position relative to market average and top competitors
              </p>

              <GapBar
                icon={<svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                label="Reviews"
                mine={myRev}
                marketAvg={marketAvgReviews}
                topVal={topReviews}
                max={maxReviews}
              />
              <GapBar
                icon={<svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                label="Rating"
                mine={myRat}
                marketAvg={marketAvgRating}
                topVal={topRating}
                max={maxRating}
                isRating
              />
            </div>
          );
        })()}

        {/* Performance Insights */}
        {competitors.length > 0 && (() => {
          const myRev = businessReviews || 0;
          const myRat = businessRating || 0;
          const totalRev = reviews.length;
          const repliedRev = reviews.filter(r => r.reviewReply !== undefined).length;
          const replyRatePct = totalRev > 0 ? Math.round((repliedRev / totalRev) * 100) : 0;

          const benchN = Math.min(competitors.length, 10);
          const bench = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, benchN);
          const avgReviews = Math.round(bench.reduce((s, c) => s + (c.totalRatings || 0), 0) / bench.length);
          const avgRating = parseFloat((bench.reduce((s, c) => s + (c.rating || 0), 0) / bench.filter(c => c.rating).length).toFixed(1));
          const reviewMultiple = avgReviews > 0 && myRev > 0 ? (avgReviews / myRev).toFixed(1) : null;

          // Build dynamic insights from real data
          const insights = [];

          // Review gap insight
          if (myRev === 0) {
            insights.push({ icon: '⭐', text: `You have no reviews yet — competitors average ${avgReviews} reviews. Getting your first reviews is the #1 priority.`, type: 'critical' });
          } else if (avgReviews > myRev) {
            insights.push({ icon: '📊', text: `Your competitors have ${reviewMultiple}x more reviews (avg ${avgReviews} vs your ${myRev}) — reviews are the #1 ranking factor.`, type: 'critical' });
          } else {
            insights.push({ icon: '🏆', text: `You have more reviews (${myRev}) than the market average (${avgReviews}) — great advantage, keep collecting!`, type: 'positive' });
          }

          // Rating insight
          if (myRat === 0) {
            insights.push({ icon: '⚠️', text: `Your rating is unknown. Ensure your Google Business profile is complete and encourage customers to leave ratings.`, type: 'warning' });
          } else if (myRat >= avgRating) {
            insights.push({ icon: '✅', text: `Your rating (${myRat}★) is competitive vs market average (${avgRating}★) — maintain quality to hold this advantage.`, type: 'positive' });
          } else {
            insights.push({ icon: '📉', text: `Your rating (${myRat}★) is below market average (${avgRating}★) — focus on service quality to improve it.`, type: 'warning' });
          }

          // Reply rate insight
          if (totalRev === 0) {
            insights.push({ icon: '💬', text: `No reviews to reply to yet. Once you get reviews, aim for 100% reply rate to boost engagement.`, type: 'info' });
          } else if (replyRatePct < 50) {
            insights.push({ icon: '💬', text: `Your reply rate (${replyRatePct}%) is low — replying to reviews signals activity to Google and improves ranking.`, type: 'critical' });
          } else if (replyRatePct < 80) {
            insights.push({ icon: '💬', text: `Your reply rate (${replyRatePct}%) is decent but aim for 90%+ — ${totalRev - repliedRev} reviews still need a response.`, type: 'warning' });
          } else {
            insights.push({ icon: '💬', text: `Excellent reply rate (${replyRatePct}%) — you're responding well to customer feedback.`, type: 'positive' });
          }

          // Fastest growth tip
          if (myRev < avgReviews) {
            insights.push({ icon: '🚀', text: `Improving reviews will give the fastest growth — getting to ${avgReviews} reviews could boost your ranking significantly.`, type: 'info' });
          } else if (replyRatePct < 80) {
            insights.push({ icon: '🚀', text: `Improving your reply rate is your fastest win — reply to all ${totalRev - repliedRev} pending reviews today.`, type: 'info' });
          } else {
            insights.push({ icon: '🚀', text: `You're performing well overall — focus on maintaining consistency and adding new photos to stay ahead.`, type: 'info' });
          }

          const typeStyles = {
            critical: theme === 'dark' ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50',
            warning: theme === 'dark' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-yellow-200 bg-yellow-50',
            positive: theme === 'dark' ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50',
            info: theme === 'dark' ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50',
          };
          const textStyles = {
            critical: theme === 'dark' ? 'text-red-300' : 'text-red-700',
            warning: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700',
            positive: theme === 'dark' ? 'text-green-300' : 'text-green-700',
            info: theme === 'dark' ? 'text-blue-300' : 'text-blue-700',
          };

          return (
            <div className={`mt-8 rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance Insights</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  Smart Analysis
                </span>
              </div>
              <p className={`text-xs mb-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                Smart analysis based on competitor data
              </p>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${typeStyles[insight.type]}`}>
                    <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
                    <p className={`text-sm leading-relaxed ${textStyles[insight.type]}`}>{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Competitors Grid - 1 card per row for proper horizontal layout */}
        <div className="space-y-6">
          {competitors.map((competitor, index) => (
            <div
              key={competitor.placeId || index}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-[#1a1b2e]/90 border border-white/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Horizontal 3-Part Layout */}
              <div className="flex flex-row min-h-[280px]">
                {/* LEFT SIDE - Details (40% width) */}
                <div className="w-[40%] p-4 border-r border-gray-200 dark:border-white/10 flex flex-col">
                  {/* Rank Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
                      #{index + 1}
                    </div>
                    {/* Rating Badge */}
                    {competitor.rating && (
                      <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {competitor.rating}
                      </div>
                    )}
                  </div>

                  <h3 className={`text-base sm:text-lg font-semibold mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {competitor.name}
                  </h3>

                  {/* Address */}
                  <div className={`flex items-start mb-3 text-xs sm:text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{competitor.address}</span>
                  </div>

                  {/* Rating & Reviews */}
                  {competitor.rating && (
                    <div className="flex items-center mb-3">
                      <div className={`flex items-center text-xs sm:text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current" />
                        <span className="font-medium">{competitor.rating}</span>
                        {competitor.totalRatings && (
                          <span className={`ml-1 text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                            ({competitor.totalRatings} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {competitor.categories?.primaryCategory && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        🏷️ {competitor.categories.primaryCategory.displayName}
                      </span>
                      {competitor.categories.additionalCategories?.slice(0, 2).map((cat, i) => (
                        <span key={i} className={`inline-block text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {cat.displayName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Phone */}
                  {competitor.phoneNumbers?.primaryPhone && (
                    <div className={`flex items-center mb-2 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                      <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                      <a href={`tel:${competitor.phoneNumbers.primaryPhone}`} className="hover:underline truncate">
                        {competitor.phoneNumbers.primaryPhone}
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {competitor.websiteUri && (
                    <div className={`flex items-center mb-3 text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                      <a href={competitor.websiteUri} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {competitor.websiteUri.replace(/^https?:\/\//, '').split('/')[0]}
                      </a>
                    </div>
                  )}

                  {/* Business Status */}
                  {competitor.businessStatus && (
                    <div className="mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        competitor.businessStatus === 'OPERATIONAL'
                          ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                      }`}>
                        {competitor.businessStatus === 'OPERATIONAL' ? '● Open' : '● ' + competitor.businessStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200 dark:border-white/10">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competitor.name + ' ' + competitor.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg text-xs font-medium transition ${
                        theme === 'dark'
                          ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Map
                    </a>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(competitor.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg text-xs font-medium transition ${
                        theme === 'dark'
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Search
                    </a>
                  </div>
                </div>

                {/* MIDDLE - Images Gallery (30% width) */}
                <div className={`w-[30%] p-3 border-r border-gray-200 dark:border-white/10 flex flex-col ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Photos ({competitor.totalPhotos || competitor.photos?.length || 0})
                    </span>
                    {competitor.photos && competitor.photos.length > 5 && (
                      <button
                        onClick={() => setImageModal({ name: competitor.name, photos: competitor.photos })}
                        className={`text-xs font-medium ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                      >
                        View All
                      </button>
                    )}
                  </div>
                  
                  {competitor.photos && competitor.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {competitor.photos.slice(0, 4).map((photo, i) => (
                        <div
                          key={i}
                          className="relative rounded-lg overflow-hidden cursor-pointer group h-20"
                          onClick={() => setImageModal({ name: competitor.name, photos: competitor.photos })}
                        >
                          <img
                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photoreference=${photo.photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                            alt={`${competitor.name} ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={e => { e.target.src = `https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=No+Image`; }}
                          />
                        </div>
                      ))}
                      {competitor.photos.length > 4 && (
                        <div 
                          className="col-span-2 relative rounded-lg overflow-hidden cursor-pointer group h-20"
                          onClick={() => setImageModal({ name: competitor.name, photos: competitor.photos })}
                        >
                          <img
                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photoreference=${competitor.photos[4].photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                            alt={`${competitor.name} 5`}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = `https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=No+Image`; }}
                          />
                          {competitor.photos.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                +{competitor.photos.length - 5} more
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center flex-1 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-200'
                    }`}>
                      <ImageIcon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`} />
                      <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                        No photos
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE - Reviews (30% width) */}
                <div className={`w-[30%] p-3 flex flex-col ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Reviews ({competitor.totalReviews ?? competitor.reviews?.length ?? 0})
                    </span>
                  </div>

                  {competitor.reviews && competitor.reviews.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '240px' }}>
                      {competitor.reviews.map((review, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                          }`}
                        >
                          {/* Reviewer Info */}
                          <div className="flex items-center mb-1">
                            {review.profilePhotoUrl ? (
                              <img
                                src={review.profilePhotoUrl}
                                alt={review.authorName}
                                className="w-6 h-6 rounded-full mr-2"
                                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.authorName)}&size=24`; }}
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs font-bold ${
                                theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {review.authorName?.charAt(0) || '?'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {review.authorName}
                              </p>
                              <div className="flex items-center">
                                <div className="flex items-center mr-1">
                                  {[...Array(5)].map((_, starIdx) => (
                                    <Star
                                      key={starIdx}
                                      className={`w-2.5 h-2.5 ${
                                        starIdx < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                                  {review.relativeTimeDescription}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Review Text */}
                          {review.text && (
                            <p className={`text-xs leading-relaxed line-clamp-2 ${
                              theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                            }`}>
                              {review.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center flex-1 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800/30' : 'bg-white'
                    }`}>
                      <Star className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`} />
                      <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                        No reviews
                      </span>
                    </div>
                  )}
                </div>


              </div>
            </div>
          ))}
        </div>

        {/* Load More Message */}
        {competitors.length < 10 && !loading && (
          <div className={`text-center mt-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
            <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
              Limited Results
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
              Only {competitors.length} competitors found. This might be due to limited Google Places API data in this area.
            </p>
          </div>
        )}

        {/* AI Competitor Action Plan */}
        {competitors.length > 0 && (
          <div className={`mt-8 rounded-2xl p-1 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200'}`}>
            <div className={`rounded-2xl p-6 space-y-4 ${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-[#f7f8fc]'}`}>

              {/* Header */}
              <div className="flex items-center gap-3">
                <Brain className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AI Competitor Action Plan
                </h2>
                <button
                  onClick={generateActionPlan}
                  disabled={actionPlanLoading}
                  className={`ml-auto text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md ${actionPlanLoading ? 'opacity-70' : 'hover:opacity-90'}`}
                >
                  {actionPlanLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>

              {actionPlanError && (
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  <AlertCircle className="w-4 h-4" /> {actionPlanError}
                </div>
              )}

              {actionPlan ? (
                <div className={`rounded-xl border p-5 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {actionPlan.text}
                  </p>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Brain className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Get AI-Powered Action Plan
                  </h3>
                  <p className={`text-sm mt-1 mb-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Compare your business against {competitors.length} competitors and get a personalized growth strategy.
                  </p>
                  <button
                    onClick={generateActionPlan}
                    disabled={actionPlanLoading}
                    className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 shadow-md transition-all ${actionPlanLoading ? 'opacity-70' : 'hover:opacity-90'}`}
                  >
                    {actionPlanLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {actionPlanLoading ? 'Analyzing...' : 'Generate Action Plan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {competitors.length > 0 && (
          <div className={`mt-8 py-4 sm:py-6 rounded-xl ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Market Analysis Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {competitors.length}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  Total Competitors
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {competitors.filter(c => c.rating && c.rating >= 4.0).length}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  High Rated (4.0+)
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {competitors.filter(c => c.totalRatings && c.totalRatings > 50).length}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  Popular (50+ reviews)
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {competitors.filter(c => c.photos && c.photos.length > 0).length}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  With Images
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImageModal(null)}
        >
          <div
            className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl ${
              theme === 'dark' ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {imageModal.name}
                </h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                  {imageModal.photos.length} Photos
                </p>
              </div>
              <button
                onClick={() => setImageModal(null)}
                className={`p-2 rounded-full transition ${
                  theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Images Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageModal.photos.map((photo, i) => (
                  <div
                    key={i}
                    className={`relative rounded-lg overflow-hidden group ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <img
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                      alt={`${imageModal.name} ${i + 1}`}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { 
                        e.target.src = `https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Image+${i+1}`; 
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium">
                        Photo {i + 1} of {imageModal.photos.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorDetails;
