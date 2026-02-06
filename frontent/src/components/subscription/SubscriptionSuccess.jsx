import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get the session ID from the URL
      const sessionId = searchParams.get('sessionId');
      const verify = searchParams.get('verify');
      
      // console.log('URL Params:', { sessionId, verify }); // Debug log
      
      if (sessionId && verify === 'true') {
        try {
          // Get user ID from localStorage if available
          const user = JSON.parse(localStorage.getItem('user'));
          const userId = user?._id;
          
          // Build the query string with available parameters
          const params = new URLSearchParams({
            sessionId,
            ...(userId && { userId }) // Only add userId if it exists
          });
          
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE}/api/subscription/verify?${params.toString()}`,
            { withCredentials: true }
          );
          // console.log("Sucess message",response)
          if (response.data.active) {
            // Set the subscription data from the nested subscription object
            setSubscription(response.data.subscription);
            // Save order ID in a separate state
            if (response.data.subscription?.id) {
              setOrderId(response.data.subscription.id);
            }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 p-6 rounded-xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            Back to Subscription
          </button>
        </div>
      </div>
    );
  }

  if (subscription) {
    // Only use available data
    const planName = subscription.planType ? 
      `${subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan` : 'Subscription';
    
    // Format dates only if they exist
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        return 'Invalid date';
      }
    };
    
    const endDate = subscription.endDate ? formatDate(subscription.endDate) : null;
    const startDate = subscription.startDate ? formatDate(subscription.startDate) : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Order Confirmed!</h1>
            <p className="text-indigo-400 mt-2">Order ID: {orderId || subscription?.id || subscription?._id || 'N/A'}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{planName}</h3>
                    {subscription.profiles && (
                      <p className="text-sm text-gray-400">
                        {subscription.profiles} Profile{subscription.profiles > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {subscription.amount && (
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: subscription.currency || 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(subscription.amount / 100)}
                    </span>
                  )}
                </div>
                
                {subscription.amount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span>
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: subscription.currency || 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(subscription.amount / 100)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax</span>
                      <span>
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: subscription.currency || 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(0)}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-indigo-400">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: subscription.currency || 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(subscription.amount / 100)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-gray-900/30">
              <h3 className="font-medium mb-3">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Plan Type</p>
                  <p className="font-medium capitalize">{subscription.planType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="font-medium capitalize text-green-400">
                    {subscription.status || 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Profiles</p>
                  <p className="font-medium">{subscription.profiles || 1}</p>
                </div>
                <div>
                  <p className="text-gray-400">Price per Profile</p>
                  <p className="font-medium">${subscription.pricePerProfile || 0}/mo</p>
                </div>
                <div>
                  <p className="text-gray-400">Start Date</p>
                  <p className="font-medium">{startDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">
                    {subscription.status === 'active' ? 'Next Billing Date' : 'End Date'}
                  </p>
                  <p className="font-medium">{endDate || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-gray-700">
                  <p className="text-gray-400">Total Amount</p>
                  <p className="text-xl font-bold text-indigo-400">
                    ${subscription.totalPrice || 0}/mo
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Download Invoice
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help? <a href="#" className="text-indigo-400 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for invalid subscription
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Subscription Status</h1>
        <p className="text-gray-400 mb-6">
          We couldn't verify your subscription status. Please check your account or contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/subscription')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Subscription
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
