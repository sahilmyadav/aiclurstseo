import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const verify = searchParams.get('verify');
      
      if (sessionId && verify === 'true') {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE}/api/subscription/verify?sessionId=${sessionId}`
          );
          
          if (response.data.active) {
            setSubscription(response.data);
          } else {
            setError('Payment verification failed. Please try again.');
          }
        } catch (err) {
          console.error('Error verifying payment:', err);
          setError(err.response?.data?.error || 'Failed to verify payment. Please contact support.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Invalid verification parameters');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg text-gray-700">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/subscription')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Subscription
        </button>
      </div>
    );
  }

  if (subscription?.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your subscription has been activated successfully.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium capitalize">{subscription.planType}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Profiles:</span>
              <span className="font-medium">{subscription.profiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valid Until:</span>
              <span className="font-medium">
                {new Date(subscription.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Subscription Status</h1>
        <p className="text-gray-600 mb-6">Unable to verify subscription status. Please check your account or contact support.</p>
        <button
          onClick={() => navigate('/subscription')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Subscription
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
