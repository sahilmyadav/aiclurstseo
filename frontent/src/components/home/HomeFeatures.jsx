import { motion } from "framer-motion";
import {
  Rocket,
  MessageSquare,
  Bot,
  QrCode,
  Brain,
  BarChart3,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Automated Google SEO",
    description:
      "AI posts keyword-optimized updates on your Google Business Profile to keep it active and ranking higher.",
    result: "Higher relevance, better visibility, more local discovery.",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-600",
    badgeDot: "bg-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Smart Review System",
    description:
      "Automatically send review requests via Email & SMS with smart follow-ups until customers leave reviews.",
    result: "Consistent 5-star review growth without manual chasing.",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-600",
    badgeDot: "bg-purple-500",
  },
  {
    icon: Bot,
    title: "AI Review Replies",
    description:
      "Clurst replies to every review using SEO-optimized AI responses.",
    result: "Improved trust, higher engagement, stronger ranking signals.",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-600",
    badgeDot: "bg-indigo-500",
  },
  {
    icon: QrCode,
    title: "QR Review Generator",
    description:
      "Generate branded QR codes. Customers scan → see AI review suggestions → post instantly.",
    result: "More in-store reviews with zero friction.",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-600",
    badgeDot: "bg-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Keyword Optimization",
    description:
      "Every post and reply includes location-based SEO keywords tailored to your business.",
    result: "Stronger local relevance and better Google Maps rankings.",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badgeBg: "bg-green-100",
    badgeText: "text-green-600",
    badgeDot: "bg-green-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description:
      "Track reviews, keyword activity, engagement, and visibility from one simple dashboard.",
    result: "Clear insights into what's driving your Google growth.",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-600",
    badgeDot: "bg-orange-500",
  },
  {
    icon: Building2,
    title: "Multi-Location Ready",
    description:
      "Manage multiple business profiles or clients from one place.",
    result: "Perfect for agencies, franchises, and growing brands.",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-600",
    badgeDot: "bg-purple-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 bg-[#f7f8fc]">
      <div className="container-tight">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold mb-4">
            Features
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            One Tool.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Total Google Growth.
            </span>
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to dominate local search and grow your business
            on Google.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 ml-14 mr-14"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-white border border-gray-200
                  shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${feature.iconBg}
                  flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Result pill */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5
                  rounded-full ${feature.badgeBg} text-sm`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${feature.badgeDot}`}
                  />
                  <span className={feature.badgeText}>
                    {feature.result}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
