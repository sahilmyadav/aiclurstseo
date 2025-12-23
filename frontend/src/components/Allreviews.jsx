import { useState } from "react";
import { Star, ChevronDown, Search } from "lucide-react";

const dummyReviews = [
  {
    id: 1,
    customer_name: "Abhishek Thakur",
    rating: 5,
    review_text:
      "Effortlessly boost your online reputation and search rankings with AI-powered reviews and SEO recommendations. This tool makes it super easy to collect reviews and reply instantly with AI.",
    created_at: "2025-09-01T10:00:00Z",
  },
  {
    id: 2,
    customer_name: "Riya Mehta",
    rating: 4,
    review_text:
      "Great platform! It helped me manage my customer feedback more effectively. The AI-generated responses are a lifesaver.",
    created_at: "2025-08-25T14:30:00Z",
  },
  {
    id: 3,
    customer_name: "Arjun Kapoor",
    rating: 5,
    review_text:
      "Amazing dashboard and very clean UI. Tracking reviews and ratings has never been easier for my business.",
    created_at: "2025-08-20T09:15:00Z",
  },
  {
    id: 4,
    customer_name: "Sneha Patel",
    rating: 3,
    review_text:
      "It’s good overall, but I would love to see more customization options for the reports.",
    created_at: "2025-07-30T17:45:00Z",
  },
  {
    id: 5,
    customer_name: "Vikram Singh",
    rating: 5,
    review_text:
      "This platform has simplified review collection and response management for us. Highly recommend it!",
    created_at: "2025-07-15T11:20:00Z",
  },
];

const Allreviews = () => {
  const [reviews] = useState(dummyReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState(0);

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      const ratingMatch =
        filterRating === 0 || review.rating === filterRating;
      const searchMatch =
        review.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        review.review_text.toLowerCase().includes(searchTerm.toLowerCase());
      return ratingMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

  return (
    <div className="min-h-screen w-full bg-[#0b0b1c] text-white flex">
      <div className="flex-1 p-4 sm:p-6 mt-10 lg:mt-20">
        {/* Header */}
       <div className="text-center max-w-3xl mx-auto mb-10 px-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          What Our <span className="text-purple-400">Customer</span>Say
        </h2>
        <p className="text-gray-400 mt-2">
          Here from our incredible customers who are building at lightning speed
        </p>
      </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
              size={18}
            />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12122b] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Sort */}
          <div className="relative w-full sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#12122b] border border-white/10 rounded-lg px-3 py-2 text-sm appearance-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="highest">Rating: High-Low</option>
              <option value="lowest">Rating: Low-High</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
              size={18}
            />
          </div>

          {/* Filter */}
          <div className="relative w-full sm:w-40">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="w-full bg-[#12122b] border border-white/10 rounded-lg px-3 py-2 text-sm appearance-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={0}>Filter by Rating</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
              size={18}
            />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
          {filteredAndSortedReviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-[#12122b] p-5 rounded-2xl shadow-md hover:shadow-purple-500/30 transition flex flex-col justify-between border border-purple-500/20"
            >
              {/* Glow Border */}
              <div className="absolute inset-0 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)] pointer-events-none"></div>

              {/* Stars */}
              <div className="flex text-yellow-400 mb-2 relative z-10">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm text-white/80 leading-relaxed mb-4 relative z-10">
                {review.review_text}
              </p>

              {/* Footer */}
              <div className="flex items-center space-x-3 mt-auto relative z-10">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white/60">
                  {review.customer_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {review.customer_name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Allreviews;
