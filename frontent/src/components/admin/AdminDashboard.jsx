import { BarChart3, Users, Clock, FileText, Settings, AlertCircle, MessageSquare, Activity, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';

const AdminDashboard = () => {
  const { 
    users, 
    allUsers, 
    loading, 
    error, 
    fetchUsers 
  } = useContext(AdminContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    blockedUsers: 0,
    pendingActions: 0,
  });

  useEffect(() => {
    // Fetch users data when component mounts
    const fetchData = async () => {
      try {
        await fetchUsers('/api/admin/users?limit=10&page=1');
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchData();
  }, [fetchUsers]);

  useEffect(() => {
    if (allUsers.length > 0) {
      const activeUsers = allUsers.filter(user => !user.isBlocked).length;
      const totalAdmins = allUsers.filter(user => user.role === 'admin').length;
      const blockedUsers = allUsers.filter(user => user.isBlocked).length;
      setStats({
        totalUsers: allUsers.length,
        totalAdmins,
        activeUsers,
        blockedUsers,
        pendingActions: allUsers.filter(user => user.role === 'pending').length,
      });
    }
  }, [allUsers]);

  // Format time to relative time
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    return 'Just now';
  };
  
  // Get recent users for activity feed
  const recentActivities = allUsers
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(user => ({
      id: user._id,
      user: user.name || 'New User',
      action: 'joined the platform',
      time: formatTimeAgo(user.createdAt),
      icon: <Users className="w-4 h-4 text-green-500" />
    }));

  const quickActions = [
    { title: 'Manage Users', icon: <Users className="w-5 h-5" />, action: '/ad-dashboard/users' },
    { title: 'View Analytics', icon: <BarChart3 className="w-5 h-5" />, action: '/ad-dashboard/analytics' },
    { title: 'Edit Plans', icon: <MessageSquare className="w-5 h-5" />, action: '/ad-dashboard/plans' },
    { title: 'System Settings', icon: <Settings className="w-5 h-5" />, action: '/ad-dashboard/settings' },
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center p-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard Overview</h1>
              <p className="mt-1 text-sm text-gray-400">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
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
              change={`${allUsers.length > 0 ? Math.round((stats.activeUsers / allUsers.length) * 100) : 0}% Active`}
              icon={<Users className="w-6 h-6 text-blue-400" />}
              color="blue"
            />
            <StatCard
              title="Total Admins"
              value={stats.totalAdmins.toLocaleString()}
              change={`${allUsers.length > 0 ? Math.round((stats.totalAdmins / allUsers.length) * 100) : 0}% of total`}
              icon={<Users className="w-6 h-6 text-indigo-400" />}
              color="indigo"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              change={`${allUsers.length > 0 ? Math.round((stats.activeUsers / allUsers.length) * 100) : 0}% of total`}
              icon={<Activity className="w-6 h-6 text-green-400" />}
              color="green"
            />
            <StatCard
              title="Blocked Users"
              value={stats.blockedUsers.toLocaleString()}
              change={`${allUsers.length > 0 ? Math.round((stats.blockedUsers / allUsers.length) * 100) : 0}% of total`}
              icon={<Users className="w-6 h-6 text-red-400" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Quick Actions - Left Side */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white">Quick Actions</h3>
                </div>
                <div className="divide-y divide-gray-700">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.action}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-gray-700 text-gray-300 mr-3">
                          {action.icon}
                        </span>
                        <span className="font-medium text-gray-200">{action.title}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity - Right Side */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Recent Activity</h3>
                  <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
                </div>
                <div className="divide-y divide-gray-700 max-h-[280px] overflow-y-auto">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors duration-150">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-300">
                            {activity.icon}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-white">{activity.user}</span>
                            <span className="mx-1 text-gray-400">{activity.action}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activity.time}
                            {activity.userEmail && (
                              <span className="ml-2 text-gray-500">• {activity.userEmail}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="mt-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Recent Reviews</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-2">
                <MessageSquare className="w-10 h-10 mx-auto" />
              </div>
              <h4 className="text-gray-400 text-sm">No recent reviews available</h4>
              <p className="text-gray-500 text-xs mt-1">New reviews will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-400',
    green: 'bg-green-900/30 text-green-400',
    purple: 'bg-purple-900/30 text-purple-400',
    orange: 'bg-orange-900/30 text-orange-400',
    indigo: 'bg-indigo-900/30 text-indigo-400',
    red: 'bg-red-900/30 text-red-400',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    indigo: 'text-indigo-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 hover:bg-gray-700/50 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          <div className={`mt-2 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${colorClasses[color]}`}>
            {change}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-20 ${iconColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;