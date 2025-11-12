import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for successful payment redirection
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      
      if (sessionId && user?._id) {
        try {
          setLoading(true);
          // Wait a moment for the webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          await verifySubscriptionStatus(user._id);
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

  // Show loading state while checking auth
  if (authLoading) {
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

  const monthlyPrice = 99;
  const yearlyPrice = 599;

  // Trial Activation
  const handleTrial = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/subscription/start-trial", {
        userId: user._id,
      });
      alert(res.data.message || "14-day trial activated!");
    } catch (error) {
      console.error(error);
      alert("Failed to start trial.");
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

      if (!isAuthenticated || !user?.id) {
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
        userId: user.id,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Section - 14 Day Free Trial */}
      <div className="text-center bg-indigo-600 text-white py-8 rounded-xl shadow-md mb-10">
        <h2 className="text-2xl font-semibold mb-2">
          Claim your 14-Day Free Trial 🎉
        </h2>
        <p className="text-sm mb-4">
          No credit card required — experience full access before subscribing.
        </p>
        <button
          onClick={handleTrial}
          disabled={loading}
          className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          {loading ? "Processing..." : "Activate Free Trial"}
        </button>
      </div>

      {/* Profiles Selector */}
      <div className="flex justify-center mb-8">
        <label className="text-lg font-medium mr-3">Number of Profiles:</label>
        <input
          type="number"
          min="1"
          value={profiles}
          onChange={(e) => setProfiles(Number(e.target.value))}
          className="border rounded-md w-20 text-center py-1"
        />
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <div className="bg-white shadow-lg p-8 rounded-2xl text-center border border-gray-200 hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold mb-3 text-indigo-600">
            Monthly Plan
          </h3>
          <p className="text-gray-500 mb-4">$99/month per profile</p>
          <p className="text-3xl font-bold mb-6">
            ${(monthlyPrice * profiles).toFixed(2)} / month
          </p>
          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Redirecting..." : "Subscribe Now"}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="bg-white shadow-lg p-8 rounded-2xl text-center border border-gray-200 hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold mb-3 text-green-600">
            Yearly Plan <span className="text-sm text-gray-400">(50% OFF)</span>
          </h3>
          <p className="text-gray-500 mb-4">$599/year per profile</p>
          <p className="text-3xl font-bold mb-6">
            ${(yearlyPrice * profiles).toFixed(2)} / year
          </p>
          <button
            onClick={() => handleSubscribe("yearly")}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Redirecting..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
