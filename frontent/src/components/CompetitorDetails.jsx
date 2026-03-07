import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  TrendingUp
} from 'lucide-react';

const CompetitorDetails = ({ accountId, locationId, businessName, businessCategory, businessLat, businessLng }) => {
  const { theme } = useTheme();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [searchType, setSearchType] = useState('business');

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

        {/* Competitors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {competitors.map((competitor, index) => (
            <div
              key={competitor.placeId || index}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-[#1a1b2e]/90 border border-white/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Competitor Image */}
              <div className="relative h-36 sm:h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                {competitor.photos && competitor.photos.length > 0 ? (
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${competitor.photos[0].photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`}
                    alt={competitor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=${encodeURIComponent(competitor.name)}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-70" />
                      <p className="text-sm font-medium">No Image</p>
                    </div>
                  </div>
                )}

                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </div>

                {/* Rating Badge */}
                {competitor.rating && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {competitor.rating}
                  </div>
                )}
              </div>

              {/* Competitor Details */}
              <div className="p-4 sm:p-6">
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
                  <div className="flex items-center justify-between mb-3">
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

                {/* Types/Categories */}
                {competitor.types && competitor.types.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {competitor.types.slice(0, 3).map((type, typeIndex) => (
                        <span
                          key={typeIndex}
                          className={`text-xs px-2 py-1 rounded-full ${
                            theme === 'dark'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Level */}
                {competitor.priceLevel && (
                  <div className="mb-3">
                    <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                      Price Level: {'$'.repeat(competitor.priceLevel)}
                    </span>
                  </div>
                )}

                {/* Distance (if available) */}
                {competitor.location && (
                  <div className={`flex items-center text-xs mb-3 ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                    <MapPin className="w-3 h-3 mr-1" />
                    Coordinates: {competitor.location.lat.toFixed(4)}, {competitor.location.lng.toFixed(4)}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200 dark:border-white/10">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competitor.name + ' ' + competitor.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Directions
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(competitor.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                      theme === 'dark'
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Website
                  </a>
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
    </div>
  );
};

export default CompetitorDetails;
