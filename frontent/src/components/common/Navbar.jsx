import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const lightLogo = '/clurst transparent logo 2 for white baground.png';
const darkLogo = '/clurst transparent logo.png';

const NAV_SECTIONS = [
  { label: 'Features', id: 'features' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'FAQ', id: 'faq' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(p => !p);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const scrollToSection = (id) => {
    closeMobileMenu();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const linkCls = 'text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-purple-50 hover:text-purple-700 text-gray-900 cursor-pointer';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#f7f8fc] text-gray-900 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <div className="p-2">
              <img src={lightLogo} alt="Clurst Logo" className="h-50 w-auto" />
            </div>
          </Link>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="p-2 rounded-md text-gray-800 hover:text-purple-600" aria-label="Toggle menu">
              {!isMenuOpen ? (
                <div className="space-y-1.5">
                  <span className="block w-6 h-0.5 bg-current" />
                  <span className="block w-6 h-0.5 bg-current" />
                  <span className="block w-6 h-0.5 bg-current" />
                </div>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)} className={linkCls}>
                {s.label}
              </button>
            ))}

            {isAuthenticated && user && (
              <>
                <Link to={user.role === 'admin' ? '/ad-dashboard' : '/dashboard'} className={linkCls}>
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="px-3 py-2 text-xs rounded-lg bg-purple-100 text-purple-800">
                  {user.name || user.email || 'Account'}
                </div>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-5 py-2 text-sm font-medium rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:opacity-90 transition-opacity">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 bg-white transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="pt-5 pb-6 px-5">
          <div className="flex justify-end mb-8">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {NAV_SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)}
                className="block w-full text-left px-4 py-3 text-base font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                {s.label}
              </button>
            ))}
            {isAuthenticated && (
              <Link to={user?.role === 'admin' ? '/ad-dashboard' : '/dashboard'} onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                Dashboard
              </Link>
            )}
            {!isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={closeMobileMenu} className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Login</Link>
                <Link to="/signup" onClick={closeMobileMenu} className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:opacity-90">Sign Up</Link>
              </div>
            ) : (
              <button onClick={() => { closeMobileMenu(); logout(); navigate('/'); }}
                className="w-full text-center px-4 py-3 text-base font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
