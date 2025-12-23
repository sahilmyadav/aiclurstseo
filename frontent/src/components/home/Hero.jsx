import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Link } from "react-router-dom";

const trustPoints = [
  "No contracts",
  "Cancel anytime",
  "Secure Google integration",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 bg-[#f7f8fc]">
      {/* MAIN SOFT CLOUD BACKGROUND (KEY PART) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18)_0%,_rgba(247,248,252,0.9)_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.16)_0%,_transparent_60%)]" />

      <div className="container-tight relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* TRUST BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-orange-400 text-orange-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              Trusted by 1,000+ local businesses
            </span>
          </motion.div>

          {/* HEADING */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Automate Your{" "}
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] bg-clip-text text-transparent">
              Google Growth
            </span>{" "}
            with AI
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10"
          >
            Clurst is an all-in-one AI platform that automates Google SEO,
            reviews, replies, and reputation — helping local businesses
            rank higher and win more customers.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            {/* PRIMARY */}
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl
                text-white text-lg font-semibold
                bg-gradient-to-r from-[#4f46e5] to-[#6366f1]
                shadow-md hover:shadow-lg transition"
            >
              Start Free 14-Day Trial
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* SECONDARY */}
            <button
              className="px-8 py-4 rounded-xl bg-white border border-gray-200
                text-gray-900 text-lg font-semibold
                shadow-sm hover:bg-gray-50 transition"
            >
              Watch Demo
            </button>
          </motion.div>

          {/* TRUST POINTS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>

          {/* DASHBOARD MOCK */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl">
              <div className="aspect-[16/9] bg-gradient-to-br from-[#f4f5fb] to-[#eef0fa] p-8">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2 space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-200 rounded-lg" />
                      <div className="h-24 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-green-100 rounded-lg" />
                    <div className="h-32 bg-gray-200 rounded-lg" />
                    <div className="h-20 bg-purple-100 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* SOFT GLOW */}
            <div className="absolute -inset-8 bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-indigo-300/30 blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
