import { BarChart3, Users, Clock, FileText, Settings, AlertCircle, MessageSquare, Activity, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 1245,
    activeUsers: 892,
    totalReviews: 5243,
    pendingActions: 12,
  });

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'created a new review', time: '2 min ago', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 2, user: 'Sarah Smith', action: 'updated business profile', time: '15 min ago', icon: <Settings className="w-4 h-4" /> },
    { id: 3, user: 'Mike Johnson', action: 'replied to a review', time: '1 hour ago', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 4, user: 'System', action: 'scheduled maintenance', time: '3 hours ago', icon: <AlertCircle className="w-4 h-4" /> },
  ];

  const quickActions = [
    { title: 'Manage Users', icon: <Users className="w-5 h-5" />, action: '/admin/users' },
    { title: 'View Analytics', icon: <BarChart3 className="w-5 h-5" />, action: '/admin/analytics' },
    { title: 'Review Moderation', icon: <MessageSquare className="w-5 h-5" />, action: '/admin/moderation' },
    { title: 'System Settings', icon: <Settings className="w-5 h-5" />, action: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500"></span>
                Live
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              change="+12.5%"
              icon={<Users className="w-6 h-6 text-blue-500" />}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              change="+8.2%"
              icon={<Activity className="w-6 h-6 text-green-500" />}
              color="green"
            />
            <StatCard
              title="Total Reviews"
              value={stats.totalReviews.toLocaleString()}
              change="+24.3%"
              icon={<MessageSquare className="w-6 h-6 text-purple-500" />}
              color="purple"
            />
            <StatCard
              title="Pending Actions"
              value={stats.pendingActions}
              change="-3"
              icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {quickActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.action}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-gray-100 text-gray-600 mr-3">
                          {action.icon}
                        </span>
                        <span className="font-medium text-gray-700">{action.title}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                            {activity.icon}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <MessageSquare className="w-10 h-10 mx-auto" />
              </div>
              <h4 className="text-gray-500 text-sm">No recent reviews available</h4>
              <p className="text-gray-400 text-xs mt-1">New reviews will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          <div className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses[color]}`}>
            {change}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-opacity-20 bg-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;