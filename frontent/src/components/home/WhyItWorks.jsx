import { motion } from "framer-motion";
import { Check, Star, MessageCircle, Activity, Search } from "lucide-react";

const rankingFactors = [
  {
    icon: Star,
    label: "Review volume & freshness",
    description: "Get consistent new reviews",
  },
  {
    icon: MessageCircle,
    label: "Engagement & replies",
    description: "Respond to every review",
  },
  {
    icon: Activity,
    label: "Profile activity",
    description: "Stay active 24/7",
  },
  {
    icon: Search,
    label: "Keyword relevance",
    description: "Optimized for local search",
  },
];

export default function WhyItWorks() {
  return (
    <section className="relative py-28 bg-[#f7f8fc] overflow-hidden">
      <div className="container-tight px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
              Why It Works
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Google Rewards{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Active Businesses
              </span>
            </h2>

            <p className="text-lg text-gray-500 mb-10 max-w-xl">
              Google ranks businesses based on specific signals. Clurst
              automates all of them — every single day.
            </p>

            {/* Factors */}
            <div className="space-y-4">
              {rankingFactors.map((factor, index) => {
                const Icon = factor.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl
                      bg-white border border-gray-200
                      shadow-sm hover:shadow-md transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100
                      flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {factor.label}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {factor.description}
                      </p>
                    </div>

                    <Check className="w-5 h-5 text-green-600" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-green-500" />
                <span className="font-semibold text-gray-900">
                  Google Rankings
                </span>
              </div>

              {/* Chart */}
              <div className="h-48 relative mb-6">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 0 120 Q 50 100 100 80 T 200 40 T 300 10"
                    fill="none"
                    stroke="url(#chartGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 120 Q 50 100 100 80 T 200 40 T 300 10 L 300 150 L 0 150 Z"
                    fill="url(#chartGradient)"
                    opacity="0.12"
                  />
                </svg>

                <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  +127% Growth
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9</div>
                  <div className="text-xs text-gray-500">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">847</div>
                  <div className="text-xs text-gray-500">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">#1</div>
                  <div className="text-xs text-gray-500">Local Rank</div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-900">
                  Automated Daily
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
