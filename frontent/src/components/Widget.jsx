import { Copy, Filter, RefreshCw, Star } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { useSidebar } from "./context/SidebarContext";
import { useTheme } from "../context/ThemeContext";

// Component to display a single review
const ReviewCard = ({ review }) => {
  const { theme } = useTheme();
  const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
  const rating = ratingMap[review.starRating] || 5;
  
  return (
    <div className={`p-4 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}.0</span>
      </div>
      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {review.comment || "No comment provided"}
      </p>
      <div className={`flex justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <span>{review.reviewer.displayName}</span>
        <span>{new Date(review.createTime).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// Carousel component for reviews
const ReviewCarousel = ({ reviews }) => {
  const { theme } = useTheme();
  const reviewsToShow = 3; // Number of reviews to show at once

  if (!reviews || reviews.length === 0) {
    return (
      <div className={`border rounded-lg p-10 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
        <Star className={`w-10 h-10 mx-auto mb-4 text-yellow-400`} />
        <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900 font-medium'}`}>No reviews available yet</p>
      </div>
    );
  }

  // For a smooth infinite scroll, we need many duplicates
  const duplicatedReviews = [];
  for (let i = 0; i < 10; i++) {
    duplicatedReviews.push(...reviews);
  }

  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${(reviews.length * 100) / reviewsToShow}%); }
        }
        .carousel-track {
          display: flex;
          animation: scroll ${reviews.length * 5}s linear infinite;
          width: max-content;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="carousel-track">
        {duplicatedReviews.map((review, index) => (
          <div key={index} className="min-w-[33.33%] px-2">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
      
      {/* Removed pagination dots for continuous scrolling */}
    </div>
  );
};

// Component to display all reviews
const AllReviewsWidget = ({ reviews, filters, businessName }) => {
  const { theme } = useTheme();
  // Apply filters
  const filteredReviews = (reviews || []).filter(review => {
    if (!review) return false;
    
    if (filters.showOnlyHighRatings) {
      const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
      const rating = ratingMap[review.starRating] || 5;
      return rating >= 4;
    }
    return true;
  });

  if (!reviews || reviews.length === 0) {
    return (
      <div className={`border rounded-lg p-10 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
        <Star className={`w-10 h-10 mx-auto mb-4 text-yellow-400`} />
        <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900 font-medium'}`}>No reviews available yet</p>
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <div className={`border rounded-lg p-10 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
        <Star className={`w-10 h-10 mx-auto mb-4 text-yellow-400`} />
        <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No reviews match your filters</p>
        <button 
          onClick={() => window.location.reload()}
          className={`px-6 py-2 rounded-lg transition flex items-center gap-2 mx-auto ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#1e1e3a] hover:bg-blue-700'}`}
        >
          <RefreshCw className="w-4 h-4" /> Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        {businessName && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Business:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{businessName}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
          </h3>
          {filteredReviews.length > 0 && (
            <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-2 pr-3">
        {filteredReviews.map((review, index) => (
          <ReviewCard 
            key={review.name || index} 
            review={review} 
          />
        ))}
      </div>
    </div>
  );
};

export default function WebsiteWidgets() {
  const { isCollapsed } = useSidebar();
  const { theme } = useTheme();
  const { 
    selectedBusiness, 
    reviews = [], 
    loading, 
    businesses = []
  } = useGoogleBusiness();
  
  const [activeTab, setActiveTab] = useState("Carousel");
  const [toggles, setToggles] = useState({
    removePoweredBy: false,
    hideScore: false,
    hideReviewData: false,
    showOnlyHighRatings: false,
    feedback: false,
  });

  // State for copied status
  const [copied, setCopied] = useState(false);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate widget code
  const generateWidgetCode = () => {
    const darkModeClass = theme === 'dark' ? 'dark' : '';
    const hideScore = toggles.hideScore ? 'hide-score' : '';
    const hideReviewData = toggles.hideReviewData ? 'hide-date' : '';
    const showOnlyHighRatings = toggles.showOnlyHighRatings ? 'high-ratings-only' : '';
    const removePoweredBy = toggles.removePoweredBy ? 'no-powered-by' : '';
    
    return `<!-- Business Reviews Widget -->
<div class="reviews-widget ${darkModeClass} ${hideScore} ${hideReviewData} ${showOnlyHighRatings} ${removePoweredBy}" 
     data-business-id="${selectedBusiness ? selectedBusiness.name.split("/")[1] : 'YOUR_BUSINESS_ID'}">
  <div class="widget-header">
    <h3>Customer Reviews</h3>
  </div>
  <div class="widget-content">
    <!-- Reviews will be loaded dynamically -->
  </div>
  ${toggles.removePoweredBy ? '' : '<div class="widget-footer">Powered by YourBusinessReviews</div>'}
</div>

<!-- Include the widget script -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://clurst.io/reviews-widget.js';
  script.onload = function() {
    initReviewsWidget({
      businessId: '${selectedBusiness ? selectedBusiness.name.split("/")[1] : 'YOUR_BUSINESS_ID'}',
      darkMode: ${theme === 'dark'},
      hideScore: ${toggles.hideScore},
      hideReviewData: ${toggles.hideReviewData},
      showOnlyHighRatings: ${toggles.showOnlyHighRatings}
    });
  };
  document.head.appendChild(script);
})();
</script>

<style>
.reviews-widget { 
  max-width: 800px; 
  margin: 0 auto; 
  font-family: Arial, sans-serif;
  ${theme === 'dark' ? 'color: #fff; background-color: #1a1a1a;' : 'color: #333; background-color: #fff;'}
}
.review-card { 
  border: 1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 8px; 
  padding: 16px; 
  margin-bottom: 16px; 
}
.stars { color: #ffc107; font-size: 18px; }
.review-text { margin: 8px 0; }
.reviewer { font-weight: bold; }
.widget-header h3 { 
  margin: 0 0 16px 0; 
  ${theme === 'dark' ? 'color: #fff;' : 'color: #333;'}
}
${toggles.removePoweredBy ? '' : '.widget-footer { text-align: center; font-size: 12px; color: #777; margin-top: 16px; }'}
</style>`;
  };

  // Copy widget code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateWidgetCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Carousel component for reviews
  const CarouselComponent = () => {
    if (!reviews || reviews.length === 0) {
      return (
        <div className="border border-purple-800 rounded-lg p-10 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <p className="mb-4">No reviews available for {selectedBusiness?.locationName || 'this business'}</p>
        </div>
      );
    }

    // For a smooth infinite scroll, we need many duplicates
    const duplicatedReviews = [];
    for (let i = 0; i < 10; i++) {
      duplicatedReviews.push(...reviews);
    }

    return (
      <div className="relative overflow-hidden">
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-${(reviews.length * 100) / 3}%); }
          }
          .carousel-track {
            display: flex;
            animation: scroll ${reviews.length * 35}s linear infinite;
            width: max-content;
          }
          .carousel-track:hover {
            animation-play-state: paused;
          }
          .carousel-card {
            min-width: 350px;
            width: 350px;
            margin: 0 5px;
          }
          @media (max-width: 768px) {
            .carousel-card {
              min-width: 300px;
              width: 300px;
            }
          }
          @media (max-width: 480px) {
            .carousel-card {
              min-width: 250px;
              width: 250px;
            }
          }
        `}</style>
        
        <div className="carousel-track">
          {duplicatedReviews.map((review, index) => (
            <div key={index} className="carousel-card">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // New improved Carousel component with better design
  const ImprovedCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (!reviews || reviews.length === 0) {
      return (
        <div className="border border-purple-800 rounded-lg p-10 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <p className="mb-4">No reviews available for {selectedBusiness?.locationName || 'this business'}</p>
        </div>
      );
    }

    // For a smooth infinite scroll, we need many duplicates
    const duplicatedReviews = [];
    for (let i = 0; i < 10; i++) {
      duplicatedReviews.push(...reviews);
    }

    // Auto-rotate reviews
    useEffect(() => {
      if (reviews.length <= 3) return;
      
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 4000); // Change review every 4 seconds

      return () => clearInterval(interval);
    }, [reviews.length]);

    return (
      <div className={`relative overflow-hidden rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-${(reviews.length * 100) / 3}%); }
          }
          .improved-carousel-track {
            display: flex;
            animation: scroll ${reviews.length * 50}s linear infinite;
            width: max-content;
          }
          .improved-carousel-track:hover {
            animation-play-state: paused;
          }
          .improved-carousel-card {
            min-width: 350px;
            width: 350px;
            margin: 0 10px;
            background: ${theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
            backdrop-filter: blur(10px);
            border: 1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)'};
            transition: all 0.3s ease;
          }
          .improved-carousel-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
            border-color: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.6)' : 'rgba(59, 130, 246, 0.6)'};
          }
          .improved-star {
            color: #fbbf24;
          }
          .improved-reviewer {
            color: ${theme === 'dark' ? '#93c5fd' : '#3b82f6'};
            font-weight: 500;
          }
          @media (max-width: 768px) {
            .improved-carousel-card {
              min-width: 300px;
              width: 300px;
            }
          }
          @media (max-width: 480px) {
            .improved-carousel-card {
              min-width: 250px;
              width: 250px;
            }
          }
        `}</style>
        
        <div className="improved-carousel-track">
          {duplicatedReviews.map((review, index) => {
            // Define ratingMap inside the map function to ensure it's in scope
            const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
            const rating = ratingMap[review.starRating] || 5;
            
            return (
              <div key={index} className="improved-carousel-card">
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < rating ? 'improved-star fill-current' : 'text-gray-600'}`} 
                    />
                  ))}
                  <span className={`ml-2 text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {rating}.0
                  </span>
                </div>
                <p className={`mb-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  {review.comment || "No comment provided"}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="improved-reviewer font-medium">
                    {review.reviewer?.displayName || "Anonymous"}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {review.createTime ? new Date(review.createTime).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {reviews.slice(0, Math.min(reviews.length, 10)).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === (currentIndex % reviews.length) 
                  ? `${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} w-6`
                  : `${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gradient-to-br from-[#1b1730] to-[#120f25] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full mx-auto max-w-[2000px] px-0 sm:px-2 md:px-4 lg:px-6">
        <div className="p-3 sm:p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-6">Website Widgets</h2>

          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-2 px-2">
            {["Carousel", "Feed", "Video", ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === tab 
                    ? `${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600 text-white'}`
                    : `${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'} transition-colors`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Carousel" ? (
            <div>
              {loading ? (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : !selectedBusiness ? (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No business selected</p>
                </div>
              ) : reviews && reviews.length > 0 ? (
                // Show the improved carousel in Carousel tab
                <ImprovedCarousel />
              ) : (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No reviews available for {selectedBusiness?.locationName || 'this business'}</p>
                </div>
              )}
            </div>
          ) : activeTab === "Video" ? (
            <div>
              {loading ? (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : !selectedBusiness ? (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No business selected</p>
                </div>
) : reviews && reviews.length > 0 ? (
                <div className={`relative h-[600px] overflow-hidden rounded-xl p-1 ${theme === 'dark' ? 'bg-gradient-to-br from-[#1e1e3a] to-[#2a2a4a]' : 'bg-white'}`}>
                  <style>{`
                    @keyframes scroll {
                      0% { transform: translateY(0); }
                      100% { transform: translateY(calc(-100% + 600px)); }
                    }
                    .video-track {
                      display: flex;
                      flex-direction: column;
                      gap: 1rem;
                      animation: scroll ${reviews.length * 20}s linear infinite;
                      padding: 1rem;
                    }
                    .video-track:hover {
                      animation-play-state: paused;
                    }
                    .video-review {
                      border-radius: 12px;
                      padding: 1.5rem;
                      transition: all 0.3s ease;
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
                      backdrop-filter: blur(10px);
                      ${theme === 'dark' ? '' : 'color: #333;'}
                    }
                    .video-review:hover {
                      transform: scale(1.02);
                      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                      border-color: ${theme === 'dark' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
                    }
                    .video-review-header {
                      display: flex;
                      align-items: center;
                      margin-bottom: 1rem;
                    }
                    .video-review-avatar {
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #8b5cf6, #ec4899);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      margin-right: 12px;
                      font-weight: bold;
                      color: white;
                    }
                    .video-review-rating {
                      display: flex;
                      margin-left: auto;
                    }
                    .video-review-content {
                      padding: 0.5rem 0;
                      line-height: 1.6;
                      color: ${theme === 'dark' ? '#e2e8f0' : '#333'};
                    }
                    .video-review-date {
                      font-size: 0.75rem;
                      color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
                      text-align: right;
                      margin-top: 0.5rem;
                    }
                  `}</style>
                  
                  <div className="video-track">
                    {[...reviews, ...reviews].map((review, index) => {
                      const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
                      const rating = ratingMap[review.starRating] || 5;
                      const initials = review.reviewer?.displayName
                        ? review.reviewer.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                        : '??';
                      
                      return (
                        <div key={index} className="video-review">
                          <div className="video-review-header">
                            <div className="video-review-avatar">
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium">{review.reviewer?.displayName || 'Anonymous'}</div>
                              <div className="video-review-rating">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="video-review-content">
                            {review.comment || "No comment provided"}
                          </div>
                          <div className="video-review-date">
                            {review.createTime ? new Date(review.createTime).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-10 text-center`}>
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No reviews available for {selectedBusiness?.locationName || 'this business'}</p>
                </div>
              )}
            </div>
          ) : activeTab === "Feed" ? (
            <div className="w-full h-[600px] overflow-y-auto p-4">
              <style>{`
                .feed-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                  gap: 1.5rem;
                  padding: 1rem;
                }
                .feed-card {
                  border-radius: 12px;
                  overflow: hidden;
                  transition: all 0.3s ease;
                  border: 1px solid rgba(139, 92, 246, 0.2);
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  background: ${theme === 'dark' ? 'rgba(30, 30, 58, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
                }
                .feed-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                  border-color: #8b5cf6;
                }
                .card-header {
                  padding: 1.25rem;
                  background: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'};
                  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                }
                .avatar {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #8b5cf6, #4f46e5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: 600;
                  flex-shrink: 0;
                }
                .user-info h4 {
                  font-weight: 600;
                  margin: 0;
                  font-size: 0.95rem;
                }
                .user-info p {
                  color: ${theme === 'dark' ? '#a78bfa' : '#6366f1'};
                  font-size: 0.8rem;
                  margin: 0.1rem 0 0;
                }
                .card-body {
                  padding: 1.25rem;
                }
                .review-text {
                  color: ${theme === 'dark' ? '#e2e8f0' : '#333'};
                  line-height: 1.6;
                  margin-bottom: 1rem;
                  font-size: 0.95rem;
                }
                .rating {
                  display: flex;
                  align-items: center;
                  margin-bottom: 0.75rem;
                }
                .rating-stars {
                  display: flex;
                  margin-right: 0.5rem;
                }
                .rating-value {
                  font-size: 0.9rem;
                  font-weight: 600;
                  color: ${theme === 'dark' ? '#fbbf24' : '#d97706'};
                }
                .card-footer {
                  padding: 0.75rem 1.25rem;
                  border-top: 1px solid rgba(139, 92, 246, 0.1);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 0.8rem;
                  color: ${theme === 'dark' ? '#94a3b8' : '#64748b'};
                }
                .review-date {
                  display: flex;
                  align-items: center;
                  gap: 0.25rem;
                }
                .review-actions {
                  display: flex;
                  gap: 1rem;
                }
                .action-btn {
                  display: flex;
                  align-items: center;
                  gap: 0.25rem;
                  color: ${theme === 'dark' ? '#94a3b8' : '#64748b'};
                  transition: color 0.2s;
                  background: none;
                  border: none;
                  cursor: pointer;
                  font-size: 0.8rem;
                }
                .action-btn:hover {
                  color: ${theme === 'dark' ? '#8b5cf6' : '#4f46e5'};
                }
                .action-btn svg {
                  width: 16px;
                  height: 16px;
                }
              `}</style>
              
              {reviews && reviews.length > 0 ? (
                <div className="feed-grid">
                  {reviews.map((review, index) => {
                    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
                    const rating = ratingMap[review.starRating] || 5;
                    const initials = review.reviewer?.displayName
                      ? review.reviewer.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : '??';
                    const reviewDate = review.createTime ? new Date(review.createTime) : new Date();
                    const formattedDate = reviewDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    
                    return (
                      <div key={index} className="feed-card">
                        <div className="card-header">
                          <div className="avatar">
                            {initials}
                          </div>
                          <div className="user-info">
                            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.reviewer?.displayName || 'Anonymous User'}</h4>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Verified Customer</p>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="rating">
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                            <span className={`rating-value ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rating}.0</span>
                          </div>
                          <p className={`review-text ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {review.comment || 'No review text provided.'}
                          </p>
                        </div>
                        <div className="card-footer">
                          <div className={`review-date ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {formattedDate}
                          </div>
                          {/* <div className="review-actions">
                            <button className="action-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                              Reply
                            </button>
                            <button className="action-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                              </svg>
                              Like
                            </button>
                          </div> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Star className="w-16 h-16 text-yellow-400 mb-4" />
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Reviews Yet</h3>
                  <p className={`text-center max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Be the first to leave a review for {selectedBusiness?.locationName || 'this business'}!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={`border rounded-lg p-10 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <p className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Review Are Currently Available</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
            <div className={`rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4 ${theme === 'dark' ? 'bg-[#1e1e3a]' : 'bg-white'}`}>
              <button className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-black/40 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <Filter className="w-4 h-4" /> FILTER
              </button>

              {[
                { key: "removePoweredBy", label: "Remove Powered By" },
                { key: "darkMode", label: "Dark Mode" },
                { key: "hideScore", label: "Hide Score" },
                { key: "hideReviewData", label: "Hide Review Data" },
                { key: "showOnlyHighRatings", label: "Show Only 4–5 Star Rating" },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                >
                  {item.label}
                  <input
                    type="checkbox"
                    checked={toggles[item.key]}
                    onChange={() => handleToggle(item.key)}
                    className="toggle-checkbox"
                  />
                </label>
              ))}
            </div>

            <div className={`rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4 ${theme === 'dark' ? 'bg-[#1e1e3a]' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Integrations</span>
                <label className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Feedback
                  <input
                    type="checkbox"
                    checked={toggles.feedback}
                    onChange={() => handleToggle("feedback")}
                    className="toggle-checkbox"
                  />
                </label>
              </div>

              <div>
                <p className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>HTML Code</p>
                <div className={`flex items-center justify-between px-3 py-2 rounded-md text-[10px] xs:text-xs font-mono overflow-hidden ${theme === 'dark' ? 'bg-black/30 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
                  <span className="truncate max-w-[180px] xs:max-w-xs">&lt;div class="reviews-widget"&gt;...&lt;/div&gt;</span>
                  <button onClick={copyToClipboard}>
                    <Copy className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>}
              </div>

              <p className={`text-[11px] xs:text-xs border rounded-md p-2 sm:p-3 ${theme === 'dark' ? 'text-gray-400 border-purple-800' : 'text-gray-600 border-gray-300'}`}>
                To get started with our AI Review Generator and SEO Optimization
                platform, simply copy and paste the following code as HTML into your
                project. This will allow you to quickly display AI-powered review
                suggestions and SEO-friendly content blocks on your website, helping
                your business improve its online reputation, engage with customers,
                and boost search rankings effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}