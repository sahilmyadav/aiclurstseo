import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const logoPath = '/logo png[1].png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white shadow-md py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between md:justify-around gap-6 items-center h-12">
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <img src={logoPath} alt="Logo" className="h-10 w-auto" />
          </Link>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none text-gray-800 hover:text-indigo-600"
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

          <div className="hidden md:flex items-center justify-between md:justify-around gap-4 lg:gap-10 space-x-4 lg:space-x-8 font-medium">
            <Link to="/" className="text-sm font-normal text-black hover:text-indigo-600">Home</Link>
            <Link to="/dashboard" className="text-sm font-normal text-black hover:text-indigo-600">Dashboard</Link>
            <Link to="/reviews" className="text-sm font-normal text-black hover:text-indigo-600">Reviews</Link>
            <Link to="/seo-dashboard" className="text-sm font-normal text-black hover:text-indigo-600">SEO</Link>
            <Link to="/analytics-dashboard" className="text-sm font-normal text-black hover:text-indigo-600">Analytics</Link>
            {isAuthenticated && <Link to="/dashboard/settings" className="text-sm font-normal text-black hover:text-indigo-600">Settings</Link>}

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="px-3 py-2 text-xs sm:text-sm rounded-lg bg-black/5 text-black">
                  {user?.name || user?.email || 'Account'}
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-black text-black hover:bg-black/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer rounded-lg sm:rounded-xl border border-black text-black hover:bg-black/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer bg-gradient-to-r from-[#5d3be6] to-[#9a7dff] text-white rounded-lg sm:rounded-xl hover:opacity-90"
                >
                  Sign Up
                </Link>
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
            <div className="flex items-center">
              <img src={logoPath} alt="Logo" className="w-auto h-10" />
            </div>
            <button onClick={toggleMenu} className="text-black hover:text-indigo-600 focus:outline-none">
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { name: 'Home', path: '/' },
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Reviews', path: '/reviews' },
              { name: 'SEO', path: '/seo-dashboard' },
              { name: 'Analytics', path: '/analytics-dashboard' },
              ...(isAuthenticated ? [{ name: 'Settings', path: '/dashboard/settings' }] : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
              {isAuthenticated && user ? (
                <>
                  <div className="block w-full text-center px-4 py-3 text-gray-800 rounded-lg bg-gray-100">
                    {user?.name || user?.email || 'Account'}
                  </div>
                  <button
                    onClick={() => { closeMobileMenu(); logout(); navigate('/'); }}
                    className="block w-full text-center px-4 py-3 border cursor-pointer border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 border cursor-pointer border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#5d3be6] to-[#9a7dff] cursor-pointer text-white rounded-lg hover:opacity-90"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
