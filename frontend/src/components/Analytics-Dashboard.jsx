import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const revenueData = [
    { day: 'Wed', date: 15, value: 12000 },
    { day: 'Thu', date: 16, value: 15000 },
    { day: 'Fri', date: 17, value: 18000 },
    { day: 'Sat', date: 18, value: 14000 },
    { day: 'Sun', date: 19, value: 16000 },
    { day: 'Mon', date: 20, value: 19000 },
    { day: 'Tue', date: 21, value: 17000 },
    { day: 'Wed', date: 22, value: 20000 },
    { day: 'Thu', date: 23, value: 18000 },
    { day: 'Fri', date: 24, value: 22000 },
    { day: 'Sat', date: 25, value: 21000 },
  ];

  const recognitionData = [
    { name: 'Recognition 1', value: 50 },
    { name: 'Recognition 2', value: 60 },
    { name: 'Recognition 3', value: 30 },
  ];

    const smallChartData = [
    { value: 40 }, { value: 60 }, { value: 55 }, { value: 75 }, { value: 65 }, { value: 50 },
  ];

  const metricsData = [
    { title: 'New Subscriptions', value: '2,285', chartData: smallChartData, color: '#3B82F6' },
    { title: 'New Trials', value: '1,285', chartData: smallChartData, color: '#10B981' },
    { title: 'Reactivations', value: '2,285', chartData: smallChartData, color: '#8B5CF6' },
    { title: 'Not Spend This Month', value: '$2,285', chartData: smallChartData, color: '#F59E0B' },
    { title: 'Not Income This Month', value: '$2,285', chartData: smallChartData, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1240] p-6 text-white">
      <div className=" mx-auto mt-10 lg:mt-20">
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column - Metrics */}
        <div className="space-y-6">
                {/* Metrics Cards with Graphs */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-700">
            <div className="space-y-6">
              {metricsData.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-blue-200 text-sm">{metric.title}</span>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                  <div className="w-16 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`colorMetric${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={metric.color}
                          strokeWidth={1.5}
                          fillOpacity={1}
                          fill={`url(#colorMetric${index})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Monthly Progress */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-purple-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Monthly Progress</span>
              <span className="text-2xl font-bold text-blue-400">60%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Middle Column - Revenue Chart */}
        <div className="lg:col-span-2 border border-purple-700 rounded-lg">
          <div className="bg-gray-800 p-6 rounded-lg shadow-sm h-full">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Monthly Recurring Revenue</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">$12,000</span>
                <span className="text-gray-400">From $180,000</span>
              </div>
            </div>
            
            {/* Date Navigation */}
            <div className="flex justify-between mb-6">
              <div className="flex space-x-1">
                {revenueData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500">{item.day}</div>
                    <div className="text-sm font-medium">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <CartesianGrid vertical={false} stroke="#374151" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      color: '#E5E7EB'
                    }}
                    itemStyle={{ color: '#E5E7EB' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - History and Recognition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        
        {/* History Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-purple-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">History</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Show: All History
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              "View detailed logs of emails, SMS, and QR invitations",
              "Monitor AI replies linked to each review entry",
              "Analyze review sources at a glance",
              "Never lose track of customer interactions",
              "Keep a timeline of all review activities",
              "Know which requests converted into real reviews"
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recognition Section */}
        <div className='bg-gray-800 rounded-lg shadow-sm border border-purple-700 p-4'>
          <h2 className="text-xl font-bold text-white mb-4">Recognition</h2>
         
          <div className="">
            {/* Percentage Circles */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[50, 60, 30].map((percentage, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-2">
                    <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto"
                         style={{
                           borderColor: index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : '#EF4444',
                           borderLeftColor: 'transparent',
                           borderBottomColor: 'transparent',
                           transform: 'rotate(45deg)'
                         }}>
                      <span className="text-lg font-bold text-white"
                            style={{ transform: 'rotate(-45deg)' }}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Recognition Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-700 rounded-lg">
                <span className="font-semibold text-white">200</span>
                <span className="text-blue-200">Upgrade</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-700 rounded-lg">
                <span className="font-semibold text-white">150</span>
                <span className="text-blue-200">New member</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-700 rounded-lg">
                <span className="font-semibold text-white">39</span>
                <span className="text-blue-200">Unsubscribe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>


      
    </div>
  );
};

export default AnalyticsDashboard;