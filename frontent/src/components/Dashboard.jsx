import { useEffect, useState } from "react";
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const [monthlyChartData, setMonthlyChartData] = useState([]);

  // Get real data from GoogleBusinessContext
  const {
    businesses,
    selectedBusiness,
    selectedBusinesses, // For multiple selections
    reviews,
    loading,
    isConnected,
    reviewStats,
    selectBusiness,
    selectMultipleBusinesses // For multiple selections
  } = useGoogleBusiness();

  // Process monthly chart data from reviews
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthCounts = new Array(12).fill(0);
      
      reviews.forEach(review => {
        const reviewDate = new Date(review.createTime);
        if (reviewDate.getFullYear() === currentYear) {
          const month = reviewDate.getMonth();
          monthCounts[month]++;
        }
      });
      
      setMonthlyChartData(monthNames.map((m, i) => ({ month: m, reviews: monthCounts[i] })));
    } else {
      // Default empty data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setMonthlyChartData(monthNames.map(m => ({ month: m, reviews: 0 })));
    }
  }, [reviews]);


  // Handle business selection
  const handleBusinessSelect = (businessOrBusinesses) => {
    if (Array.isArray(businessOrBusinesses)) {
      // Multiple selections
      selectMultipleBusinesses(businessOrBusinesses);
    } else {
      // Single selection
      selectBusiness(businessOrBusinesses);
    }
  };

  // Convert Google star rating to number for display
  const getStarRating = (starRating) => {
    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    return ratingMap[starRating] || 0;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate Performance Score (0-100) based on average rating
  const calculatePerformanceScore = () => {
    if (!reviewStats || !reviewStats.totalReviews) return 0;
    const avgRating = reviewStats.averageRating || 0;
    const score = (avgRating / 5) * 100;
    return Math.round(score);
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <div className={`min-h-screen w-full font-sans ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)] text-black bg-gray-50'
    }`} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
      <div className={`flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full`}>
        <div className="h-screen overflow-hidden">
          <div className="pb-0">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                {/* <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-purple-900'
                }`}>DASHBOARD</h1> */}
                {selectedBusiness && (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-white/80' : 'text-gray-800'
                  } font-medium`}>
                    Showing data for: {selectedBusiness.title || selectedBusiness.locationName}
                  </p>
                )}
                {selectedBusinesses && selectedBusinesses.length > 1 && (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-white/80' : 'text-gray-800'
                  } font-medium`}>
                    {selectedBusinesses.length} business profiles selected
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <BusinessProfileDropdown 
                  onSelect={handleBusinessSelect}
                  className="w-64"
                  showLabel={false}
                  multiple={selectedBusinesses && selectedBusinesses.length > 1}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-1 pt-3 sm:pt-6 h-[calc(100vh-120px)] overflow-hidden">
            <main className="flex-1 space-y-4 sm:space-y-6 pl-1 sm:pl-2 pr-1 sm:pr-4 overflow-y-auto max-h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                {[
                  { title: "AVERAGE RATING", value: reviewStats?.averageRating ? `${reviewStats.averageRating.toFixed(1)}` : '0.0' },
                  { title: "TOTAL REVIEWS", value: reviewStats?.totalReviews?.toString() ?? '0' },
                  { title: "RECENT REVIEWS (30d)", value: reviewStats?.recentReviews?.length?.toString() ?? '0' },
                  { title: "GOOGLE BUSINESS", value: isConnected ? 'Connected' : 'Not Connected' },
                ].map((stat, i) => (
                  <div key={i} className={`rounded-lg border p-2 sm:p-3 h-16 sm:h-20 flex flex-col justify-between min-w-0 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${
                    theme === 'dark' 
                      ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' 
                      : 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-purple-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className={`text-xs sm:text-sm uppercase tracking-wider font-semibold ${
                        theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {stat.title}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className={`text-xl sm:text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {loading ? '...' : stat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className={`rounded-2xl p-3 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] ${
                  theme === 'dark' 
                    ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' 
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-50'
                }`}>
                  <div className={`text-base font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Monthly Reviews
                  </div>
                  <div className="w-full h-52 flex items-end justify-between gap-1 px-2">
                    {monthlyChartData.map((d, i) => {
                      const maxReviews = Math.max(...monthlyChartData.map(m => m.reviews), 1);
                      const heightPercentage = maxReviews > 0 ? (d.reviews / maxReviews) * 100 : 0;
                      const minVisibleHeight = d.reviews > 0 ? 10 : 0; // Minimum 10% height for visibility
                      const finalHeight = d.reviews > 0 ? Math.max(heightPercentage, minVisibleHeight) : 0;
                      
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 min-w-0" style={{ height: '100%' }}>
                          <div className="w-full flex flex-col items-center justify-end" style={{ height: '180px' }}>
                            {d.reviews > 0 && (
                              <div className="w-full flex flex-col items-center">
                                <div className={`text-xs font-semibold ${
                                  theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                                } mb-1`}>
                                  {d.reviews}
                                </div>
                                <div
                                  className={`w-full rounded-t-lg transition-all duration-300 ${
                                    theme === 'dark' 
                                      ? 'bg-gradient-to-t from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 shadow-lg shadow-purple-500/50'
                                      : 'bg-gradient-to-t from-purple-500 to-purple-300 hover:from-purple-400 hover:to-purple-200 shadow-md shadow-purple-500/30'
                                  }`}
                                  style={{ height: `${finalHeight * 1.7}px` }}
                                  title={`${d.month}: ${d.reviews} review${d.reviews !== 1 ? 's' : ''}`}
                                />
                              </div>
                            )}
                            {d.reviews === 0 && (
                              <div className={`w-full h-1 ${
                                theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                              } rounded self-end`} />
                            )}
                          </div>
                          <div className={`text-[11px] mt-2 font-medium ${
                            theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            {d.month}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`rounded-2xl p-3 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] ${
                  theme === 'dark' 
                    ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' 
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-50'
                }`}>
                  <div className={`text-sm font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-purple-900'
                  }`}>
                    Rating Distribution
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-700 to-indigo-600 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl sm:text-3xl font-extrabold">
                          {loading ? '...' : (reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : 'N/A')}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/70">{loading ? '...' : `${reviewStats?.totalReviews ?? 0} Reviews`}</div>
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      {reviewStats?.ratings?.length > 0 ? (
                        [...(reviewStats.ratings || [])].sort((a, b) => b.rating - a.rating).map((item) => (
                          <div key={item.rating} className="flex items-center gap-2 sm:gap-3 py-1">
                            <div className={`text-xs ${
                              theme === 'dark' ? 'text-white/60' : 'text-purple-700'
                            }`}>
                              {item.rating}
                            </div>
                            <div className={`flex-1 h-2 sm:h-3 rounded overflow-hidden ${
                              theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                            }`}>
                              <div className="h-2 sm:h-3 bg-purple-500" style={{ width: `${reviewStats.totalReviews > 0 ? (item.count / reviewStats.totalReviews) * 100 : 0}%` }} />
                            </div>
                            <span className={`w-12 sm:w-14 text-xs text-right ${
                              theme === 'dark' ? 'text-white/60' : 'text-purple-700'
                            }`}>
                              {item.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          {isConnected ? 'No rating distribution available' : 'Connect Google Business to see ratings'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <aside className="w-full lg:w-[35vw] shrink-0 sticky hidden lg:block">
              {isConnected && (
                <div className={`rounded-lg bg-gradient-to-br border p-4 mb-3 transition-all duration-300 transform hover:scale-[1.01] ${
                  theme === 'dark'
                    ? 'from-gray-800 to-gray-900 border-gray-700 hover:from-gray-800 hover:to-gray-900 hover:shadow-lg'
                    : 'from-purple-50 to-indigo-50 border-purple-100 hover:shadow-md hover:border-purple-200 hover:from-purple-50 hover:to-indigo-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs uppercase tracking-wider font-medium mb-1 ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                        Performance Score
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <div className={`text-4xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                          {loading ? '...' : performanceScore}
                        </div>
                        <div className={`text-lg ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>/100</div>
                      </div>
                      <div className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                        {reviewStats?.average ? `${reviewStats.average.toFixed(1)}★ average rating` : 'No ratings yet'}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        performanceScore >= 80 ? 'bg-green-500/20 border-2 border-green-500' :
                        performanceScore >= 60 ? 'bg-yellow-500/20 border-2 border-yellow-500' :
                        performanceScore >= 40 ? 'bg-orange-500/20 border-2 border-orange-500' :
                        'bg-red-500/20 border-2 border-red-500'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          performanceScore >= 80 ? 'text-green-400' :
                          performanceScore >= 60 ? 'text-yellow-400' :
                          performanceScore >= 40 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {performanceScore >= 80 ? '🔥' :
                           performanceScore >= 60 ? '👍' :
                           performanceScore >= 40 ? '📈' :
                           '📉'}
                        </span>
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        performanceScore >= 80 ? 'text-green-400' :
                        performanceScore >= 60 ? 'text-yellow-400' :
                        performanceScore >= 40 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {performanceScore >= 80 ? 'Excellent' :
                         performanceScore >= 60 ? 'Good' :
                         performanceScore >= 40 ? 'Fair' :
                         'Needs Work'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div className={`text-xl sm:text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Recent Reviews
                </div>
                <div className={`rounded-lg border overflow-hidden transition-all duration-300 transform hover:scale-[1.005] ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-purple-50'
                }`}>
                  <div className="h-[calc(100vh-350px)] overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: theme === 'dark' ? '#8b5cf6 #1a1b2e' : '#c4b5fd #f5f3ff'
                  }}>
                    {loading && (
                      <div className={`p-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                        Loading recent reviews...
                      </div>
                    )}
                    {!loading && reviews && reviews.length === 0 && (
                      <div className={`p-4 text-center ${
                        theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        {isConnected ? 'No reviews available yet' : 'Connect Google Business to see reviews'}
                      </div>
                    )}
                    {!loading && reviews && reviews.length > 0 && reviews.map((review, index) => (
                      <div key={index} className={`p-3 sm:p-4 flex gap-3 border-b ${
                        theme === 'dark' ? 'border-white/5' : 'border-gray-100'
                      } last:border-b-0 hover:${
                        theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-purple-50/30'
                      } transition-all duration-200 transform hover:translate-x-1`}>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-base ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-white' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className={`font-semibold text-sm sm:text-base truncate ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>
                              {review.reviewer?.displayName || 'Anonymous'}
                            </div>
                            <div className={`text-xs flex-shrink-0 ${
                              theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                            }`}>
                              {formatDate(review.createTime)}
                            </div>
                          </div>
                          <div className="flex text-yellow-400 mt-1">
                            {Array.from({ length: getStarRating(review.starRating) }).map((_, i) => (
                              <span key={i} className="text-xs sm:text-sm">★</span>
                            ))}
                          </div>
                          <p className={`text-sm break-words mt-1 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>
                            {review.comment || 'No review text provided.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;