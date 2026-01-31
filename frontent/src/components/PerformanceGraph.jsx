import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useState } from 'react';

const PerformanceGraph = ({ data, theme }) => {
  const [type, setType] = useState('area');

  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    }),
    Calls: d.calls,
    'Direction Requests': d.directionRequests,
    Impressions: d.impressions,
    Views: d.views,
    'Website Clicks': d.websiteClicks
  }));

  const ChartWrapper = type === 'area' ? AreaChart : LineChart;
  const ChartItem = type === 'area' ? Area : Line;

  return (
    <div
      className={`p-5 rounded-xl ${
        theme === 'dark' ? 'bg-[#1a1b2e]' : 'bg-white'
      } border`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Performance Trends (Last 30 Days)
          </h3>
          <p className="text-sm text-gray-500">
            Track your business profile performance over time
          </p>
        </div>

        <div className="flex gap-2">
          {['area', 'line'].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition
                ${
                  type === t
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-white/10 text-white/70'
                    : 'bg-gray-100 text-gray-700'
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <ChartWrapper data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          <ChartItem type="monotone" dataKey="Calls" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
          <ChartItem type="monotone" dataKey="Direction Requests" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
          <ChartItem type="monotone" dataKey="Impressions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
          <ChartItem type="monotone" dataKey="Views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
          <ChartItem type="monotone" dataKey="Website Clicks" stroke="#ec4899" fill="#ec4899" fillOpacity={0.25} />
        </ChartWrapper>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceGraph;
