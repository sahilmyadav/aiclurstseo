import React, { useEffect, useState, useRef } from 'react';
import {
  BellRing,
  ChevronDown,
  GitBranch,
  Home,
  LayoutGrid,
  Link as LinkIcon,
  LogOut,
  BarChart3,
  Send,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Settings,
  BarChart2,
  CreditCard,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from './context/SidebarContext';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';

const SideNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isCollapsed,
    mobileOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    toggleSidebar,
    setMobileOpen,
  } = useSidebar();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return 'GU';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile && !mobileOpen) {
        closeMobileSidebar();
      } else if (!isMobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen, closeMobileSidebar, setMobileOpen]);

  const handleToggleMobileSidebar = () => {
    toggleMobileSidebar();
  };

  const handleNavClick = async (e, item) => {
    if (item.name === 'Logout') {
      e.preventDefault();
      try {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Failed to log out. Please try again.');
      }
      return;
    }

    if (window.innerWidth < 1024) {
      closeMobileSidebar();
    }
  };

    const userNavItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard', active: location.pathname === '/dashboard' },
    { name: 'Get Reviews', icon: Send, path: '/dashboard/reviews', active: location.pathname === '/dashboard/reviews' },
    { name: 'Audit', icon: BarChart3, path: '/dashboard/audit', active: location.pathname === '/dashboard/audit' },
    { name: 'Reviews', icon: Star, path: '/dashboard/handle-reviews', active: location.pathname === '/dashboard/handle-reviews' },
    { name: 'Review Link', icon: LinkIcon, path: '/dashboard/review-link', active: location.pathname === '/dashboard/review-link' },
    { name: 'Widgets', icon: LayoutGrid, path: '/dashboard/widgets', active: location.pathname === '/dashboard/widgets' },
    { name: 'Integrations', icon: GitBranch, path: '/dashboard/integrations', active: location.pathname === '/dashboard/integrations' },
    { name: 'Social Sharing', icon: Share2, path: '/dashboard/social-sharing', active: location.pathname === '/dashboard/social-sharing' },
    { name: 'Notifications', icon: BellRing, path: '/dashboard/notifications', active: location.pathname === '/dashboard/notifications' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', active: location.pathname === '/dashboard/settings' },
    { name: 'Subscription', icon: CreditCard, path: '/dashboard/subscription', active: location.pathname === '/dashboard/subscription' },
    { name: 'Billing', icon: CreditCard, path: '/dashboard/billing', active: location.pathname === '/dashboard/billing' },
  ];

  const adminNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/ad-dashboard', active: location.pathname === '/ad-dashboard' },
    { name: 'Settings', icon: Settings, path: '/ad-dashboard/settings', active: location.pathname === '/ad-dashboard/settings' },
    { name: 'Users', icon: Users, path: '/ad-dashboard/users', active: location.pathname === '/ad-dashboard/users' },
    { name: 'Analytics', icon: BarChart2, path: '/ad-dashboard/analytics', active: location.pathname === '/ad-dashboard/analytics' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  // Removed otherItems as we'll handle these directly

  const isMobileView = () => typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      <button
        onClick={handleToggleMobileSidebar}
        className="fixed top-4 left-4 lg:hidden z-50 p-2 rounded-md bg-[#0f1020] text-white border border-white/10 shadow-lg"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen bg-[#0f1020] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out z-40 ${
          mobileOpen && isMobileView() ? 'w-64' : isCollapsed ? 'w-18' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-white/10">
            {!isCollapsed ? (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                  C
                </div>
                <span className="ml-3 text-lg font-semibold whitespace-nowrap bg-clip-text text-transparent font-bold font-weight-800 bg-gradient-to-r from-[#5d3be6] via-[#7b5fff] to-[#9a7dff]">Clurst Review</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold mx-auto">
                C
              </div>
            )}
            {!((mobileOpen && isMobileView())) && !isCollapsed ? (
              <button onClick={toggleSidebar} className="ml-auto p-1 rounded-md text-gray-400 hover:bg-gray-700">
                <ChevronLeft size={20} />
              </button>
            ) : !((mobileOpen && isMobileView())) && isCollapsed ? (
              <button onClick={toggleSidebar} className="mx-auto p-1 rounded-md text-gray-400 hover:bg-gray-700 mt-2" title="Expand sidebar">
                <ChevronRight size={20} />
              </button>
            ) : null}
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <ul className="space-y-1 px-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.active
                        ? 'bg-gradient-to-r from-[#5d3be6] via-[#7b5fff] to-[#9a7dff]'
                        : 'text-gray-300 hover:bg-[#1a1b2e]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed || (mobileOpen && isMobileView()) ? <span className="ml-3">{item.name}</span> : null}
                    {!isCollapsed && item.count ? (
                      <span className="ml-auto bg-[#2d2d47] text-xs font-medium px-2 py-0.5 rounded-full">{item.count}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto border-t border-white/10 p-4 bg-[#0f1020]" ref={profileRef}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#1a1b2e] cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getUserInitials()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              )}
              {!isCollapsed && (
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                />
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="mt-1 bg-[#1a1b2e] rounded-lg overflow-hidden">
                <Link
                  to="/"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (window.innerWidth < 1024) closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2d2d47] transition-colors"
                >
                  <Home size={16} className="text-gray-400" />
                  <span>Home</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsProfileOpen(false);
                    handleNavClick(e, { name: 'Logout' });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-red-400 hover:bg-[#2d2d47] transition-colors"
                >
                  <LogOut size={16} className="text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={closeMobileSidebar} />
      )}
    </>
  );
};

export default SideNav;
