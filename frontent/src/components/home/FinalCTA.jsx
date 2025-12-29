import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "14-day free trial",
  "No credit card required",
  "Cancel anytime",
  "Full feature access",
];

export default function FinalCTA() {
  return (
    <section
      className="relative py-28 overflow-hidden
       bg-[#f7f8fc]"
    >
      {/* Soft background glow */}
      {/* <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-indigo-300/30 rounded-full blur-3xl" /> */}

      <div className="container-tight relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* CTA Card */}
          <div
            className="relative rounded-3xl
              bg-white/75 backdrop-blur-xl
              border border-white/40
              px-8 py-12 md:px-16 md:py-16
              shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-3xl
              bg-gradient-to-br from-indigo-200/10 via-purple-200/10 to-indigo-200/10
              pointer-events-none"
            />

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Ready to Grow Your Google{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Visibility Automatically?
              </span>
            </h2>

            {/* Sub text */}
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
              Let AI do the work. You focus on your business.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-3
                  px-10 py-4 rounded-xl text-lg font-bold text-white
                  bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
                  shadow-[0_20px_50px_-20px_rgba(99,102,241,0.7)]
                  hover:shadow-[0_30px_70px_-25px_rgba(99,102,241,0.9)]
                  transition-all duration-300
                  hover:scale-[1.04] active:scale-[0.97]"
              >
                Start Your Free 14-Day Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Footer text */}
            <p className="mt-6 text-sm text-gray-500">
              Join <span className="font-semibold text-gray-900">1,000+</span>{" "}
              local businesses growing with Clurst
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
