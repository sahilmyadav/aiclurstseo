import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const lightLogo = '/clurst transparent logo 2 for white baground.png';
const darkLogo = '/clurst transparent logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#f7f8fc] text-gray-900 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between md:justify-around gap-6 items-center h-12">
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <div className="p-2">
              <img 
                src={lightLogo} 
                alt="Clurst Logo" 
                className="h-50 w-auto"
              />
            </div>
          </Link>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none text-gray-800 hover:text-purple-600"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {!isMenuOpen ? (
                <div className="space-y-1.5">
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-6 h-0.5 bg-current"></span>
                </div>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center justify-between md:justify-around gap-4 lg:gap-6 space-x-4 lg:space-x-6 font-medium text-gray-900">
            <Link 
              to="/" 
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
              activeClassName="text-purple-700 bg-purple-50"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
              activeClassName="text-purple-700 bg-purple-50"
            >
              About
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to={user?.role === 'admin' ? '/ad-dashboard' : '/dashboard'} 
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
                  activeClassName="text-purple-700 bg-purple-50"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/reviews" 
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
                  activeClassName="text-purple-700 bg-purple-50"
                >
                  Reviews
                </Link>
                <Link 
                  to="/seo-dashboard" 
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
                  activeClassName="text-purple-700 bg-purple-50"
                >
                  SEO
                </Link>
                <Link 
                  to="/analytics-dashboard" 
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-gray-900 hover:bg-purple-50 hover:text-purple-700"
                  activeClassName="text-purple-700 bg-purple-50"
                >
                  Analytics
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="px-3 py-2 text-xs sm:text-sm rounded-lg bg-purple-100 text-purple-800">
                  {user?.name || user?.email || 'Account'}
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors duration-200 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer rounded-lg sm:rounded-xl border transition-colors duration-200 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity duration-200"
                >
                  Sign Up
                </Link>
                <div className="ml-2">
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 bg-white transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="pt-5 pb-6 px-5">
          <div className="flex items-center justify-between mb-8">
            <img 
              src={darkLogo} 
              alt="Clurst Logo" 
              className="h-12 w-auto"
              style={{ maxWidth: '180px' }}
            />
            <button 
              onClick={toggleMenu} 
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { name: 'Home', path: '/' },
              ...(isAuthenticated ? [{ name: 'Dashboard', path: user?.role === 'admin' ? '/ad-dashboard' : '/dashboard' }] : []),
              { name: 'Reviews', path: '/reviews' },
              { name: 'SEO', path: '/seo-dashboard' },
              { name: 'Analytics', path: '/analytics-dashboard' },
              ...(isAuthenticated ? [{ name: 'Settings', path: '/dashboard/settings' }] : []),
            ].map((item) => (
              <Link
                to={item.path}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200"
                onClick={closeMobileMenu}
                activeClassName="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30"
              >
                {item.name}
              </Link>
            ))}

{/* Auth Buttons for Mobile */}
            {!isAuthenticated && (
              <div className="space-y-2 px-4 pt-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-[#5d3be6] to-[#9a7dff] rounded-lg hover:opacity-90"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Logout Button for Mobile */}
            {isAuthenticated && user && (
              <div className="px-4 pt-2">
                <button
                  onClick={() => { 
                    closeMobileMenu();
                    logout(); 
                    navigate('/'); 
                  }}
                  className="w-full text-center px-4 py-3 text-base font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
