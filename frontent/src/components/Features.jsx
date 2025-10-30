import { BarChart3, Globe, MessageSquare, Search, Shield, TrendingUp, Star, Zap } from "lucide-react";
import Testimonials from "./Home-Reviews";

const features = [
  {
    icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
    title: "AI Review Generation",
    description: "Generate authentic, contextual reviews for your products and services using advanced AI algorithms.",
    bgColor: "bg-indigo-50"
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
    title: "Smart Auto-Replies",
    description: "Automatically respond to customer reviews with professional, personalized replies.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-green-500" />,
    title: "Advanced Analytics",
    description: "Track sentiment, monitor trends, and get actionable insights to improve your online reputation.",
    bgColor: "bg-green-50"
  },
  {
    icon: <Search className="w-6 h-6 text-amber-500" />,
    title: "SEO Optimization",
    description: "Boost your search rankings with AI-generated keywords, meta tags, and optimized content.",
    bgColor: "bg-amber-50"
  },
  {
    icon: <Shield className="w-6 h-6 text-red-500" />,
    title: "Reputation Protection",
    description: "Monitor mentions and get instant alerts for negative reviews to respond quickly.",
    bgColor: "bg-red-50"
  },
  {
    icon: <Globe className="w-6 h-6 text-purple-500" />,
    title: "Multi-Platform Integration",
    description: "Connect with Google, Facebook, LinkedIn, and other platforms from one dashboard.",
    bgColor: "bg-purple-50"
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-[#0f0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful <span className="text-indigo-400">AI Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to manage your online reputation, boost SEO rankings, and grow your business with intelligent automation.
          </p>
        </div>

      <div className="max-w-6xl mx-auto text-center mb-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1f1f30] p-8 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition">
            <TrendingUp className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-indigo-400">10,000+</p>
            <p className="text-gray-400 text-sm">Businesses Trust Us</p>
          </div>

          <div className="bg-[#1f1f30] p-8 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition">
            <Star className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-indigo-400">2M+</p>
            <p className="text-gray-400 text-sm">Reviews Generated</p>
          </div>

          <div className="bg-[#1f1f30] p-8 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition">
            <Zap className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-indigo-400">98%</p>
            <p className="text-gray-400 text-sm">Customer Satisfaction</p>
          </div>

          <div className="bg-[#1f1f30] p-8 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition">
            <Shield className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-indigo-400">24/7</p>
            <p className="text-gray-400 text-sm">AI Monitoring</p>
          </div>
        </div>
      </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#1a1b2e] rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-800 hover:border-indigo-500/50"
            >
              <div className="p-8">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

<Testimonials />
        <div className="relative mt-20 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-md"></div>
            
            <section className="relative bg-[#1a1b2e] rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to transform your business reviews?
                </h3>
                <p className="text-gray-300 mb-8">
                  Join thousands of businesses already using <span className="text-indigo-400 font-semibold">ReviewAI Pro</span> to boost their online presence.
                </p>

                <div className="inline-flex flex-col sm:flex-col items-center justify-center gap-6 text-sm text-gray-300">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Free 14-day trial
                  </span>

                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No credit card required
                  </span>

                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cancel anytime
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
