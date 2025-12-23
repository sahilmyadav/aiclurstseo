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

const lightLogo = '/clurst transparent logo 2 for white baground.png';
const darkLogo = '/clurst transparent logo.png';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from './context/SidebarContext';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
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
    { name: 'Business Details', icon: CreditCard, path: '/dashboard/business-details', active: location.pathname === '/dashboard/business-details' },
    { name: 'Reviews', icon: Star, path: '/dashboard/handle-reviews', active: location.pathname === '/dashboard/handle-reviews' },
    { name: 'Feedback', icon: LinkIcon, path: '/dashboard/review-link', active: location.pathname === '/dashboard/review-link' },
    { name: 'Widgets', icon: LayoutGrid, path: '/dashboard/widgets', active: location.pathname === '/dashboard/widgets' },
    { name: 'Integrations', icon: GitBranch, path: '/dashboard/integrations', active: location.pathname === '/dashboard/integrations' },
    { name: 'Auto Posting', icon: Share2, path: '/dashboard/social-sharing', active: location.pathname === '/dashboard/social-sharing' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', active: location.pathname === '/dashboard/settings' },
    { name: 'Subscription', icon: CreditCard, path: '/dashboard/subscription', active: location.pathname === '/dashboard/subscription' },
    { name: 'Billing', icon: CreditCard, path: '/dashboard/billing', active: location.pathname === '/dashboard/billing' },
    { name: 'Logout', icon: LogOut, path: '#', active: false, isLogout: true },
  ];
  
  const adminNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/ad-dashboard', active: location.pathname === '/ad-dashboard' },
    { name: 'Settings', icon: Settings, path: '/ad-dashboard/settings', active: location.pathname === '/ad-dashboard/settings' },
    { name: 'Users', icon: Users, path: '/ad-dashboard/users', active: location.pathname === '/ad-dashboard/users' },
    { name: 'Analytics', icon: BarChart2, path: '/ad-dashboard/analytics', active: location.pathname === '/ad-dashboard/analytics' },
    { name: 'Edit Plans', icon: CreditCard, path: '/ad-dashboard/plans', active: location.pathname === '/ad-dashboard/plans' },
    { name: 'Logout', icon: LogOut, path: '#', active: false, isLogout: true },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  // Removed otherItems as we'll handle these directly

  const isMobileView = () => typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      <div className="fixed top-4 left-4 right-4 lg:hidden z-50 flex items-center justify-between">
        <button
          onClick={handleToggleMobileSidebar}
          className={`p-2 rounded-md ${
            theme === 'dark' 
              ? 'bg-[#0f1020] text-white border-white/10' 
              : 'bg-white text-gray-800 border-gray-200'
          } border shadow-lg`}
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <div className="ml-2">
          <ThemeToggle />
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 h-screen ${
          theme === 'dark' 
            ? 'bg-[#0f1020] border-white/10 text-gray-200' 
            : 'bg-white border-gray-200 text-gray-800'
        } border-r flex flex-col transition-all duration-300 ease-in-out z-40 ${
          mobileOpen && isMobileView() ? 'w-64' : isCollapsed ? 'w-18' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-shrink-0 flex items-center justify-between h-16 px-4 border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className={`${!isCollapsed ? 'ml-2' : ''} hidden lg:block`}>
                  <ThemeToggle />
                </div>
                {!isCollapsed && (
                  <Link to="/" className="flex items-center">
                             <div className="p-2">
                               <img 
                                 src={theme === 'dark' ? darkLogo : lightLogo} 
                                 alt="Clurst Logo" 
                                 className="h-50 w-auto"
                               />
                             </div>
                           </Link>
                )}
              </div>
             
            </div>
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
                        ? 'bg-gradient-to-r from-[#5d3be6] via-[#7b5fff] to-[#9a7dff] text-white'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:bg-[#1a1b2e]' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.isLogout ? 'text-red-500' : ''}`} />
                    {!isCollapsed || (mobileOpen && isMobileView()) ? (
                      <span className={`ml-3 ${item.isLogout ? 'text-red-500' : ''}`}>
                        {item.name}
                      </span>
                    ) : null}
                    {!isCollapsed && item.count && !item.isLogout ? (
                      <span className="ml-auto bg-[#2d2d47] text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Removed Profile Section */}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={closeMobileSidebar} />
      )}
    </>
  );
};

export default SideNav;
