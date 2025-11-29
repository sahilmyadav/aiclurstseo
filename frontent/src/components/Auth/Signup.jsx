import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, signupWithGoogle, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: "" });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, phone, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long' });
      return;
    }

    const { success, error, message } = await signup({ username, email, password, phone });
    if (success) {
      setAlert({ type: 'success', message: message || 'Account created successfully!' });
      setTimeout(() => navigate('/dashboard'), 1200);
    } else if (error) {
      setAlert({ type: 'error', message: error });
    }
  };

  const handleGoogleSignup = async () => {
    setAlert({ type: null, message: "" });

    const { success, error, message } = await signupWithGoogle();
    
    if (success) {
      toast.success(message || 'Welcome! Account created successfully!');
      setAlert({ type: 'success', message: message || 'Account created successfully!' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else if (error) {
      // Handle specific Firebase error codes
      if (error.includes('popup-closed-by-user')) {
        setAlert({ type: 'error', message: 'Sign-up cancelled by user' });
      } else if (error.includes('popup-blocked')) {
        setAlert({ type: 'error', message: 'Popup blocked. Please allow popups and try again.' });
      } else {
        setAlert({ type: 'error', message: error });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white px-4 pt-24 pb-12">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Left Side - Content */}
          <div className="w-full lg:w-1/2 max-w-2xl text-center lg:text-left lg:pr-12">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase mb-4">Create Account</h2>
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-6">
                Join Clurst AI
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Unlock the full potential of your online presence with our powerful tools and analytics. 
                Create your account today and take control of your digital success.
              </p>
              <div className="hidden lg:block space-y-4 mt-12">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Powerful Analytics Dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">AI-Powered Insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">24/7 Customer Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md bg-[#181818] rounded-xl shadow-2xl p-8 space-y-4 mt-10 lg:mt-0">
            {alert.type && (
              <div className={`w-full px-4 py-3 rounded-lg text-sm ${alert.type === 'success' ? 'bg-green-500/15 text-green-300 border border-green-600/40' : 'bg-red-500/15 text-red-300 border border-red-600/40'}`}>
                {alert.message}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-700 w-full"></div>
                <span className="px-3 bg-[#181818] text-gray-400 text-sm">OR</span>
                <div className="border-t border-gray-700 w-full"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <FcGoogle className="text-xl" />
                {isLoading ? 'Signing up with Google...' : 'Sign up with Google'}
              </button>

              <p className="text-center text-gray-400 text-sm mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;