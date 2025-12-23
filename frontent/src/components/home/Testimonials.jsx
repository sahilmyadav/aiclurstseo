import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Dental Clinic Owner",
    location: "Austin, TX",
    initials: "SM",
    rating: 5,
    quote:
      "Clurst transformed our online presence. We went from 45 reviews to over 200 in just 3 months. Our Google ranking improved dramatically.",
  },
  {
    name: "James Rodriguez",
    role: "Restaurant Owner",
    location: "Miami, FL",
    initials: "JR",
    rating: 5,
    quote:
      "The AI review replies are brilliant. Every response sounds personal and professional. Our customers love it.",
  },
  {
    name: "Emily Thompson",
    role: "Salon Owner",
    location: "London, UK",
    initials: "ET",
    rating: 5,
    quote:
      "I was spending hours on review management. Now Clurst handles everything automatically. Best investment for my business.",
  },
  {
    name: "Michael Chen",
    role: "Real Estate Agent",
    location: "San Francisco, CA",
    initials: "MC",
    rating: 5,
    quote:
      "The QR code feature is genius. I put it on my business cards and the reviews just keep coming in.",
  },
  {
    name: "Amanda Foster",
    role: "Gym Owner",
    location: "Manchester, UK",
    initials: "AF",
    rating: 5,
    quote:
      "Our Google Maps ranking went from page 2 to the top 3 results. The automated SEO posts really work.",
  },
  {
    name: "David Park",
    role: "Marketing Agency CEO",
    location: "New York, NY",
    initials: "DP",
    rating: 5,
    quote:
      "We manage 50+ client profiles with Clurst. It's saved us countless hours and our clients love the results.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 bg-[#f7f8fc]">
      <div className="container-tight px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full
            bg-orange-100 text-orange-600 text-sm font-semibold mb-4"
          >
            Success Stories
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              1,000+ Businesses
            </span>
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See what local business owners are saying about Clurst.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-gray-200
                shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-purple-200 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                “{t.quote}”
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-indigo-600
                  flex items-center justify-center text-white font-semibold"
                >
                  {t.initials}
                </div>

                <div>
                  <div className="font-semibold text-gray-900">
                    {t.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.role} • {t.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mt-14 text-sm text-gray-500"
        >
          <div>✔ Used by businesses across USA & UK</div>
          <div>✔ No agencies • No contracts</div>
          <div>✔ Built for predictable growth</div>
        </motion.div>
      </div>
    </section>
  );
}
