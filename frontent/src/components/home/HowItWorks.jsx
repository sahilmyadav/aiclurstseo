import { motion } from "framer-motion";
import { Link2, Zap, Clock, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Connect Your Profile",
    description:
      "Link your Google Business Profile in seconds with secure OAuth.",
  },
  {
    icon: Zap,
    title: "AI Takes Over",
    description:
      "Clurst automates reviews, replies & posts automatically.",
  },
  {
    icon: Clock,
    title: "24/7 Activity",
    description:
      "AI keeps your profile active around the clock.",
  },
  {
    icon: TrendingUp,
    title: "Watch Growth",
    description:
      "Get more visibility & customers on autopilot.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 bg-[#f7f8fc]"
    >
      <div className="container-tight px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full
            bg-blue-100 text-blue-600 text-sm font-semibold mb-4"
          >
            Simple Process
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl
            font-bold text-gray-900 mb-4"
          >
            How{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600
              bg-clip-text text-transparent"
            >
              Clurst
            </span>{" "}
            Works
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Get started in minutes. No technical skills required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-7xl mx-auto">
          {/* Connecting Line (Desktop only) */}
          <div
            className="hidden lg:block absolute top-1/2 left-12 right-12
            h-[2px] bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300
            -translate-y-1/2"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 px-2">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative"
                >
                  {/* Card */}
                  <div
                    className="relative p-6 rounded-2xl bg-white
                    border border-gray-200 text-center
                    shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Step Number */}
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2
                      w-9 h-9 rounded-full bg-indigo-600
                      flex items-center justify-center
                      text-white text-sm font-bold shadow"
                    >
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl bg-gray-100
                      mx-auto mb-4 flex items-center justify-center mt-4"
                    >
                      <Icon className="w-8 h-8 text-gray-700" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
