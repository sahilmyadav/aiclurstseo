import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const goToLogin = () => navigate("/login");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const glassCard = `
    rounded-2xl backdrop-blur-xl transition-all duration-300
    shadow-[0_20px_60px_rgba(99,102,241,0.25)]
    hover:shadow-[0_30px_90px_rgba(99,102,241,0.45)]
  `;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-[#0b0c1a] via-[#0f1020] to-[#121326] text-white"
          : "bg-gradient-to-br from-[#f7f5ff] via-white to-[#eef2ff] text-gray-800"
      }`}
    >

      {/* ================= HERO ================= */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-28 text-center">
        <div className={`reveal inline-flex px-4 py-2 rounded-full text-sm mb-6 ${glassCard} ${
          isDark ? "bg-white/10 border border-white/10" : "bg-white/70"
        }`}>
          ⭐⭐⭐⭐⭐ Used by local businesses across USA & UK
        </div>

        <h1 className="reveal delay-100 text-4xl md:text-6xl font-extrabold mb-6">
          Automate Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Google Growth
          </span>{" "}
          with AI
        </h1>

        <p className={`reveal delay-200 text-lg max-w-3xl mx-auto mb-10 ${
          isDark ? "text-white/70" : "text-gray-600"
        }`}>
          Clurst automates Google SEO, reviews, replies, and reputation —
          helping local businesses rank higher and win more customers.
        </p>

        <div className="reveal delay-300 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={goToLogin}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-xl hover:scale-105 transition">
            Start Free 14-Day Trial →
          </button>

          <button onClick={goToLogin}
            className={`px-8 py-4 rounded-full font-semibold transition ${
              isDark
                ? "bg-white/10 border border-white/10 hover:bg-white/20"
                : "bg-white/80 shadow hover:bg-white"
            }`}>
            Watch Demo
          </button>
        </div>

        <p className={`reveal delay-400 mt-6 text-sm ${
          isDark ? "text-white/50" : "text-gray-500"
        }`}>
          No contracts • Cancel anytime • Secure Google integration
        </p>
      </section>

      {/* ================= WHO IS CLURST FOR ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="reveal text-3xl md:text-4xl font-bold text-center mb-14">
          Who Is Clurst For?
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            "🦷 Dental Clinics & Medical Practices",
            "💇 Salons, Spas & Beauty Businesses",
            "🍽 Restaurants, Cafés & Takeaways",
            "🏡 Real Estate Agents & Brokers",
            "🛠 Home Service Businesses",
            "🏋 Gyms, Fitness Studios & Trainers",
            "🚗 Auto Repair & Local Shops",
            "📈 Local SEO & Marketing Agencies"
          ].map((item, i) => (
            <div key={i}
              className={`reveal delay-${(i + 1) * 100} p-6 text-center ${glassCard} ${
                isDark ? "bg-white/5 border border-white/10" : "bg-white/70"
              }`}>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY CLURST WORKS (USA / UK) ================= */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="reveal text-3xl md:text-4xl font-bold text-center mb-14">
            Why Clurst Works Best in USA & UK
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Customers trust Google reviews more than ads",
              "Google Maps decides who gets calls & visits",
              "Consistent activity boosts local rankings",
              "Businesses prefer automation over agencies",
              "AI-powered tools are widely adopted",
              "Clurst is built for this exact behavior"
            ].map((point, i) => (
              <div key={i}
                className={`reveal p-6 ${glassCard} ${
                  isDark ? "bg-white/5 border border-white/10" : "bg-white/70"
                }`}>
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="reveal text-3xl md:text-4xl font-bold text-center mb-4">
          Choose Your <span className="text-indigo-500">Growth Plan</span>
        </h2>

        <p className={`reveal delay-100 text-center mb-16 ${
          isDark ? "text-white/60" : "text-gray-600"
        }`}>
          Start with a 14-day free trial. No credit card required.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">

          <div className={`reveal p-8 ${glassCard} ${
            isDark ? "bg-white/5 border border-white/10" : "bg-white/70"
          }`}>
            <h3 className="text-xl font-bold mb-2">Monthly</h3>
            <p className="text-4xl font-extrabold mb-1">$99</p>
            <p className="text-sm opacity-70 mb-6">per month</p>

            <ul className="space-y-3 opacity-80">
              <li>✔ Full feature access</li>
              <li>✔ Unlimited review requests</li>
              <li>✔ AI review replies</li>
              <li>✔ SEO-optimized posts</li>
              <li>✔ Real-time dashboard</li>
              <li>✔ Email support</li>
            </ul>

            <button onClick={goToLogin}
              className="mt-8 w-full py-3 rounded-full font-semibold border hover:bg-indigo-500 hover:text-white transition">
              Start Free Trial →
            </button>
          </div>

          <div className={`reveal delay-200 relative p-8 border-2 border-indigo-500 ${glassCard} ${
            isDark ? "bg-white/5" : "bg-white/80"
          }`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm shadow-lg">
              MOST POPULAR • SAVE 50%
            </span>

            <h3 className="text-xl font-bold mb-2">Yearly</h3>
            <p className="text-4xl font-extrabold mb-1">$49</p>
            <p className="text-sm opacity-70 mb-6">per month • $594/year</p>

            <ul className="space-y-3 opacity-80">
              <li>✔ Everything in Monthly</li>
              <li>✔ Priority support</li>
              <li>✔ Free onboarding call</li>
              <li>✔ Early access to features</li>
              <li>✔ Dedicated success manager</li>
            </ul>

            <button onClick={goToLogin}
              className="mt-8 w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-xl hover:scale-105 transition">
              Start Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="reveal text-3xl md:text-4xl font-bold text-center mb-14">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            ["Does Clurst work for my business?", "Yes. Works for any Google Business Profile."],
            ["Is it safe to use?", "Yes. Uses secure, Google-approved APIs."],
            ["How fast will I see results?", "Most businesses see results in 7–10 days."],
            ["Do I need SEO knowledge?", "No. Fully automated."],
            ["Can I cancel anytime?", "Yes. No contracts."],
            ["Is it good for agencies?", "Yes. Multi-location & client support included."]
          ].map(([q, a], i) => (
            <div key={i}
              className={`reveal p-6 ${glassCard} ${
                isDark ? "bg-white/5 border border-white/10" : "bg-white/70"
              }`}>
              <h3 className="font-semibold mb-2">{q}</h3>
              <p className={isDark ? "text-white/70" : "text-gray-600"}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TRUST LINES ================= */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {[
            "✔ Used by local businesses across USA & UK",
            "✔ Designed for Google Maps & local search growth",
            "✔ No agencies. No contracts. Just results.",
            "✔ Predictable local business growth",
            "✔ Automate what Google rewards the most"
          ].map((line, i) => (
            <div key={i} className="reveal text-sm font-medium opacity-80">
              {line}
            </div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="reveal text-3xl md:text-4xl font-extrabold mb-6">
          Ready to Grow Your Google Visibility Automatically?
        </h2>

        <button onClick={goToLogin}
          className="reveal delay-200 px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-2xl hover:scale-105 transition">
          Start Your Free 14-Day Trial
        </button>

        <p className="reveal delay-300 mt-6 text-sm opacity-70">
          No contracts • Cancel anytime • AI does the work
        </p>
      </section>

      {/* ================= ONE LINE SUMMARY ================= */}
      <section className="py-12 text-center">
        <p className={`reveal text-sm md:text-base font-medium max-w-3xl mx-auto ${
          isDark ? "text-white/60" : "text-gray-600"
        }`}>
          Clurst automates everything Google loves — reviews, replies, posts, and
          keywords — so your business ranks higher and grows faster.
        </p>
      </section>

    </div>
  );
}
