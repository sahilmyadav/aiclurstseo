import { Copy, Filter, RefreshCw, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";
import { useSidebar } from "./context/SidebarContext";

// Component to display a single review
const ReviewCard = ({ review, darkMode }) => {
  const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
  const rating = ratingMap[review.starRating] || 5;
  
  return (
    <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}.0</span>
      </div>
      <p className="text-sm mb-2">{review.comment || "No comment provided"}</p>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{review.reviewer.displayName}</span>
        <span>{new Date(review.createTime).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// Component to display all reviews
const AllReviewsWidget = ({ reviews, darkMode, filters, businessName }) => {
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
      <div className={`border rounded-lg p-10 text-center ${darkMode ? 'border-gray-600' : 'border-purple-800'}`}>
        <Star className={`w-10 h-10 mx-auto mb-4 text-yellow-400`} />
        <p className="mb-4">No reviews available yet</p>
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <div className={`border rounded-lg p-10 text-center ${darkMode ? 'border-gray-600' : 'border-purple-800'}`}>
        <Star className={`w-10 h-10 mx-auto mb-4 text-yellow-400`} />
        <p className="mb-4">No reviews match your filters</p>
        <button 
          onClick={() => window.location.reload()}
          className={`px-6 py-2 rounded-lg transition flex items-center gap-2 mx-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#1e1e3a] hover:bg-purple-700'}`}
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
            <span className="text-sm font-medium text-gray-400">Business:</span>
            <span className="text-sm font-medium text-purple-300">{businessName}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
          </h3>
          {filteredReviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
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
            darkMode={darkMode} 
          />
        ))}
      </div>
    </div>
  );
};

export default function WebsiteWidgets() {
  const { isCollapsed } = useSidebar();
  const { 
    selectedBusiness, 
    reviews = [], 
    loading, 
    fetchReviews,
    businesses = [],
    selectBusiness
  } = useGoogleBusiness();
  
  const [activeTab, setActiveTab] = useState("Carousel");
  const [toggles, setToggles] = useState({
    removePoweredBy: false,
    darkMode: false,
    hideScore: false,
    hideReviewData: false,
    showOnlyHighRatings: false,
    feedback: false,
  });

  // State for copied status
  const [copied, setCopied] = useState(false);

  // Fetch reviews when a business is selected
  useEffect(() => {
    if (selectedBusiness) {
      const accountId = selectedBusiness.accountId;
      const locationId = selectedBusiness.name.split("/")[1];
      fetchReviews(accountId, locationId);
    } else if (businesses.length > 0) {
      // Auto-select first business if none selected
      selectBusiness(businesses[0]);
    }
  }, [selectedBusiness, businesses]);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate widget code
  const generateWidgetCode = () => {
    const darkModeClass = toggles.darkMode ? 'dark' : '';
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
      darkMode: ${toggles.darkMode},
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
  ${toggles.darkMode ? 'color: #fff; background-color: #1a1a1a;' : 'color: #333; background-color: #fff;'}
}
.review-card { 
  border: 1px solid ${toggles.darkMode ? '#444' : '#e0e0e0'}; 
  border-radius: 8px; 
  padding: 16px; 
  margin-bottom: 16px; 
}
.stars { color: #ffc107; font-size: 18px; }
.review-text { margin: 8px 0; }
.reviewer { font-weight: bold; }
.widget-header h3 { 
  margin: 0 0 16px 0; 
  ${toggles.darkMode ? 'color: #fff;' : 'color: #333;'}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1730] to-[#120f25] text-white w-full">
      <div className="w-full mx-auto max-w-[2000px] px-0 sm:px-2 md:px-4 lg:px-6">
        <div className="p-3 sm:p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-6">Website Widgets</h2>

          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-2 px-2">
            {["Carousel", "Feed", "Video", "All Reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === tab ? "bg-purple-700" : "bg-[#1e1e3a] hover:bg-[#2a2a4a] transition-colors"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "All Reviews" ? (
            <div>
              {loading ? (
                <div className="border border-purple-800 rounded-lg p-10 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : !selectedBusiness ? (
                <div className="border border-purple-800 rounded-lg p-10 text-center">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className="mb-4">No business selected</p>
                </div>
              ) : reviews && reviews.length > 0 ? (
                <AllReviewsWidget 
                  reviews={reviews} 
                  darkMode={toggles.darkMode} 
                  filters={{
                    showOnlyHighRatings: toggles.showOnlyHighRatings
                  }}
                  businessName={selectedBusiness?.locationName || selectedBusiness?.title || 'Business'}
                />
              ) : (
                <div className="border border-purple-800 rounded-lg p-10 text-center">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <p className="mb-4">No reviews available for {selectedBusiness?.locationName || 'this business'}</p>
                  <button 
                    onClick={() => {
                      if (selectedBusiness) {
                        const accountId = selectedBusiness.accountId;
                        const locationId = selectedBusiness.name.split("/")[1];
                        fetchReviews(accountId, locationId);
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-[#1e1e3a] hover:bg-purple-700 transition flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" /> Reload
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-purple-800 rounded-lg p-10 text-center">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <p className="mb-4">No Review Are Currently Available</p>
              <button className="px-6 py-2 rounded-lg bg-[#1e1e3a] hover:bg-purple-700 transition flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" /> Reload
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
            <div className="bg-[#1e1e3a] rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4">
              <button className="flex items-center gap-2 mb-4 px-3 py-1 bg-black/40 rounded-md text-sm">
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
                  className="flex items-center justify-between text-sm"
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

            <div className="bg-[#1e1e3a] rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span>Integrations</span>
                <label className="flex items-center gap-2 text-sm">
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
                <p className="mb-2 text-sm font-medium">HTML Code</p>
                <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-md text-[10px] xs:text-xs font-mono overflow-hidden">
                  <span className="truncate max-w-[180px] xs:max-w-xs">&lt;div class="reviews-widget"&gt;...&lt;/div&gt;</span>
                  <button onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>}
              </div>

              <p className="text-[11px] xs:text-xs text-gray-400 border border-purple-800 rounded-md p-2 sm:p-3">
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