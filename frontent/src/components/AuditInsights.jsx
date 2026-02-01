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

const AuditInsights = ({ performanceData, selectedBusiness, onInsightsGenerated }) => {
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
    <div className="pb-10 space-y-10">

      {/* ================= AI POWERED INSIGHTS (ALWAYS VISIBLE) ================= */}
      <div className="rounded-2xl p-1 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200">
        <div className="rounded-2xl p-6 bg-[#f7f8fc] space-y-4">

          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              AI-Powered Insights
            </h2>

            <button
              onClick={generateInsights}
              disabled={loading || cooldown > 0}
              className="ml-auto text-sm text-purple-600 hover:underline disabled:opacity-50"
            >
              {cooldown ? `Wait ${cooldown}s` : 'Generate'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* AI RESULT OR EMPTY STATE */}
          {aiInsights ? (
            <>
              {aiInsights.summary && (
                <Section title="PERFORMANCE SUMMARY">
                  {aiInsights.summary}
                </Section>
              )}

              {aiInsights.strengths?.length > 0 && (
                <Section title="KEY STRENGTHS">
                  <ul className="list-disc pl-5 space-y-1">
                    {aiInsights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Section>
              )}

              {aiInsights.weaknesses?.length > 0 && (
                <Section title="AREAS TO IMPROVE">
                  <ul className="list-disc pl-5 space-y-1">
                    {aiInsights.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </Section>
              )}

              {aiInsights.priorityActions?.length > 0 && (
                <Section title="TOP 3 ACTIONS">
                  <ol className="list-decimal pl-5 space-y-1">
                    {aiInsights.priorityActions.slice(0, 3).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ol>
                </Section>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Brain className="w-12 h-12 mx-auto text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Get AI-Powered Insights
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Expert recommendations based on your business performance.
              </p>

              <button
                onClick={generateInsights}
                disabled={loading}
                className="mt-5 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate AI Insights
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= BUSINESS INSIGHTS (ALWAYS VISIBLE) ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Business Insights</h3>
        <p className="text-sm text-gray-500 mb-6">
          Based on your actual Google Business Profile performance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            title="Visibility Trend"
            desc={`Profile visibility ${visibilityChange < 0 ? 'decreased' : 'increased'} last month.`}
            footer={`Change: ${visibilityChange}%`}
            gradient="from-blue-50 to-blue-100"
            border="border-blue-400"
            footerColor="text-blue-600"
          />

          <InsightCard
            icon={<MousePointerClick className="w-5 h-5 text-green-600" />}
            title="Customer Actions"
            desc="Users actively interact with your business profile."
            footer={`Total actions: ${totalActions}`}
            gradient="from-green-50 to-green-100"
            border="border-green-400"
            footerColor="text-green-600"
          />

          <InsightCard
            icon={<Target className="w-5 h-5 text-orange-600" />}
            title="Optimization Opportunity"
            desc="Improve profile completeness and SEO."
            footer={`Overall score: ${scores.overall || 0}%`}
            gradient="from-orange-50 to-orange-100"
            border="border-orange-400"
            footerColor="text-orange-600"
          />

          <InsightCard
            icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
            title="Industry Benchmark"
            desc="Engagement compared to industry average."
            footer={`Engagement: ${scores.engagement || 0}%`}
            gradient="from-purple-50 to-purple-100"
            border="border-purple-400"
            footerColor="text-purple-600"
          />
        </div>
      </div>

      {/* ================= QUICK WINS (ALWAYS VISIBLE) ================= */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Win Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickWin text="Post 2–3 times weekly" />
          <QuickWin text="Respond to all reviews" />
          <QuickWin text="Add 5+ photos monthly" />
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <h4 className="text-sm font-semibold text-purple-600 mb-2">{title}</h4>
    <div className="text-sm text-gray-700">{children}</div>
  </div>
);

const InsightCard = ({ icon, title, desc, footer, gradient, border, footerColor }) => (
  <div className={`rounded-xl border-l-4 ${border} bg-gradient-to-r ${gradient} p-4`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    <p className="text-sm text-gray-700 mb-2">{desc}</p>
    <p className={`text-sm font-medium ${footerColor}`}>{footer}</p>
  </div>
);

const QuickWin = ({ text }) => (
  <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-500" />
    <span className="text-sm font-medium text-gray-800">{text}</span>
  </div>
);

export default AuditInsights;
