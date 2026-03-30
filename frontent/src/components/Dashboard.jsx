import { useEffect, useState } from "react";
import { useGoogleBusiness } from './context/GoogleBusinessContext';
import BusinessProfileDropdown from './common/BusinessProfileDropdown';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  
  // Apply font family and styles to the entire dashboard
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      body {
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .gradient-bg {
        background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-[radial-gradient(at_40%_20%,hsl(250,91%,97%)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(340,82%,97%)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(160,84%,97%)_0px,transparent_50%)]'
    }`}>
      <div className={`flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full`}>
        <div className="h-screen overflow-hidden">
          <div className="pb-0">
            <div className="flex items-center space-x-4">
              <BusinessProfileDropdown 
                onSelect={handleBusinessSelect}
                className="w-64"
                showLabel={false}
                multiple={selectedBusinesses && selectedBusinesses.length > 1}
              />
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
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-1 pt-3 sm:pt-6 h-[calc(100vh-120px)] overflow-hidden">
            <main className="flex-1 space-y-4 sm:space-y-6 pl-1 sm:pl-2 pr-1 sm:pr-4 overflow-y-auto max-h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                {[ 
                  { 
                    title: "AVERAGE RATING", 
                    value: reviewStats?.averageRating ? `${reviewStats.averageRating.toFixed(1)}` : '0.0',
                    icon: (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                      </svg>
                    ),
                    color: 'purple',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-100',
                    textColor: 'text-purple-700',
                    hoverBg: 'hover:bg-purple-50/80',
                    iconColor: 'text-yellow-500'
                  },
                  { 
                    title: "TOTAL REVIEWS", 
                    value: reviewStats?.totalReviews?.toString() ?? '0',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    color: 'blue',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-100',
                    textColor: 'text-blue-700',
                    hoverBg: 'hover:bg-blue-50/80',
                    iconColor: 'text-blue-500'
                  },
                  { 
                    title: "RECENT REVIEWS (30d)", 
                    value: reviewStats?.recentReviews?.length?.toString() ?? '0',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: 'green',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-100',
                    textColor: 'text-green-700',
                    hoverBg: 'hover:bg-green-50/80',
                    iconColor: 'text-green-500'
                  },
                  { 
                    title: "GOOGLE BUSINESS", 
                    value: isConnected ? 'Connected' : 'Not Connected',
                    icon: (
                      <svg className="w-5 h-5" fill={isConnected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isConnected ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                    ),
                    color: isConnected ? 'green' : 'red',
                    bgColor: isConnected ? 'bg-green-50' : 'bg-red-50',
                    borderColor: isConnected ? 'border-green-100' : 'border-red-100',
                    textColor: isConnected ? 'text-green-700' : 'text-red-700',
                    hoverBg: isConnected ? 'hover:bg-green-50/80' : 'hover:bg-red-50/80',
                    iconColor: isConnected ? 'text-green-500' : 'text-red-500'
                  },
                ].map((stat, i) => (
                  <div key={i} className={`rounded-xl border transition-all duration-300 transform hover:scale-[1.01] ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                      : `${stat.bgColor} ${stat.borderColor} ${stat.hoverBg} hover:shadow-sm`
                  }`}>
                    <div className="p-4 flex flex-col justify-between min-h-[120px]">
                      <div className="flex items-start justify-between">
                        <div className={`text-xs font-medium tracking-wide ${
                          theme === 'dark' ? 'text-white/70' : stat.textColor
                        }`}>
                          {stat.title}
                        </div>
                        <span className={`${stat.iconColor || (theme === 'dark' ? 'text-white/90' : stat.textColor)}`}>
                          {stat.icon}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {loading ? '...' : stat.value}
                        </div>
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
                    <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full ${theme === 'dark' 
                      ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 shadow-lg shadow-blue-500/20' 
                      : 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md shadow-blue-200'}
                      flex items-center justify-center`}>
                      <div className="text-center">
                        <div className={`text-xl sm:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-blue-800'}`}>
                          {loading ? '...' : (reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : 'N/A')}
                        </div>
                        <div className={`text-[10px] sm:text-[11px] ${theme === 'dark' ? 'text-blue-200/90' : 'text-blue-700/90'}`}>
                          {loading ? '...' : `${reviewStats?.totalReviews ?? 0} Reviews`}
                        </div>
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
                  <div className="h-[calc(100vh-350px)] overflow-hidden relative">
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
                    {!loading && reviews && reviews.length > 0 && (() => {
                      // Duplicate reviews for seamless loop
                      const doubled = [...reviews, ...reviews, ...reviews];
                      const animDuration = reviews.length * 4;
                      return (
                        <>
                          <style>{`
                            @keyframes scrollReviews {
                              0% { transform: translateY(0); }
                              100% { transform: translateY(-33.333%); }
                            }
                            .reviews-scroll {
                              animation: scrollReviews ${animDuration}s linear infinite;
                              will-change: transform;
                            }
                            .reviews-scroll:hover {
                              animation-play-state: paused;
                            }
                            @keyframes reviewFadeIn {
                              0% { opacity: 0; transform: translateX(-8px); }
                              100% { opacity: 1; transform: translateX(0); }
                            }
                            .review-item {
                              animation: reviewFadeIn 0.5s ease forwards;
                            }
                          `}</style>
                          <div className="reviews-scroll">
                            {doubled.map((review, index) => (
                              <div key={index} className={`review-item p-3 sm:p-4 flex gap-3 border-b ${
                                theme === 'dark' ? 'border-white/5' : 'border-gray-100'
                              }`}>
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-base ${
                                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {(review.reviewer?.displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className={`font-semibold text-sm truncate ${
                                      theme === 'dark' ? 'text-white' : 'text-black'
                                    }`}>
                                      {review.reviewer?.displayName || 'Anonymous'}
                                    </div>
                                    <div className={`text-xs flex-shrink-0 ${
                                      theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                                    }`}>
                                      {formatDate(review.createTime)}
                                    </div>
                                  </div>
                                  <div className="flex text-yellow-400 mt-0.5">
                                    {Array.from({ length: getStarRating(review.starRating) }).map((_, i) => (
                                      <span key={i} className="text-xs">★</span>
                                    ))}
                                  </div>
                                  <p className={`text-xs mt-0.5 line-clamp-2 ${
                                    theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                  }`}>
                                    {review.comment || 'No review text provided.'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
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