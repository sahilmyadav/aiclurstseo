import { useEffect, useState } from "react";
import { useGoogleBusiness } from './context/GoogleBusinessContext';

const Dashboard = () => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [monthlyChartData, setMonthlyChartData] = useState([]);

  // Get real data from GoogleBusinessContext
  const {
    businesses,
    selectedBusiness,
    reviews,
    loading,
    isConnected,
    reviewStats,
    selectBusiness
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
  const handleBusinessSelect = (business) => {
    selectBusiness(business);
    setShowBusinessDropdown(false);
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
    if (!reviewStats || reviewStats.total === 0) return 0;
    const avgRating = reviewStats.average || 0;
    const score = (avgRating / 5) * 100;
    return Math.round(score);
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <div className="min-h-screen w-full text-white flex">
      <div className={`flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full`}>
        <div className="h-screen overflow-hidden">
          <div className="pb-0">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">DASHBOARD</h1>
                {selectedBusiness && (
                  <p className="text-sm text-white/60">Showing data for: {selectedBusiness.title || selectedBusiness.locationName}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {businesses && businesses.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#1a1b2e]/90 border border-white/10 rounded-lg text-white hover:bg-[#1a1b2e] transition-colors"
                    >
                      <span className="text-sm">
                        {selectedBusiness ? (selectedBusiness.title || selectedBusiness.locationName) : 'Select Business'}
                      </span>
                      <span className="text-xs">▼</span>
                    </button>

                    {showBusinessDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#1a1b2e] border border-white/10 rounded-lg shadow-lg z-50">
                        {businesses.map((business, index) => (
                          <button
                            key={index}
                            onClick={() => handleBusinessSelect(business)}
                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            <div className="font-medium">{business.title || business.locationName}</div>
                            <div className="text-xs text-white/60 mt-1">
                              {business.primaryCategory?.displayName || business.storefrontAddress?.locality || 'Business'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-1 pt-3 sm:pt-6 h-[calc(100vh-120px)] overflow-hidden">
            <main className="flex-1 space-y-4 sm:space-y-6 pl-1 sm:pl-2 pr-1 sm:pr-4 overflow-y-auto max-h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                {[
                  { title: "AVERAGE RATING", value: reviewStats?.average ? `${reviewStats.average.toFixed(1)}` : '0.0' },
                  { title: "TOTAL REVIEWS", value: reviewStats?.total ?? '0' },
                  { title: "RECENT REVIEWS (30d)", value: reviewStats?.recentCount ?? '0' },
                  { title: "GOOGLE BUSINESS", value: isConnected ? 'Connected' : 'Not Connected' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg bg-[#1a1b2e]/90 border border-white/10 p-2 sm:p-3 h-16 `sm:h-20 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="text-xs sm:text-md uppercase tracking-wider text-white/60 font-medium">{stat.title}</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-lg sm:text-2xl font-bold text-white">{loading ? '...' : stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-2xl bg-[#121324]/90 border border-white/5 p-3 sm:p-6">
                  <div className="text-sm font-semibold mb-4">Monthly Reviews</div>
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
                                <div className="text-xs font-bold text-purple-300 mb-1">
                                  {d.reviews}
                                </div>
                                <div
                                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-500 hover:to-purple-300 shadow-lg shadow-purple-500/50"
                                  style={{ height: `${finalHeight * 1.7}px` }}
                                  title={`${d.month}: ${d.reviews} review${d.reviews !== 1 ? 's' : ''}`}
                                />
                              </div>
                            )}
                            {d.reviews === 0 && (
                              <div className="w-full h-1 bg-white/10 rounded self-end" />
                            )}
                          </div>
                          <div className="text-[10px] text-white/60 mt-2 font-medium">{d.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#121324]/90 border border-white/5 p-3 sm:p-6">
                  <div className="text-sm font-semibold mb-4">Rating Distribution</div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-700 to-indigo-600 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl sm:text-3xl font-extrabold">
                          {loading ? '...' : (reviewStats?.average ? reviewStats.average.toFixed(1) : 'N/A')}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/70">{loading ? '...' : `${reviewStats?.total ?? 0} Reviews`}</div>
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      {reviewStats?.ratings?.length > 0 ? (
                        [...(reviewStats.ratings || [])].sort((a, b) => b.rating - a.rating).map((item) => (
                          <div key={item.rating} className="flex items-center gap-2 sm:gap-3 py-1">
                            <span className="w-4 text-xs text-white/60">{item.rating}</span>
                            <div className="flex-1 h-2 sm:h-3 rounded bg-white/10 overflow-hidden">
                              <div className="h-2 sm:h-3 bg-purple-500" style={{ width: `${reviewStats.total > 0 ? (item.count / reviewStats.total) * 100 : 0}%` }} />
                            </div>
                            <span className="w-12 sm:w-14 text-xs text-white/60 text-right">{item.count}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-white/60 text-sm">{isConnected ? 'No rating distribution available' : 'Connect Google Business to see ratings'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <aside className="w-full lg:w-[35vw] shrink-0 sticky hidden lg:block">
              {isConnected && (
                <div className="rounded-lg bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60 font-medium mb-1">
                        Performance Score
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <div className="text-4xl font-bold text-white">
                          {loading ? '...' : performanceScore}
                        </div>
                        <div className="text-lg text-white/60">/100</div>
                      </div>
                      <div className="text-xs text-white/50 mt-1">
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

              <div className="text-xl sm:text-3xl font-bold mb-2">Recent Reviews</div>
              <div className="rounded-lg bg-[#171624]/50 border border-white/5 overflow-hidden">
                <div className="h-[calc(100vh-350px)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8b5cf6 #1a1b2e' }}>
                  {loading && <div className="p-4 text-white/60">Loading recent reviews...</div>}
                  {!loading && reviews && reviews.length === 0 && (
                    <div className="p-4 text-white/60 text-center">
                      {isConnected ? 'No reviews available yet' : 'Connect Google Business to see reviews'}
                    </div>
                  )}
                  {!loading && reviews && reviews.length > 0 && reviews.map((review, index) => (
                    <div key={index} className="p-2 sm:p-3 flex gap-2 sm:gap-3 border-b border-white/5 last:border-b-0">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
                        {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {review.reviewer?.displayName || 'Anonymous'}
                          </div>
                          <div className="text-xs text-white/60 flex-shrink-0">
                            {formatDate(review.createTime)}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/80 break-words mt-1">
                          {review.comment || 'No review text provided.'}
                        </p>
                        <div className="flex text-yellow-400 mt-1">
                          {Array.from({ length: getStarRating(review.starRating) }).map((_, i) => (
                            <span key={i} className="text-[12px]">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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