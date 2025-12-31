import { motion } from "framer-motion";
import { Check, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Monthly",
    price: "$99",
    period: "/month",
    description: "Full access, cancel anytime",
    features: [
      "Full feature access",
      "Unlimited review requests",
      "AI review replies",
      "SEO-optimized posts",
      "Real-time dashboard",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Yearly",
    price: "$49",
    period: "/month",
    originalPrice: "$99",
    description: "Billed annually at $594",
    badge: "SAVE 50%",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Free onboarding call",
      "Early access to features",
      "Dedicated success manager",
      "Best value for growth",
    ],
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-28 overflow-hidden bg-[#f7f8fc]"
    >
      {/* Soft background glow */}
      {/* <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl" /> */}

      <div className="container-tight relative z-10 px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold mb-4">
            Simple Pricing
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Growth Plan
            </span>
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto px-4 sm:px-0">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`relative rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300
                ${
                  plan.popular
                    ? "bg-white/80 border-2 border-purple-500 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.45)] md:scale-[1.03]"
                    : "bg-white/70 border border-gray-200 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_80px_-25px_rgba(0,0,0,0.25)]"
                }`}
            >
              {/* MOST POPULAR */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full
                    bg-gradient-to-r from-indigo-500 to-purple-500
                    text-white text-sm font-bold shadow-lg"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                {plan.badge && (
                  <span className="inline-block mb-3 px-3 py-1 rounded-full
                    bg-green-100 text-green-600 text-xs font-bold"
                  >
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline justify-center gap-2">
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center
                        ${
                          plan.popular
                            ? "bg-purple-100"
                            : "bg-gray-100"
                        }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular
                            ? "text-purple-600"
                            : "text-indigo-600"
                        }`}
                      />
                    </div>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Link
                to="/login"
                className={`group w-full inline-flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300
                  ${
                    plan.popular
                      ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl hover:shadow-2xl hover:scale-[1.03]"
                      : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-gray-500 mt-12 text-sm">
          ✓ No contracts • Cancel anytime • Secure payment
        </p>
      </div>
    </section>
  );
}
