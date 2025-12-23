import { motion } from "framer-motion";
import {
  Stethoscope,
  Scissors,
  UtensilsCrossed,
  Home,
  Wrench,
  Dumbbell,
  Car,
  BarChart,
} from "lucide-react";

const audiences = [
  { icon: Stethoscope, label: "Dental Clinics & Medical Practices" },
  { icon: Scissors, label: "Salons, Spas & Beauty Businesses" },
  { icon: UtensilsCrossed, label: "Restaurants, Cafés & Takeaways" },
  { icon: Home, label: "Real Estate Agents & Brokers" },
  { icon: Wrench, label: "Home Service Businesses" },
  { icon: Dumbbell, label: "Gyms, Fitness Studios & Trainers" },
  { icon: Car, label: "Auto Repair & Local Shops" },
  { icon: BarChart, label: "Local SEO & Marketing Agencies" },
];

export default function WhoIsFor() {
  return (
    <section className="relative py-28 overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-white">
      {/* Soft background glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl" />

      <div className="container-tight relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full
            bg-cyan-100 text-cyan-600 text-sm font-semibold mb-4"
          >
            Perfect Fit
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Who Is{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Clurst
            </span>{" "}
            For?
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            If customers search for your business on Google — Clurst is for you.
          </p>
        </motion.div>

        {/* Audience Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 m-10">
          {audiences.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative p-5 rounded-2xl
                  bg-white/70 backdrop-blur-xl
                  border border-white/40
                  shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)]
                  hover:shadow-[0_30px_80px_-25px_rgba(99,102,241,0.45)]
                  transition-all duration-300
                  hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl
                    bg-gray-100/70
                    group-hover:bg-purple-100
                    flex items-center justify-center
                    transition-colors"
                  >
                    <Icon
                      className="w-5 h-5 text-gray-500
                      group-hover:text-purple-600 transition-colors"
                    />
                  </div>

                  <span className="font-semibold text-gray-800 text-sm leading-snug">
                    {item.label}
                  </span>
                </div>

                {/* subtle glow */}
                <div className="absolute inset-0 rounded-2xl
                  bg-gradient-to-r from-indigo-200/0 via-purple-200/0 to-indigo-200/0
                  group-hover:from-indigo-200/30
                  group-hover:via-purple-200/30
                  group-hover:to-indigo-200/30
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  pointer-events-none"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl
            bg-white/70 backdrop-blur-xl
            border border-white/40
            shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white
                flex items-center justify-center text-xs"
              >
                🇺🇸
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white
                flex items-center justify-center text-xs"
              >
                🇬🇧
              </div>
            </div>

            <span className="text-sm text-gray-600">
              Designed specifically for{" "}
              <span className="font-semibold text-gray-900">
                USA & UK
              </span>{" "}
              local businesses
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
