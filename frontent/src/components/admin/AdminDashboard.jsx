import { BarChart3, Users, Clock, FileText, Settings, AlertCircle, MessageSquare, Activity, ArrowUpRight, Loader2, BarChart, PieChart, UserPlus } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const { theme } = useTheme();
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
      <div className={`flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-[#0f1020]' : 'bg-gray-50'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-[#0f1020]' : 'bg-gray-50'
      }`}>
        <div className={`text-red-500 text-center p-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className={`min-h-screen w-full flex ${
      theme === 'dark' ? 'text-white bg-[#0f1020]' : 'text-gray-900 bg-gray-50'
    }`}>
      <div className="flex-1 p-3 sm:p-6 transition-all duration-300 ease-in-out w-full">
        <div className="h-screen overflow-auto">
          <div className="pb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-purple-900'
              }`}>Admin Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#1a1b2e] hover:bg-[#23243a]' : 'bg-white hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Total Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <span className="flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +12% from last month
                      </span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}>
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#1a1b2e] hover:bg-[#23243a]' : 'bg-white hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Active Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <span className="flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +5% from last week
                      </span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
                  }`}>
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#1a1b2e] hover:bg-[#23243a]' : 'bg-white hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Admin Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalAdmins}</p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      <span className="flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +2 this month
                      </span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <UserPlus className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#1a1b2e] hover:bg-[#23243a]' : 'bg-white hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Blocked Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.blockedUsers}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      <span className="flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        -1 this week
                      </span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.action}
                    className={`p-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center text-center ${
                      theme === 'dark' 
                        ? 'bg-[#1a1b2e] hover:bg-[#23243a] border border-gray-800' 
                        : 'bg-white hover:shadow-md border border-gray-100'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-2 ${
                      theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                    }`}>
                      {action.icon}
                    </div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`rounded-xl p-6 mb-6 ${
              theme === 'dark' ? 'bg-[#1a1b2e] border border-gray-800' : 'bg-white border border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Recent Activity
                </h2>
                <Link 
                  to="/ad-dashboard/users" 
                  className={`text-sm ${
                    theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
                  } font-medium transition-colors`}
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start pb-4 ${
                      index !== recentActivities.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}` : ''
                    } last:pb-0`}
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                    }`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activity.user} <span className={`${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        } font-normal`}>
                          {activity.action}
                        </span>
                      </p>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
    <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 hover:bg-gray-700/50 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#1a1b2e] hover:bg-[#23243a]' : 'bg-white hover:shadow-md'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className={`mt-2 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
            colorClasses[color]
          }`}>
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