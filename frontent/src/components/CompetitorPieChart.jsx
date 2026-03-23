import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CompetitorPieChart = ({ competitors, theme }) => {
  if (!competitors || competitors.length === 0) return null;

  // Prepare data for rating distribution
  const ratingData = [
    { name: 'Excellent (4.5-5.0)', value: competitors.filter(c => c.rating >= 4.5).length, color: '#22c55e' },
    { name: 'Good (4.0-4.4)', value: competitors.filter(c => c.rating >= 4.0 && c.rating < 4.5).length, color: '#3b82f6' },
    { name: 'Average (3.0-3.9)', value: competitors.filter(c => c.rating >= 3.0 && c.rating < 4.0).length, color: '#f59e0b' },
    { name: 'Below Average (2.0-2.9)', value: competitors.filter(c => c.rating >= 2.0 && c.rating < 3.0).length, color: '#ef4444' },
    { name: 'Poor (<2.0)', value: competitors.filter(c => c.rating > 0 && c.rating < 2.0).length, color: '#991b1b' },
  ].filter(item => item.value > 0);

  // Prepare data for review volume distribution
  const maxReviews = Math.max(...competitors.map(c => c.totalReviews || c.totalRatings || 0));
  const reviewData = [
    { name: 'Very High (80%+)', value: competitors.filter(c => (c.totalReviews || c.totalRatings || 0) >= maxReviews * 0.8).length, color: '#8b5cf6' },
    { name: 'High (60-79%)', value: competitors.filter(c => {
      const reviews = c.totalReviews || c.totalRatings || 0;
      return reviews >= maxReviews * 0.6 && reviews < maxReviews * 0.8;
    }).length, color: '#3b82f6' },
    { name: 'Medium (40-59%)', value: competitors.filter(c => {
      const reviews = c.totalReviews || c.totalRatings || 0;
      return reviews >= maxReviews * 0.4 && reviews < maxReviews * 0.6;
    }).length, color: '#10b981' },
    { name: 'Low (20-39%)', value: competitors.filter(c => {
      const reviews = c.totalReviews || c.totalRatings || 0;
      return reviews >= maxReviews * 0.2 && reviews < maxReviews * 0.4;
    }).length, color: '#f59e0b' },
    { name: 'Very Low (<20%)', value: competitors.filter(c => (c.totalReviews || c.totalRatings || 0) < maxReviews * 0.2).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Prepare data for photos distribution
  const maxPhotos = Math.max(...competitors.map(c => c.totalPhotos || 0));
  const photosData = [
    { name: 'Rich Media (80%+)', value: competitors.filter(c => (c.totalPhotos || 0) >= maxPhotos * 0.8).length, color: '#f59e0b' },
    { name: 'Good Media (60-79%)', value: competitors.filter(c => {
      const photos = c.totalPhotos || 0;
      return photos >= maxPhotos * 0.6 && photos < maxPhotos * 0.8;
    }).length, color: '#3b82f6' },
    { name: 'Average Media (40-59%)', value: competitors.filter(c => {
      const photos = c.totalPhotos || 0;
      return photos >= maxPhotos * 0.4 && photos < maxPhotos * 0.6;
    }).length, color: '#10b981' },
    { name: 'Low Media (20-39%)', value: competitors.filter(c => {
      const photos = c.totalPhotos || 0;
      return photos >= maxPhotos * 0.2 && photos < maxPhotos * 0.4;
    }).length, color: '#6366f1' },
    { name: 'Minimal Media (<20%)', value: competitors.filter(c => (c.totalPhotos || 0) < maxPhotos * 0.2).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-[#1a1b2e] border border-white/10' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].name}
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Count: {payload[0].value} ({((payload[0].value / competitors.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    const percent = ((entry.value / competitors.length) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className={`mt-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-[#1a1b2e]/90 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center mb-6">
        <TrendingUp className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
        <div>
          <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Competitor Distribution Analysis
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
            Visual breakdown of competitor performance metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Distribution */}
        <div>
          <h4 className={`text-center text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Rating Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {ratingData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-700'}>{item.name}</span>
                </div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Volume Distribution */}
        <div>
          <h4 className={`text-center text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Review Volume Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reviewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {reviewData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-700'}>{item.name}</span>
                </div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photos Distribution */}
        <div>
          <h4 className={`text-center text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Media Content Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={photosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {photosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {photosData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-gray-700'}>{item.name}</span>
                </div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Dominant Rating Category:
            </span>
            <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
              {ratingData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Most Common Review Volume:
            </span>
            <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
              {reviewData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Media Content Level:
            </span>
            <span className={`ml-1 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
              {photosData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorPieChart;
