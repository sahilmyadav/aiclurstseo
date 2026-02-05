import { useState, useCallback, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  MousePointerClick,
  Target,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const AuditInsights = ({ performanceData, selectedBusiness, onInsightsGenerated, theme = 'light' }) => {
  const [aiInsights, setAIInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  /* ---------------- DERIVED PERFORMANCE DATA ---------------- */

  const monthly = performanceData?.monthly || [];
  const totals = performanceData?.totals || {};
  const scores = performanceData?.scores || {};

  const lastMonth = monthly.at(-1) || {};
  const prevMonth = monthly.at(-2) || {};

  const visibilityChange = prevMonth.impressions
    ? (((lastMonth.impressions - prevMonth.impressions) / prevMonth.impressions) * 100).toFixed(1)
    : 0;

  const totalActions =
    (totals.calls || 0) +
    (totals.directionRequests || 0) +
    (totals.websiteClicks || 0);

  /* ---------------- AI GENERATION ---------------- */

  const generateInsights = useCallback(async () => {
    if (loading || cooldown > 0) return;

    if (!performanceData) {
      toast.error('No performance data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/audit`,
        {
          businessId: selectedBusiness?.id || selectedBusiness?.name,
          businessName: selectedBusiness?.title || selectedBusiness?.name,
          performanceData
        }
      );

      const insights = res.data.analysis || res.data;
      setAIInsights(insights);
      onInsightsGenerated?.(insights);
      toast.success('AI insights generated');
      setCooldown(2);
    } catch {
      setError('Failed to generate AI insights');
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  }, [performanceData, selectedBusiness, loading, cooldown, onInsightsGenerated]);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => {
      setCooldown(v => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <div className={`pb-10 space-y-10 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>

      {/* ================= AI POWERED INSIGHTS (ALWAYS VISIBLE) ================= */}
      <div className={`rounded-2xl p-1 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200'}`}>
        <div className={`rounded-2xl p-6 space-y-4 ${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-[#f7f8fc]'}`}>

          <div className="flex items-center gap-3">
            <Brain className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              AI-Powered Insights
            </h2>

            <button
              onClick={generateInsights}
              disabled={loading || cooldown > 0}
              className={`ml-auto text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 ${loading || cooldown > 0 ? 'opacity-70' : 'hover:opacity-90'} ${theme === 'dark'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'}`}
            >
              {cooldown ? `Wait ${cooldown}s` : 'Generate'}
            </button>
          </div>

          {error && (
            <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* AI RESULT OR EMPTY STATE */}
          {aiInsights ? (
            <>
              {aiInsights.summary && (
                <Section title="PERFORMANCE SUMMARY" theme={theme}>
                  {aiInsights.summary}
                </Section>
              )}

              {aiInsights.strengths?.length > 0 && (
                <Section title="KEY STRENGTHS" theme={theme}>
                  <ul className={`list-disc pl-5 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiInsights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Section>
              )}

              {aiInsights.weaknesses?.length > 0 && (
                <Section title="AREAS TO IMPROVE" theme={theme}>
                  <ul className={`list-disc pl-5 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiInsights.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </Section>
              )}

              {aiInsights.priorityActions?.length > 0 && (
                <Section title="TOP 3 ACTIONS" theme={theme}>
                  <ol className={`list-decimal pl-5 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiInsights.priorityActions.slice(0, 3).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ol>
                </Section>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Brain className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Get AI-Powered Insights
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Expert recommendations based on your business performance.
              </p>

              <button
                onClick={generateInsights}
                disabled={loading}
                className={`mt-5 px-6 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto transition-all duration-300 ${loading ? 'opacity-70' : 'hover:opacity-90'
                  } bg-gradient-to-r from-blue-500 to-purple-500 shadow-md`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate AI Insights
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= BUSINESS INSIGHTS (ALWAYS VISIBLE) ================= */}
      <div className={`rounded-2xl border p-6 ${theme === 'dark'
        ? 'bg-gray-800/50 border-gray-700'
        : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Business Insights
        </h3>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          Based on your actual Google Business Profile performance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            icon={<TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />}
            title="Visibility Trend"
            desc={`Profile visibility ${visibilityChange < 0 ? 'decreased' : 'increased'} last month.`}
            footer={`Change: ${visibilityChange}%`}
            gradient={theme === 'dark' ? 'from-blue-900/30 to-blue-800/30' : 'from-blue-50 to-blue-100'}
            border={theme === 'dark' ? 'border-blue-600' : 'border-blue-400'}
            footerColor={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
            theme={theme}
            imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
          />

          <InsightCard
            icon={<MousePointerClick className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />}
            title="Customer Actions"
            desc="Users actively interact with your business profile."
            footer={`Total actions: ${totalActions}`}
            gradient={theme === 'dark' ? 'from-green-900/30 to-green-800/30' : 'from-green-50 to-green-100'}
            border={theme === 'dark' ? 'border-green-600' : 'border-green-400'}
            footerColor={theme === 'dark' ? 'text-green-400' : 'text-green-600'}
            theme={theme}
            imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
          />

          <InsightCard
            icon={<Target className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />}
            title="Optimization Opportunity"
            desc="Improve profile completeness and SEO."
            footer={`Overall score: ${scores.overall || 0}%`}
            gradient={theme === 'dark' ? 'from-orange-900/30 to-orange-800/30' : 'from-orange-50 to-orange-100'}
            border={theme === 'dark' ? 'border-orange-600' : 'border-orange-400'}
            footerColor={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}
            theme={theme}
          />

          <InsightCard
            icon={<BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />}
            title="Industry Benchmark"
            desc="Engagement compared to industry average."
            footer={`Engagement: ${scores.engagement || 0}%`}
            gradient={theme === 'dark' ? 'from-purple-900/30 to-purple-800/30' : 'from-purple-50 to-purple-100'}
            border={theme === 'dark' ? 'border-purple-600' : 'border-purple-400'}
            footerColor={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
            theme={theme}
          />
        </div>
      </div>

      {/* ================= QUICK WINS (ALWAYS VISIBLE) ================= */}
      <div className={`p-1 rounded-2xl ${theme === 'dark'
        ? 'bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50'
        : 'bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-100'}`}>
        <div className={`rounded-2xl p-6 ${theme === 'dark'
          ? 'bg-gray-800/90 backdrop-blur-sm'
          : 'bg-white/90'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Win Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickWin text="Post 2–3 times weekly" theme={theme} />
            <QuickWin text="Respond to all reviews" theme={theme} />
            <QuickWin text="Add 5+ photos monthly" theme={theme} />
          </div>

          {/* Audit Complete Section */}
          <div className={`mt-6 p-4 rounded-xl text-center ${theme === 'dark'
            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'}`}>
            <div className="flex flex-col items-center">
              <CheckCircle2 className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Audit Complete
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Real-time performance metrics updated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({ title, children, theme = 'light' }) => (
  <div className={`rounded-xl border p-4 ${theme === 'dark'
    ? 'bg-gray-800/50 border-gray-700'
    : 'bg-white border-gray-200'}`}>
    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark'
      ? 'text-purple-400'
      : 'text-purple-600'}`}>
      {title}
    </h4>
    <div className={`text-sm ${theme === 'dark'
      ? 'text-gray-300'
      : 'text-gray-700'}`}>
      {children}
    </div>
  </div>
);

const InsightCard = ({ icon, title, desc, footer, gradient, border, footerColor, theme, imageUrl }) => (
  <div className={`rounded-xl overflow-hidden border ${border} bg-gradient-to-br ${gradient} ${theme === 'dark' ? 'border-opacity-30' : 'border-opacity-50'}`}>
    <div className="flex">
      <div className="p-4 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {icon}
          </div>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
        </div>
        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{desc}</p>
        {footer && (
          <p className={`text-xs font-medium ${footerColor} flex items-center`}>
            {footer}
          </p>
        )}
      </div>
      {imageUrl && (
        <div className="w-24 h-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}
    </div>
  </div>
);

const QuickWin = ({ text, theme = 'light' }) => {
  // Generate a random gradient class for variety
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-emerald-500 to-teal-500'
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className={`relative rounded-xl overflow-hidden group`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${randomGradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative p-px">
        <div className={`rounded-xl p-3 flex items-center gap-2 ${theme === 'dark'
            ? 'bg-gray-900/80 group-hover:bg-gray-900/60'
            : 'bg-white/90 group-hover:bg-white/80'}`}>
          <CheckCircle2 className={`w-5 h-5 ${theme === 'dark'
              ? 'text-white'
              : randomGradient.includes('blue') ? 'text-blue-500' :
                randomGradient.includes('pink') ? 'text-pink-500' : 'text-emerald-500'}`} />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditInsights;
