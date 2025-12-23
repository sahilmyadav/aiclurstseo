import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Does Clurst work for my type of business?",
    answer:
      "Yes. Clurst works for any business that uses a Google Business Profile — service, retail, healthcare, food, or real estate. If customers can find you on Google, Clurst can help you grow.",
  },
  {
    question: "Is this safe for my Google Business Profile?",
    answer:
      "Absolutely. Clurst uses secure, Google-approved APIs and follows Google's guidelines. Your profile is in safe hands.",
  },
  {
    question: "How fast will I see results?",
    answer:
      "Most businesses start seeing new reviews within 7–10 days and improved engagement shortly after. Ranking improvements typically become visible within 4–8 weeks.",
  },
  {
    question: "Do I need technical or SEO knowledge?",
    answer:
      "No. Clurst is fully automated and beginner-friendly. Just connect your Google Business Profile and let the AI handle everything.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no contracts. You can cancel anytime from your dashboard with just one click.",
  },
  {
    question: "Is Clurst suitable for agencies?",
    answer:
      "Yes. Clurst supports multiple locations and clients, making it ideal for agencies and franchises.",
  },
  {
    question: "What happens after the 14-day free trial?",
    answer:
      "You can continue on the monthly plan ($99) or save 50% with the yearly plan ($594/year = $49/month equivalent).",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      className="relative py-28 overflow-hidden
        bg-gradient-to-b from-white via-indigo-50/40 to-white"
    >
      {/* soft background glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl" />

      <div className="container-tight relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full
            bg-indigo-100 text-indigo-600 text-sm font-semibold mb-4"
          >
            Questions?
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about Clurst.
          </p>
        </motion.div>

        {/* FAQ List (width controlled + side margin) */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative rounded-2xl
                  bg-white/70 backdrop-blur-xl
                  border border-white/40
                  shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]
                  hover:shadow-[0_30px_80px_-30px_rgba(99,102,241,0.45)]
                  transition-all duration-300"
              >
                {/* Question */}
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between
                    px-6 py-5 text-left font-semibold text-gray-900"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 text-purple-600"
                        : "text-gray-500"
                    }`}
                  />
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
