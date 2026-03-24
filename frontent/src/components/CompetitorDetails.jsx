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

const CompetitorDetails = ({ accountId, locationId, businessName, businessCategory, businessLat, businessLng, businessRating, businessReviews, reviews = [], scheduledPosts = [], myPhotosCount = 0 }) => {
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

        {/* Ranking Graph - REMOVED */}
        {/* Reviews Ranking Graph - REMOVED */}
        {/* Combined Line Comparison Graph - REMOVED */}
        {/* Pie Chart Distribution - REMOVED */}

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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>Top {top3Count} Avg</span>
                </div>
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>How you compare to the average of your top {top3Count} competitors</p>
                <div className="space-y-3">
                  {/* Reviews row */}
                  {(() => {
                    const above = myReviews >= top3AvgReviews;
                    const diff = myReviews - top3AvgReviews;
                    const pct = top3AvgReviews > 0 ? Math.min((myReviews / top3AvgReviews) * 100, 100) : 0;
                    return (
                      <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Reviews</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${above
                            ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                            : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                            {above ? `↑ +${diff} ahead` : `↓ ${Math.abs(diff)} behind`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            You: {myReviews}
                          </span>
                          <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>vs</span>
                          <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            Avg: {top3AvgReviews}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className={`h-full rounded-full ${above ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className={`text-xs mt-1 ${above ? theme === 'dark' ? 'text-green-400' : 'text-green-600' : theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                          You: {myReviews} — {above ? 'Above' : 'Below'} top {top3Count} average
                        </p>
                      </div>
                    );
                  })()}
                  {/* Rating row */}
                  {(() => {
                    const top3AvgRatingFixed = parseFloat(top3AvgRating.toFixed(1));
                    const above = myRating >= top3AvgRatingFixed;
                    const diff = (myRating - top3AvgRatingFixed).toFixed(1);
                    const pct = top3AvgRatingFixed > 0 ? Math.min((myRating / top3AvgRatingFixed) * 100, 100) : 0;
                    return (
                      <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Rating</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${above
                            ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                            : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                            {above ? `↑ +${diff}★ ahead` : `↓ ${Math.abs(diff)}★ behind`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            You: {myRating ? myRating.toFixed(1) : 'N/A'}★
                          </span>
                          <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>vs</span>
                          <span className={`px-2 py-0.5 rounded font-semibold ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            Avg: {top3AvgRatingFixed}★
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className={`h-full rounded-full ${above ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className={`text-xs mt-1 ${above ? theme === 'dark' ? 'text-green-400' : 'text-green-600' : theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                          You: {myRating ? myRating.toFixed(1) : 'N/A'}★ — {above ? 'Above' : 'Below'} top {top3Count} average
                        </p>
                      </div>
                    );
                  })()}
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

          // Photos count from Google My Business media
          const myPhotos = myPhotosCount || 0;
          const marketAvgPhotos = 7; // industry benchmark
          const topPhotos = 15;
          const maxPhotos = Math.max(topPhotos, myPhotos, 1);

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
              <GapBar
                icon={<svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                label="Photos"
                mine={myPhotos}
                marketAvg={marketAvgPhotos}
                topVal={topPhotos}
                max={maxPhotos}
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

          // Photos from GMB media
          const myPhotos = myPhotosCount || 0;
          const benchmarkPhotos = 7; // industry avg

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

          // Photo insight
          if (myPhotos === 0) {
            insights.push({ icon: '📸', text: `You have no photos on your Google Business profile — businesses with photos get 42% more direction requests. Add photos today.`, type: 'critical' });
          } else if (myPhotos < benchmarkPhotos) {
            insights.push({ icon: '📸', text: `You have ${myPhotos} photos vs the recommended ${benchmarkPhotos}+ — more photos improve trust and visibility on Google Maps.`, type: 'warning' });
          } else {
            insights.push({ icon: '📸', text: `Good photo count (${myPhotos} photos) — keep adding fresh photos regularly to stay ahead.`, type: 'positive' });
          }

          // Fastest growth tip
          if (myRev < avgReviews) {
            insights.push({ icon: '🚀', text: `Improving reviews will give the fastest growth — getting to ${avgReviews} reviews could boost your ranking significantly.`, type: 'info' });
          } else if (replyRatePct < 80) {
            insights.push({ icon: '🚀', text: `Improving your reply rate is your fastest win — reply to all ${totalRev - repliedRev} pending reviews today.`, type: 'info' });
          } else if (myPhotos < benchmarkPhotos) {
            insights.push({ icon: '🚀', text: `Adding more photos is your next growth lever — aim for at least ${benchmarkPhotos} photos on your profile.`, type: 'info' });
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

              {/* Smart Action Plan */}
              {(() => {
                const actions = [];

                // Only add actions where there's actually a problem or growth opportunity
                if (myRev === 0) {
                  actions.push({ priority: 'High', color: 'red', icon: '⭐', title: 'Get Your First Reviews',
                    steps: ['Share your Google review link with every customer via WhatsApp or SMS', 'Add a QR code at your counter linking to your Google review page', 'Ask 5 loyal customers today — first reviews are the hardest, but most impactful'] });
                } else if (myRev < avgReviews) {
                  actions.push({ priority: 'High', color: 'red', icon: '⭐', title: 'Get More Reviews',
                    steps: [`You need ${avgReviews - myRev} more reviews to reach market average (${avgReviews})`, 'Send a review request after every purchase/service via WhatsApp', 'Add a QR code at your counter linking to your Google review page'] });
                } else {
                  // Above avg — maintain momentum
                  actions.push({ priority: 'Low', color: 'green', icon: '⭐', title: 'Maintain Review Momentum',
                    steps: ['Keep asking customers for reviews consistently — don\'t slow down', `You\'re ahead of market avg (${myRev} vs ${avgReviews}) — stay there`, 'Aim to double your current review count this quarter'] });
                }

                if (replyRatePct < 50) {
                  actions.push({ priority: 'High', color: 'red', icon: '💬', title: 'Reply to Pending Reviews',
                    steps: [`${totalRev - repliedRev} reviews are unanswered — reply today`, 'Use the AI Reply feature in the Reviews tab for quick responses', 'Enable Auto-Reply so you never miss a new review'] });
                } else if (replyRatePct < 80) {
                  actions.push({ priority: 'Medium', color: 'yellow', icon: '💬', title: 'Improve Reply Rate',
                    steps: [`${totalRev - repliedRev} reviews still need a response (current: ${replyRatePct}%)`, 'Aim for 90%+ reply rate — Google rewards active engagement', 'Enable Auto-Reply to handle new reviews automatically'] });
                } else {
                  // Good reply rate — just maintain
                  actions.push({ priority: 'Low', color: 'green', icon: '💬', title: 'Keep Replying Consistently',
                    steps: [`Great reply rate (${replyRatePct}%) — keep it up`, 'Enable Auto-Reply to maintain this even when you\'re busy', 'Personalize replies to stand out from competitors'] });
                }

                if (myRat === 0) {
                  actions.push({ priority: 'Medium', color: 'yellow', icon: '📈', title: 'Build Your Rating',
                    steps: ['Complete your Google Business profile to start receiving ratings', 'Encourage satisfied customers to rate you 5 stars', 'Respond to all reviews to show you care about feedback'] });
                } else if (myRat < avgRating) {
                  actions.push({ priority: 'Medium', color: 'yellow', icon: '📈', title: 'Improve Your Rating',
                    steps: [`Target ${avgRating}★ — you\'re currently at ${myRat}★`, 'Resolve complaints quickly and ask customers to update their review', 'Respond professionally to every negative review'] });
                } else {
                  actions.push({ priority: 'Low', color: 'green', icon: '✅', title: 'Protect Your Rating',
                    steps: [`Your ${myRat}★ rating is above market avg (${avgRating}★) — protect it`, 'Never ignore a negative review — always respond within 24 hours', 'Consistently deliver quality to keep ratings high'] });
                }

                // Always show profile & photos as growth tips
                actions.push({ priority: 'Low', color: 'blue', icon: '📸', title: 'Add Fresh Photos & Stay Active',
                  steps: ['Upload 3-5 new photos this week (products, team, workspace)', 'Post a Google Business update at least once a week', 'Active profiles rank higher — consistency beats one-time effort'] });

                // Photo action
                if (myPhotos === 0) {
                  actions.push({ priority: 'High', color: 'red', icon: '📸', title: 'Add Photos to Your Profile',
                    steps: ['You have 0 photos — businesses with photos get 42% more direction requests', 'Upload at least 5 photos: storefront, interior, products, team', 'Go to Settings → Google My Business Photos to manage your photos'] });
                } else if (myPhotos < benchmarkPhotos) {
                  actions.push({ priority: 'Medium', color: 'yellow', icon: '📸', title: 'Add More Photos',
                    steps: [`You have ${myPhotos} photos — aim for ${benchmarkPhotos}+ for best results`, 'Add photos of products, services, team, and your workspace', 'Fresh photos signal an active business to Google'] });
                } else {
                  actions.push({ priority: 'Low', color: 'green', icon: '📸', title: 'Keep Photos Fresh',
                    steps: [`${myPhotos} photos — great profile presence`, 'Add new photos monthly to keep your profile active', 'Seasonal photos (offers, events) perform especially well'] });
                }

                const priorityBg = {
                  red: theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200',
                  yellow: theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200',
                  blue: theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
                  green: theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200',
                };
                const priorityText = {
                  red: theme === 'dark' ? 'text-red-400' : 'text-red-700',
                  yellow: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
                  blue: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
                  green: theme === 'dark' ? 'text-green-400' : 'text-green-700',
                };
                const badgeBg = {
                  High: theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600',
                  Medium: theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
                  Low: theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
                };

                return (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Smart Action Plan</h4>
                    </div>
                    <div className="space-y-3">
                      {actions.map((action, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${priorityBg[action.color]}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{action.icon}</span>
                            <span className={`text-sm font-semibold ${priorityText[action.color]}`}>{action.title}</span>
                            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${badgeBg[action.priority]}`}>{action.priority}</span>
                          </div>
                          <ul className="space-y-1">
                            {action.steps.map((step, j) => (
                              <li key={j} className={`flex items-start gap-2 text-xs ${priorityText[action.color]}`}>
                                <span className="mt-0.5 flex-shrink-0">→</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* Competitors Grid - Live Monitoring */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📡</span>
            <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your vs Top Competitors
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
              Live Monitoring
            </span>
          </div>
        <div className="space-y-6">
          {[...competitors].sort((a, b) => {
            // Sort by combined score: rating weight 60% + review count weight 40%
            const maxRatings = Math.max(...competitors.map(c => c.totalRatings || 0), 1);
            const scoreA = ((a.rating || 0) / 5) * 0.6 + ((a.totalRatings || 0) / maxRatings) * 0.4;
            const scoreB = ((b.rating || 0) / 5) * 0.6 + ((b.totalRatings || 0) / maxRatings) * 0.4;
            return scoreB - scoreA;
          }).map((competitor, index) => {
            const maxRatings = Math.max(...competitors.map(c => c.totalRatings || 0), 1);
            const ratingScore = Math.round(((competitor.rating || 0) / 5) * 0.6 * 100);
            const reviewScore = Math.round(((competitor.totalRatings || 0) / maxRatings) * 0.4 * 100);
            const totalScore = ratingScore + reviewScore;
            const isTop3 = index < 3;
            const medals = ['🥇', '🥈', '🥉'];
            const top3BorderDark = ['border-yellow-400/60', 'border-gray-300/50', 'border-amber-600/50'];
            const top3BorderLight = ['border-yellow-400', 'border-gray-400', 'border-amber-600'];
            const top3GlowDark = ['shadow-yellow-500/20', 'shadow-gray-400/20', 'shadow-amber-600/20'];
            const top3GlowLight = ['shadow-yellow-300/40', 'shadow-gray-300/40', 'shadow-amber-400/30'];
            const top3BannerDark = ['from-yellow-500/20 to-yellow-600/5', 'from-gray-400/15 to-gray-500/5', 'from-amber-600/20 to-amber-700/5'];
            const top3BannerLight = ['from-yellow-50 to-white', 'from-gray-50 to-white', 'from-amber-50 to-white'];
            const top3LabelDark = ['text-yellow-300', 'text-gray-300', 'text-amber-400'];
            const top3LabelLight = ['text-yellow-700', 'text-gray-600', 'text-amber-700'];

            return (
            <div
              key={competitor.placeId || index}
              className={`rounded-xl overflow-hidden transition-all duration-300 ${
                isTop3
                  ? theme === 'dark'
                    ? `bg-gradient-to-br ${top3BannerDark[index]} border-2 ${top3BorderDark[index]} shadow-xl ${top3GlowDark[index]}`
                    : `bg-gradient-to-br ${top3BannerLight[index]} border-2 ${top3BorderLight[index]} shadow-xl ${top3GlowLight[index]}`
                  : theme === 'dark'
                    ? 'bg-[#1a1b2e]/90 border border-white/10 shadow-lg'
                    : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              {/* Top 3 Header Banner */}
              {isTop3 && (
                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                  theme === 'dark' ? `border-white/10 bg-gradient-to-r ${top3BannerDark[index]}` : `border-gray-100 bg-gradient-to-r ${top3BannerLight[index]}`
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{medals[index]}</span>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? top3LabelDark[index] : top3LabelLight[index]}`}>
                        {index === 0 ? 'Top Threat' : index === 1 ? '2nd Place' : '3rd Place'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                          Score:
                        </span>
                        <span className={`text-xs font-bold ${theme === 'dark' ? top3LabelDark[index] : top3LabelLight[index]}`}>
                          {totalScore}/100
                        </span>
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
                          (Rating {ratingScore} + Reviews {reviewScore})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Score bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className={`w-24 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-500'}`}
                          style={{ width: `${totalScore}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      ⚠ Watch Closely
                    </span>
                  </div>
                </div>
              )}

              {/* Horizontal 3-Part Layout */}
              <div className="flex flex-row min-h-[280px]">
                {/* LEFT SIDE - Details (40% width) */}
                <div className="w-[40%] p-4 border-r border-gray-200 dark:border-white/10 flex flex-col">
                  {/* Rank Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isTop3
                        ? theme === 'dark'
                          ? `bg-gradient-to-r from-yellow-500/30 to-orange-500/20 ${top3LabelDark[index]} border border-yellow-500/30`
                          : `bg-gradient-to-r from-yellow-100 to-orange-50 ${top3LabelLight[index]} border border-yellow-300`
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {isTop3 ? medals[index] : `#${index + 1}`}
                    </div>
                    {/* Score pill */}
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {totalScore}/100
                    </div>
                    {competitor.rating && (
                      <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${
                        isTop3
                          ? 'bg-yellow-500 text-black shadow-md'
                          : 'bg-yellow-500/80 text-black'
                      }`}>
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
            );
          })}
        </div>
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
