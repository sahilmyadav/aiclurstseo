import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
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

const CompetitorLineGraph = ({ competitors, theme }) => {
  const [type, setType] = useState('area');

  if (!competitors || competitors.length === 0) return null;

  const topCompetitors = competitors.slice(0, 10);

  // Prepare data for Recharts
  const chartData = topCompetitors.map((c, i) => ({
    name: c.name.substring(0, 15) + (c.name.length > 15 ? '...' : ''),
    Rating: c.rating || 0,
    Reviews: c.totalReviews || c.totalRatings || 0,
    Photos: c.totalPhotos || 0
  }));

  const ChartWrapper = type === 'area' ? AreaChart : LineChart;
  const ChartItem = type === 'area' ? Area : Line;

  return (
    <div className={`mt-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Competitor Comparison - Rating, Reviews & Photos
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
              Compare top 10 competitors across key metrics
            </p>
          </div>
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
      <ResponsiveContainer width="100%" height={400}>
        <ChartWrapper data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: theme === 'dark' ? '#fff' : '#000', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: theme === 'dark' ? '#fff' : '#000', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1a1b2e' : '#fff',
              border: `1px solid ${theme === 'dark' ? '#ffffff20' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#fff' : '#000'
            }}
          />
          <Legend />

          <ChartItem 
            type="monotone" 
            dataKey="Rating" 
            stroke="#8B5CF6" 
            fill="#8B5CF6" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <ChartItem 
            type="monotone" 
            dataKey="Reviews" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <ChartItem 
            type="monotone" 
            dataKey="Photos" 
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </ChartWrapper>
      </ResponsiveContainer>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              Rating (0-5)
            </span>
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Avg: {(topCompetitors.reduce((sum, c) => sum + (c.rating || 0), 0) / topCompetitors.length).toFixed(2)}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              Reviews Count
            </span>
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Avg: {Math.round(topCompetitors.reduce((sum, c) => sum + (c.totalReviews || c.totalRatings || 0), 0) / topCompetitors.length)}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
              Photos Count
            </span>
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Avg: {Math.round(topCompetitors.reduce((sum, c) => sum + (c.totalPhotos || 0), 0) / topCompetitors.length)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorLineGraph;
