import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // Added ThemeContext import
import { FiCheck, FiPlus, FiMinus, FiStar, FiUsers, FiX, FiAlertTriangle } from "react-icons/fi";

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

  const { theme } = useTheme(); // Added theme hook

  console.log("TOKEN",token,"User",user)
  
  const [profiles, setProfiles] = useState(1);
  const [loading, setLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [dialogPlanType, setDialogPlanType] = useState('');
  const navigate = useNavigate();

  // Check if a plan is active
  const isPlanActive = (planType) => {
    if (!subscriptionData?.active) return false;
    return subscriptionData.planType === planType;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle plan button click
  const handlePlanClick = (planType) => {
    if (subscriptionData?.active && !isPlanActive(planType)) {
      setDialogPlanType(planType);
      setShowSubscriptionDialog(true);
      return false;
    }
    return true;
  };

  // Get display name for plan type
  const getPlanDisplayName = (planType) => {
    const planMap = {
      'daily': 'Daily',
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'trial': 'Free Trial'
    };
    return planMap[planType] || planType;
  };

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
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gray-50'}`}>
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
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Error</h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Unable to load user information. Please try logging in again.</p>
          <button 
            onClick={() => navigate('/login')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
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
      discountPercent,
      isActive: isPlanActive(type)
    };
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
      alert(`You Already have an active subscription. Please refresh the page .`);
      // Reset loading state for specific plan
      setMonthlyLoading(false);
      setYearlyLoading(false);
      setDailyLoading(false);
    }
  };

  const remainingDays = getRemainingTrialDays();

  // Handle starting a new trial using the activateTrial from AuthContext
  const handleStartTrial = async () => {
    try {
      setLoading(true);
      const result = await activateTrial();
      console.log(result)
      if (result) {
        console.log('Trial started successfully');
        // Refresh subscription data
        await checkSubscriptionStatus(user?._id || user?.id, token);
      } else {
        console.error('Failed to start trial:', result.error);
        // alert(result.error || 'Failed to start trial. Please try again.');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('An error occurred while starting your trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' : 'text-purple-600'}`}>
            Choose Your Plan
          </h1>
          <p className={`text-sm max-w-xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Scale your social media presence with powerful automation tools and AI-driven insights
          </p>
        </div>

        {/* Trial Status */}
        {(() => {
          // Case 1: User has an active trial
          if (subscriptionData?.status === 'active' && trialData && remainingDays > 0) {
            return (
              <div className={`rounded-2xl shadow-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-green-900/50' : 'bg-white border border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      Free Trial Active
                    </h3>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Your 14-day free trial is currently active. Enjoy all premium features!
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent' : 'text-purple-600'}`}>
                      {remainingDays}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>days left</div>
                  </div>
                </div>
                <div className={`rounded-full h-3 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className={`rounded-full h-3 transition-all duration-500 shadow-sm ${theme === 'dark' ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-purple-500'}`}
                    style={{ width: `${(remainingDays / 14) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          }
          
          // Case 2: User is eligible for a trial but hasn't started one
          if (trialEligible && (!subscriptionData || !subscriptionData.planType)) {
            return (
              <div className={`rounded-2xl shadow-xl p-6 mb-8 relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'}`}>
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm' : 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 backdrop-blur-sm'}`}></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      <FiStar className="mr-2 text-yellow-300" />
                      Start Your Free Trial
                    </h3>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-blue-100' : 'text-purple-100'}`}>
                      Get 14 days of premium features for free. No credit card required.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartTrial()}
                    className={`font-medium px-5 py-2 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white text-purple-600 hover:bg-purple-50'}`}
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            );
          }
          
          // Case 3: Trial has expired
          if (subscriptionData?.planType === 'trial' && remainingDays <= 0) {
            return (
              <div className={`rounded-2xl shadow-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-red-900/50' : 'bg-white border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      Trial Expired
                    </h3>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Your 14-day free trial has ended. Choose a plan to continue enjoying premium features.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>Expired</div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Case 4: User has an active paid subscription
          if (subscriptionData?.active && subscriptionData.planType !== 'trial') {
            return (
              <div className={`rounded-2xl shadow-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-green-900/50' : 'bg-white border border-green-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      {subscriptionData.planType ? `${subscriptionData.planType.charAt(0).toUpperCase() + subscriptionData.planType.slice(1)} Plan Active` : 'Subscription Active'}
                    </h3>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Your subscription is active until {subscriptionData.endDate ? formatDate(subscriptionData.endDate) : 'further notice'}.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          
          // Default case: No active subscription or trial
          return null;
        })()}

        {/* Profile Selector */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}>
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Number of GMB Profiles</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Select how many Google Business profiles you want to manage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setProfiles(Math.max(1, profiles - 1))}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <FiMinus className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <div className={`w-16 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-purple-100'}`}>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' : 'text-purple-600'}`}>{profiles}</span>
              </div>
              <button
                onClick={() => setProfiles(profiles + 1)}
                className={`w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'}`}
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Plans loading / error */}
        {plansLoading && (
          <div className={`rounded-2xl shadow-lg p-4 mb-4 text-center ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Loading plans...
          </div>
        )}
        {plansError && (
          <div className={`rounded-2xl p-4 mb-4 text-center text-sm ${theme === 'dark' ? 'bg-red-900/60 border border-red-600 text-red-200' : 'bg-red-100 border border-red-300 text-red-700'}`}>
            {plansError}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Plan */}
          {getPlanByType("daily") && (
            <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${theme === 'dark' ? `bg-gray-800 border ${getPlanByType("daily").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'}` : `bg-white border ${getPlanByType("daily").isPopular ? 'border-purple-500 border-2' : 'border-gray-200'}`}`}>
              {/* Popular Badge */}
              {getPlanByType("daily").isPopular && (
                <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {getPlanByType("daily").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("daily").hasDiscount && (
                <div className={`absolute top-0 left-0 text-xs font-bold px-3 py-1 rounded-br-lg ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white'}`}>
                  SAVE {getPlanByType("daily").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getPlanByType("daily").name}
                </h3>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getPlanByType("daily").description}
                </p>
                
                <div className="my-6">
                  {getPlanByType("daily").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      ${(getPlanByType("daily").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${(getPlanByType("daily").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>/day</span>
                  </div>
                  {getPlanByType("daily").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`}>
                      Save {getPlanByType("daily").discountPercent}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("daily").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </div>
                  ))}
                </div>

                {getPlanByType("daily").isActive && (
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`}>
                    ACTIVE
                  </div>
                )}
                <button
                  onClick={() => handlePlanClick("daily") && handleSubscribe("daily")}
                  disabled={dailyLoading || getPlanByType("daily").isActive}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    getPlanByType("daily").isActive 
                      ? `${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 cursor-not-allowed'} text-white` 
                      : getPlanByType("daily").isPopular 
                        ? `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white` 
                        : `${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-green-600 hover:bg-green-700'} text-white`
                  }`}
                >
                  {dailyLoading 
                    ? 'Processing...' 
                    : getPlanByType("daily").isActive 
                      ? 'Current Plan' 
                      : getPlanByType("daily")?.buttonText || 'Get Started'}
                </button>
              </div>
            </div>
          )}

          {/* Monthly Plan */}
          {getPlanByType("monthly") && (
            <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${theme === 'dark' ? `bg-gray-800 border ${getPlanByType("monthly").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'}` : `bg-white border ${getPlanByType("monthly").isPopular ? 'border-purple-500 border-2' : 'border-gray-200'}`}`}>
              {/* Popular Badge */}
              {getPlanByType("monthly").isPopular && (
                <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {getPlanByType("monthly").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("monthly").hasDiscount && (
                <div className={`absolute top-0 left-0 text-xs font-bold px-3 py-1 rounded-br-lg ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white'}`}>
                  SAVE {getPlanByType("monthly").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getPlanByType("monthly").name}
                </h3>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getPlanByType("monthly").description}
                </p>
                
                <div className="my-6">
                  {getPlanByType("monthly").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      ${(getPlanByType("monthly").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${(getPlanByType("monthly").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                  </div>
                  {getPlanByType("monthly").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`}>
                      Save {getPlanByType("monthly").discountPercent}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("monthly").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </div>
                  ))}
                </div>

                {getPlanByType("monthly").isActive && (
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`}>
                    ACTIVE
                  </div>
                )}
                <button
                  onClick={() => handlePlanClick("monthly") && handleSubscribe("monthly")}
                  disabled={monthlyLoading || getPlanByType("monthly").isActive}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    getPlanByType("monthly").isActive 
                      ? `${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 cursor-not-allowed'} text-white` 
                      : getPlanByType("monthly").isPopular 
                        ? `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white` 
                        : `${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-green-600 hover:bg-green-700'} text-white`
                  }`}
                >
                  {monthlyLoading 
                    ? 'Processing...' 
                    : getPlanByType("monthly").isActive 
                      ? 'Current Plan' 
                      : getPlanByType("monthly")?.buttonText || 'Get Started'}
                </button>
              </div>
            </div>
          )}

          {/* Yearly Plan */}
          {getPlanByType("yearly") && (
            <div className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${theme === 'dark' ? `bg-gray-800 border ${getPlanByType("yearly").isPopular ? 'border-blue-500 border-2' : 'border-gray-700'}` : `bg-white border ${getPlanByType("yearly").isPopular ? 'border-purple-500 border-2' : 'border-gray-200'}`}`}>
              {/* Popular Badge */}
              {getPlanByType("yearly").isPopular && (
                <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {getPlanByType("yearly").badgeText || 'POPULAR'}
                </div>
              )}
              
              {/* Discount Badge */}
              {getPlanByType("yearly").hasDiscount && (
                <div className={`absolute top-0 left-0 text-xs font-bold px-3 py-1 rounded-br-lg ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white'}`}>
                  SAVE {getPlanByType("yearly").discountPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getPlanByType("yearly").name}
                </h3>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getPlanByType("yearly").description}
                </p>

                <div className="my-6">
                  {getPlanByType("yearly").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      ${(getPlanByType("yearly").originalPricePerProfile * profiles).toFixed(2)}
                    </span>
                  )}
                  <div className={`text-3xl font-bold my-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${(getPlanByType("yearly").discountedPricePerProfile * profiles).toFixed(2)}
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>/year</span>
                  </div>
                  {getPlanByType("yearly").hasDiscount && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`}>
                      Save {getPlanByType("yearly").discountPercent}% vs monthly
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {(getPlanByType("yearly").features || []).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </div>
                  ))}
                </div>

                {getPlanByType("yearly").isActive && (
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`}>
                    ACTIVE
                  </div>
                )}
                <button
                  onClick={() => handlePlanClick("yearly") && handleSubscribe("yearly")}
                  disabled={yearlyLoading || getPlanByType("yearly").isActive}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    getPlanByType("yearly").isActive 
                      ? `${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400 cursor-not-allowed'} text-white` 
                      : getPlanByType("yearly").isPopular 
                        ? `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white` 
                        : `${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-green-600 hover:bg-green-700'} text-white`
                  }`}
                >
                  {yearlyLoading 
                    ? 'Processing...' 
                    : getPlanByType("yearly").isActive 
                      ? 'Current Plan' 
                      : (getPlanByType("yearly")?.buttonText || `Save ${getPlanByType("yearly")?.discountPercent}%`)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Questions? <a href="mailto:support@example.com" className={`hover:underline ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'}`}>Contact Support</a>
          </p>
        </div>
      </div>

      {/* Subscription Dialog */}
      {showSubscriptionDialog && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${theme === 'dark' ? 'bg-opacity-70' : 'bg-opacity-50'}`}>
          <div className={`rounded-2xl max-w-md w-full p-6 relative ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <button 
              onClick={() => setShowSubscriptionDialog(false)}
              className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiX className="w-6 h-6" />
            </button>
            
            <div className="flex items-start mb-6">
              <div className={`p-3 rounded-full mr-4 ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <FiAlertTriangle className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Active Subscription</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>You already have an active subscription.</p>
              </div>
            </div>
            
            <div className={`rounded-xl p-4 mb-6 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Current Plan Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Plan:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getPlanDisplayName(subscriptionData?.planType || '')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Status:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Active</span>
                </div>
                {subscriptionData?.startDate && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Start Date:</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(subscriptionData.startDate)}</span>
                  </div>
                )}
                {subscriptionData?.endDate && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Expires On:</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(subscriptionData.endDate)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`rounded-lg p-4 mb-6 ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-purple-100 border border-purple-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-purple-700'}`}>
                You cannot purchase a new subscription while you have an active plan. 
                Please wait until your current plan expires on {subscriptionData?.endDate ? formatDate(subscriptionData.endDate) : 'the expiry date'}.
              </p>
            </div>
            
            <button
              onClick={() => setShowSubscriptionDialog(false)}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;