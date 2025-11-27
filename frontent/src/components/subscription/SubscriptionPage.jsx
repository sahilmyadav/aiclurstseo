import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiCheck, FiPlus, FiMinus, FiStar, FiUsers } from "react-icons/fi";

const SubscriptionPage = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading,
    token,
    // Subscription-related values from AuthContext
    subscriptionData, 
    trialEligible, 
    trialMessage, 
    trialData, 
    subscriptionLoading, 
    subscriptionError,
    checkSubscriptionStatus, 
    activateTrial, 
    getRemainingTrialDays,
    // Plans from AuthContext
    plans,
    plansLoading,
    plansError,
  } = useAuth();
  
  const [profiles, setProfiles] = useState(1);
  const [loading, setLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const navigate = useNavigate();

  // Check for successful payment redirection
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      
      const userId = user?._id || user?.id;
      if (sessionId && userId) {
        try {
          setLoading(true);
          // Wait a moment for the webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          await checkSubscriptionStatus(userId, token);
        } catch (error) {
          console.error('Error checking payment status:', error);
        } finally {
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
        }
      }
    };

    checkPaymentStatus();
  }, [user?._id, checkSubscriptionStatus, token]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/subscription' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading state while checking auth or user not loaded
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated after loading, show nothing (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  // Ensure user has an ID
  const userId = user._id || user.id;
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Error</h2>
          <p className="text-gray-600 mb-4">Unable to load user information. Please try logging in again.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getPlanByType = (type) => {
    const plan = plans.find((p) => p.planType === type && p.isActive !== false);
    if (!plan) return null;
    
    // Calculate discounted price if discount is available
    const discountPercent = plan.discountPercent || 0;
    const hasDiscount = discountPercent > 0;
    const originalPrice = plan.pricePerProfile || 0;
    const discountedPrice = hasDiscount 
      ? originalPrice * (1 - (discountPercent / 100))
      : originalPrice;
    
    return {
      ...plan,
      originalPricePerProfile: originalPrice,
      discountedPricePerProfile: discountedPrice,
      hasDiscount,
      discountPercent
    };
  };

  // Trial Activation
  const handleTrial = async () => {
    const userId = user?._id || user?.id;
    
    if (!userId) {
      alert("User not found. Please try logging in again.");
      return;
    }

    try {
      setLoading(true);
      const res = await activateTrial(userId, token);
      
      alert(res.data.message || "14-day trial activated!");
      
      // Optionally redirect to dashboard
      // navigate('/dashboard');
    } catch (error) {
      alert(error.message || "Failed to activate trial");
    } finally {
      setLoading(false);
    }
  };

  // Stripe Payment
  const handleSubscribe = async (planType) => {
    try {
      // Set loading state for specific plan
      if (planType === 'monthly') {
        setMonthlyLoading(true);
      } else if (planType === 'yearly') {
        setYearlyLoading(true);
      } else if (planType === 'daily') {
        setDailyLoading(true);
      }

      // Get user ID - handle both _id and id fields
      const userId = user?._id || user?.id;

      if (!isAuthenticated || !userId) {
        navigate('/login', { state: { from: '/subscription' } });
        return;
      }

      if (!['daily', 'monthly', 'yearly'].includes(planType)) {
        throw new Error('Invalid plan type');
      }

      if (isNaN(profiles) || profiles < 1) {
        throw new Error('Invalid number of profiles');
      }

      // Only send planType and profiles to backend
      const requestData = {
        planType,
        profiles: Number(profiles)
      };

      console.log('Sending request to create checkout session:', { planType, profiles });

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/subscription/create-checkout-session`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Checkout session created:', response.data);
      
      if (!response.data.url) {
        throw new Error('No checkout URL received from server');
      }

      // Store the session ID in localStorage to check after redirect
      if (response.data.sessionId) {
        localStorage.setItem('stripe_session_id', response.data.sessionId);
      }

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Subscription Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(`Error: ${error.message || 'Failed to process subscription'}`);
      // Reset loading state for specific plan
      setMonthlyLoading(false);
      setYearlyLoading(false);
      setDailyLoading(false);
    }
  };

  const remainingDays = getRemainingTrialDays();


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Choose Your Plan
          </h1>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Scale your social media presence with powerful automation tools and AI-driven insights
          </p>
        </div>

        {/* Trial Status */}
        {trialData && remainingDays > 0 ? (
          // Active Trial Progress
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  Free Trial Active
                </h3>
                <p className="text-gray-300 mt-1">
                  Your 14-day free trial is currently active.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{remainingDays}</div>
                <div className="text-sm text-gray-400">days left</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full h-3 transition-all duration-500 shadow-sm"
                style={{ width: `${(remainingDays / 14) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : trialData && remainingDays === 0 ? (
          // Trial Expired
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Free Trial Used</h3>
                <p className="text-gray-300 mt-1">
                  Your 14-day free trial has expired. Please choose a subscription plan below.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-500">0</div>
                <div className="text-sm text-gray-400">days left</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-full h-3">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full h-3 w-full"></div>
            </div>
          </div>
        ) : trialEligible ? (
          // Trial Available
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl shadow-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  <FiStar className="w-6 h-6 mr-2 text-yellow-400" />
                  14-Day Free Trial
                </h3>
                <p className="text-blue-100 mt-1">No credit card required • Full access</p>
              </div>
              <button
                onClick={handleTrial}
                disabled={loading}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Starting..." : "Start Free Trial"}
              </button>
            </div>
          </div>
        ) : (
          // Trial Not Available
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Free Trial Used</h3>
                <p className="text-gray-300 mt-1">
                  Your 14-day free trial has expired. Please choose a subscription plan below.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-500">0</div>
                <div className="text-sm text-gray-400">days left</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-full h-3">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full h-3 w-full"></div>
            </div>
          </div>
        )}

        {/* Profile Selector */}
        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Number of Profiles</h3>
                <p className="text-sm text-gray-300">Select how many social media profiles you want to manage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setProfiles(Math.max(1, profiles - 1))}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiMinus className="w-5 h-5 text-gray-300" />
              </button>
              <div className="w-16 h-10 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{profiles}</span>
              </div>
              <button
                onClick={() => setProfiles(profiles + 1)}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Plans loading / error */}
        {plansLoading && (
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-4 mb-4 text-center text-gray-300">
            Loading plans...
          </div>
        )}
        {plansError && (
          <div className="bg-red-900/60 border border-red-600 text-red-200 rounded-2xl p-4 mb-4 text-center text-sm">
            {plansError}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Plan */}
          {getPlanByType("daily") && (
            <div className={`bg-gray-800 rounded-2xl shadow-xl border ${getPlanByType("daily").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'} hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
              {/* Popular Badge */}
              {getPlanByType("daily").isPopular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {getPlanByType("daily").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("daily").hasDiscount && (
                <div className="absolute top-0 left-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  SAVE {getPlanByType("daily").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">
                  {getPlanByType("daily").name}
                </h3>
                <p className="text-gray-300 mt-1">
                  {getPlanByType("daily").description}
                </p>
                
                <div className="my-6">
                  {getPlanByType("daily").hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      ${(getPlanByType("daily").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className="text-3xl font-bold text-white my-2">
                    ${(getPlanByType("daily").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className="text-sm text-gray-400">/day</span>
                  </div>
                  {getPlanByType("daily").hasDiscount && (
                    <span className="text-sm text-emerald-400">
                      Save {getPlanByType("daily").discountPercent}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("daily").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe("daily")}
                  disabled={dailyLoading}
                  className={`w-full ${getPlanByType("daily").isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
                >
                  {dailyLoading ? 'Processing...' : (getPlanByType("daily")?.buttonText || 'Get Started')}
                </button>
              </div>
            </div>
          )}

          {/* Monthly Plan */}
          {getPlanByType("monthly") && (
            <div className={`bg-gray-800 rounded-2xl shadow-xl border ${getPlanByType("monthly").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'} hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
              {/* Popular Badge */}
              {getPlanByType("monthly").isPopular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {getPlanByType("monthly").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("monthly").hasDiscount && (
                <div className="absolute top-0 left-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  SAVE {getPlanByType("monthly").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">
                  {getPlanByType("monthly").name}
                </h3>
                <p className="text-gray-300 mt-1">
                  {getPlanByType("monthly").description}
                </p>
                
                <div className="my-6">
                  {getPlanByType("monthly").hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      ${(getPlanByType("monthly").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className="text-3xl font-bold text-white my-2">
                    ${(getPlanByType("monthly").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                  {getPlanByType("monthly").hasDiscount && (
                    <span className="text-sm text-emerald-400">
                      Save {getPlanByType("monthly").discountPercent}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("monthly").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe("monthly")}
                  disabled={monthlyLoading}
                  className={`w-full ${getPlanByType("monthly").isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
                >
                  {monthlyLoading ? 'Processing...' : (getPlanByType("monthly")?.buttonText || 'Get Started')}
                </button>
              </div>
            </div>
          )}

          {/* Yearly Plan */}
          {getPlanByType("yearly") && (
            <div className={`bg-gray-800 rounded-2xl shadow-xl border ${getPlanByType("yearly").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'} hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
              {/* Popular Badge */}
              {getPlanByType("yearly").isPopular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {getPlanByType("yearly").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("yearly").hasDiscount && (
                <div className="absolute top-0 left-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  SAVE {getPlanByType("yearly").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">
                  {getPlanByType("yearly").name}
                </h3>
                <p className="text-gray-300 mt-1">
                  {getPlanByType("yearly").description}
                </p>

                <div className="my-6">
                  {getPlanByType("yearly").hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      ${(getPlanByType("yearly").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className="text-3xl font-bold text-white my-2">
                    ${(getPlanByType("yearly").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className="text-sm text-gray-400">/year</span>
                  </div>
                  {getPlanByType("yearly").hasDiscount && (
                    <span className="text-sm text-emerald-400">
                      Save {getPlanByType("yearly").discountPercent}% vs monthly
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("yearly").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe("yearly")}
                  disabled={yearlyLoading}
                  className={`w-full ${getPlanByType("yearly").isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-6 rounded-lg font-semibold transition-colors`}
                >
                  {yearlyLoading ? 'Processing...' : (getPlanByType("yearly")?.buttonText || `Save ${getPlanByType("yearly")?.discountPercent}%`)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            Questions? <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;