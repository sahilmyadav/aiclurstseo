import { Star } from "lucide-react";
import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#2a2440] py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-10">
        
        <div className="text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#41375c] text-sm text-white mb-6">
            ⚡ AI-Powered Reviews & SEO
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
            Transform Your{" "}
            <span className="bg-clip-text text-transparent font-bold font-weight-bold bg-gradient-to-r from-[#5d3be6] via-[#7b5fff] to-[#9a7dff]">
              Business Reviews
            </span>{" "}
            with AI
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-lg">
            Generate authentic reviews, craft perfect replies, and boost SEO
            rankings with our advanced AI platform. Trusted by 10,000+
            businesses worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg">
              Watch Demo
            </button>
            <button className="px-6 py-3 border border-gray-400 text-white font-semibold rounded-lg hover:bg-white/10 transition transform hover:-translate-y-1 hover:shadow-lg">
              Learn More
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <span>4.9/5 from 2,000+ reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">📈</span>
              <span>98% customer satisfaction</span>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <img
            src="https://png.pngtree.com/background/20250523/original/pngtree-futuristic-data-analytics-dashboard-with-neon-financial-graphs-picture-image_16528267.jpg"
            alt="AI Dashboard"
            className="rounded-2xl shadow-2xl border border-purple-500/20"
          />

          <div className="absolute top-4 left-4 bg-black/60 text-green-400 text-sm px-3 py-1 rounded-full shadow-lg border border-green-500/30">
            ● AI Active
          </div>

          <div className="absolute bottom-4 right-4 bg-purple-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
            +247% Review Growth
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
