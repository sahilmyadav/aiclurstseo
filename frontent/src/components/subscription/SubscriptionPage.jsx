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
      setLoading(true);

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
      setLoading(false);
    }
  };

  const remainingDays = getRemainingTrialDays();


  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600">
            Scale your social media presence with powerful automation tools
          </p>
        </div>

        {/* Trial Status */}
        {trialData && remainingDays > 0 ? (
          // Active Trial Progress
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Free Trial Active</h3>
                <p className="text-sm text-gray-600">
                  Your 14-day free trial is currently active.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{remainingDays}</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${(remainingDays / 14) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : trialData && remainingDays === 0 ? (
          // Trial Expired
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Free Trial Used</h3>
                <p className="text-sm text-gray-600">
                  Your 14-day free trial has expired. Please choose a subscription plan below.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-500">0</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-gray-400 rounded-full h-2 w-full"></div>
            </div>
          </div>
        ) : trialEligible ? (
          // Trial Available
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center">
                  <FiStar className="w-4 h-4 mr-1" />
                  14-Day Free Trial
                </h3>
                <p className="text-sm opacity-90">No credit card required</p>
              </div>
              <button
                onClick={handleTrial}
                disabled={loading}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Trial"}
              </button>
            </div>
          </div>
        ) : (
          // Trial Not Available (Never Used)
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Free Trial Used</h3>
                <p className="text-sm text-gray-600">
                  Your 14-day free trial has expired. Please choose a subscription plan below.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-500">0</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-gray-400 rounded-full h-2 w-full"></div>
            </div>
          </div>
        )}

        {/* Compact Profile Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiUsers className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="font-medium">Profiles:</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setProfiles(Math.max(1, profiles - 1))}
                disabled={profiles <= 1}
                className={`p-2 rounded-full ${
                  profiles <= 1 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold min-w-[60px] text-center">
                {profiles}
              </div>
              <button
                onClick={() => setProfiles(profiles + 1)}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Plan */}
          <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly</h3>
                  <p className="text-sm text-gray-600">Perfect for getting started</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    ${(monthlyPrice * profiles).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">/month</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  "Unlimited posts",
                  "Analytics dashboard", 
                  "Team collaboration",
                  "24/7 support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Get Started"}
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-lg shadow border-2 border-green-200 hover:shadow-md transition-shadow relative">
            {/* Popular Badge */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              SAVE 50%
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Yearly</h3>
                  <p className="text-sm text-gray-600">Best value</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${(yearlyPrice * profiles).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">/year</div>
                  <div className="text-xs text-green-600 font-medium">
                    Save ${((monthlyPrice * 12 - yearlyPrice) * profiles).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  "Everything in Monthly",
                  "AI content generation",
                  "Custom branding",
                  "Dedicated manager"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe("yearly")}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Get 50% Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Questions? <a href="mailto:support@example.com" className="text-indigo-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
