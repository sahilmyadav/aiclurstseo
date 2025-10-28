import { useState, useEffect, useCallback } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import fetchWithAuth from '../utils/fetchWithAuth';

const AIInsights = ({ reviews, businessId, businessName }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);

  // Handle cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateInsights = useCallback(async () => {
    if (isLoading || cooldown > 0) return;
    
    if (!reviews || reviews.length === 0) {
      toast.error('No reviews available for analysis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          businessName,
          reviews
        })
      });

      if (data.success && data.audit) {
        setInsights(data.audit);
        setCooldown(30); // Set 30-second cooldown
        toast.success('✨ AI insights generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate insights');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate insights');
      toast.error('Failed to generate insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [reviews, businessId, businessName, isLoading, cooldown]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI-Powered Insights
        </h3>
        
        <button
          onClick={generateInsights}
          disabled={isLoading || cooldown > 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${isLoading || cooldown > 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⟳</span> Analyzing...
            </>
          ) : cooldown > 0 ? (
            `Regenerate in ${cooldown}s`
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {insights ? 'Regenerate Insights' : 'Generate Insights'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/30 rounded-md">
          {error}
        </div>
      )}

      {insights ? (
        <div className="space-y-4">
          {Object.entries(insights).map(([key, value]) => (
            <div key={key} className="bg-gray-700/50 p-3 rounded-md">
              <h4 className="font-medium text-purple-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm mt-1 text-gray-200">
                {Array.isArray(value) ? value.join(', ') : value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Click the button above to generate AI-powered insights from your reviews.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
