import React, { useEffect, useState } from 'react';
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
  const [activeDropdown, setActiveDropdown] = useState('');

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

  const navItems = [
    { name: 'Reviews', icon: Star, path: '/dashboard', active: location.pathname === '/dashboard' },
    { name: 'Get Reviews', icon: Send, path: '/dashboard/reviews', active: location.pathname === '/dashboard/reviews' },
    { name: 'Audit', icon: BarChart3, path: '/dashboard/audit', active: location.pathname === '/dashboard/audit' },
    { name: 'Review Link', icon: LinkIcon, path: '/dashboard/review-link', active: location.pathname === '/dashboard/review-link' },
    { name: 'Widgets', icon: LayoutGrid, path: '/dashboard/widgets', active: location.pathname === '/dashboard/widgets' },
    { name: 'Integrations', icon: GitBranch, path: '/dashboard/integrations', active: location.pathname === '/dashboard/integrations' },
    { name: 'Social Sharing', icon: Share2, path: '/dashboard/social-sharing', active: location.pathname === '/dashboard/social-sharing' },
    { name: 'Notifications', icon: BellRing, path: '/dashboard/notifications', active: location.pathname === '/dashboard/notifications' },
  ];

  const otherItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Logout', icon: LogOut, path: '#' },
  ];

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

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="pt-4">
                <div className={!isCollapsed ? 'px-4' : 'px-2'}>
                  {!isCollapsed || (mobileOpen && isMobileView()) ? (
                    <div className="text-xs uppercase text-gray-500 font-medium mb-3 px-4">Others</div>
                  ) : null}
                  <div className="space-y-1 mb-4">
                    {otherItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={(e) => handleNavClick(e, item)}
                        className={`flex items-center gap-3 rounded-lg text-sm text-gray-300 hover:bg-[#1a1b2e] transition-colors ${
                          isCollapsed && !(mobileOpen && isMobileView()) ? 'justify-center p-3' : 'px-4 py-3'
                        }`}
                        title={item.name}
                      >
                        <item.icon size={18} className="text-gray-400 flex-shrink-0" />
                        {!isCollapsed || (mobileOpen && isMobileView()) ? (
                          <span className="truncate">{item.name}</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-4 bg-[#0f1020]">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#1a1b2e] cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getUserInitials()}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                )}
                {!isCollapsed && <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </div>
            </div>
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
