import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiCheck, FiPlus, FiMinus, FiStar, FiUsers } from "react-icons/fi";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState(1);
  const [loading, setLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [trialEligible, setTrialEligible] = useState(true);
  const [trialMessage, setTrialMessage] = useState("");
  const [trialData, setTrialData] = useState(null); // For active trial info
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
          await verifySubscriptionStatus(userId);
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
  }, [user?._id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/subscription' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check trial eligibility and active trial status
  useEffect(() => {
    const checkTrialStatus = async () => {
      // Get user ID - handle both _id and id fields
      const userId = user?._id || user?.id;
      
      console.log('User object:', user);
      console.log('User ID for trial check:', userId);
      
      if (userId) {
        try {
          // Check trial eligibility
          const eligibilityResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE}/api/subscription/check-trial-eligibility/${userId}`
          );
          
          setTrialEligible(eligibilityResponse.data.eligible);
          if (!eligibilityResponse.data.eligible) {
            setTrialMessage(eligibilityResponse.data.reason);
          }

          // Check for active trial
          try {
            const subscriptionResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE}/api/subscription/verify?userId=${userId}`
            );
            console.log('Subscription response:', subscriptionResponse);
            
            if (subscriptionResponse.data.active && subscriptionResponse.data.planType === 'trial') {
              setTrialData({
                endDate: new Date(subscriptionResponse.data.endDate),
                planType: subscriptionResponse.data.planType
              });
            } else {
              setTrialData(null);
            }
          } catch (subError) {
            setTrialData(null);
          }
        } catch (error) {
          console.error('Error checking trial eligibility:', error);
          setTrialEligible(false);
          setTrialMessage("Unable to check trial eligibility");
        }
      } else {
        console.log('No user ID found, user not loaded yet');
        setTrialEligible(false);
        setTrialMessage("User not loaded");
      }
    };

    checkTrialStatus();
  }, [user]);

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

  const monthlyPrice = 99;
  const yearlyPrice = 599;

  // Helper function to calculate remaining trial days based on endDate
  const getRemainingTrialDays = () => {
    if (!trialData?.endDate) return 0;
    
    const now = new Date();
    const endDate = new Date(trialData.endDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return remaining days (0 if expired)
    return Math.max(0, diffDays);
  };

  // Trial Activation
  const handleTrial = async () => {
    // Get user ID - handle both _id and id fields
    const userId = user?._id || user?.id;
    
    if (!userId) {
      alert("User not found. Please try logging in again.");
      return;
    }

    if (!trialEligible) {
      alert(trialMessage || "You are not eligible for a free trial.");
      return;
    }

    try {
      setLoading(true);
      console.log('Starting trial for user ID:', userId);
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/subscription/start-trial`, 
        {
          userId: userId,
        }
      );
      
      alert(res.data.message || "14-day trial activated!");
      
      // Update trial eligibility after successful activation
      setTrialEligible(false);
      setTrialMessage("Trial has been used");
      
      // Set trial data from response
      if (res.data.endDate) {
        setTrialData({
          endDate: new Date(res.data.endDate),
          planType: 'trial'
        });
      }
      
      // Optionally redirect to dashboard
      // navigate('/dashboard');
    } catch (error) {
      console.error('Trial activation error:', error);
      const errorMessage = error.response?.data?.message || "Failed to start trial.";
      alert(errorMessage);
      
      // If trial was already used, update the UI
      if (error.response?.status === 400) {
        setTrialEligible(false);
        setTrialMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify subscription status
  const verifySubscriptionStatus = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE}/api/subscription/verify/${userId}`
      );
      
      if (response.data.active) {
        alert(`🎉 Subscription activated successfully!\nPlan: ${response.data.planType}\nProfiles: ${response.data.profiles}`);
        // You can update the UI or redirect as needed
        window.location.reload();
      } else {
        console.log('Subscription not active yet, will be activated shortly...');
        // Retry after 5 seconds if not active yet
        setTimeout(() => verifySubscriptionStatus(userId), 5000);
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      // Retry on error
      setTimeout(() => verifySubscriptionStatus(userId), 5000);
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
      }

      // Get user ID - handle both _id and id fields
      const userId = user?._id || user?.id;

      if (!isAuthenticated || !userId) {
        navigate('/login', { state: { from: '/subscription' } });
        return;
      }

      if (!['monthly', 'yearly'].includes(planType)) {
        throw new Error('Invalid plan type');
      }

      if (isNaN(profiles) || profiles < 1) {
        throw new Error('Invalid number of profiles');
      }

      const requestData = {
        userId: userId,
        planType,
        profiles: Number(profiles)
      };

      console.log('Sending request with:', requestData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/subscription/create-checkout-session`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Response:', response.data);
      
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

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Monthly</h3>
                  <p className="text-gray-300 mt-1">Perfect for getting started</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ${(monthlyPrice * profiles).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">/month</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Unlimited posts",
                  "Analytics dashboard", 
                  "Team collaboration",
                  "24/7 support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={monthlyLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {monthlyLoading ? "Processing..." : "Get Started"}
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gray-800 rounded-2xl shadow-xl border-2 border-emerald-600 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-400"></div>
            {/* Popular Badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              SAVE 50%
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Yearly</h3>
                  <p className="text-gray-300 mt-1">Best value</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    ${(yearlyPrice * profiles).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">/year</div>
                  <div className="text-sm bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-semibold">
                    Save ${((monthlyPrice * 12 - yearlyPrice) * profiles).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Everything in Monthly",
                  "AI content generation",
                  "Custom branding",
                  "Dedicated manager"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mr-3">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe("yearly")}
                disabled={yearlyLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {yearlyLoading ? "Processing..." : "Get 50% Off"}
              </button>
            </div>
          </div>
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
