import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Billing = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get userId from URL params (for admin view) or use current user's ID
  const userIdFromParams = searchParams.get('userId');
  const isAdminView = !!userIdFromParams && user?.role === 'admin';
  const targetUserId = userIdFromParams || user?._id || user?.id;
  
  const [userData, setUserData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if we have a token before fetching data
    if (!token) {
      setError('Authentication token not available. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the base URL from environment variables or default to localhost
        const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        
        // Fetch user data (either current user or specified user for admin)
        try {
          const userResponse = await axios.get(
            `${baseURL}/api/auth/user/${targetUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setUserData(userResponse.data);
        } catch (userError) {
          console.warn('Could not fetch user data:', userError);
          // Set minimal user data if we can't fetch it
          setUserData({
            id: targetUserId,
            name: 'Unknown User',
            email: 'Unknown',
            role: 'user'
          });
        }
        
        // Fetch subscription data for the user
        try {
          const subscriptionResponse = await axios.get(
            `${baseURL}/api/subscription/user/${targetUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setSubscriptionData(subscriptionResponse.data);
        } catch (subscriptionError) {
          console.warn('Could not fetch subscription data:', subscriptionError);
          // More detailed error logging
          if (subscriptionError.response) {
            console.error('Subscription API Error Response:', subscriptionError.response.status, subscriptionError.response.data);
          } else if (subscriptionError.request) {
            console.error('Subscription API No Response:', subscriptionError.request);
          } else {
            console.error('Subscription API Error:', subscriptionError.message);
          }
          setSubscriptionData(null);
        }
        
        // Fetch transaction history
        try {
          const transactionsResponse = await axios.get(
            `${baseURL}/api/subscription/transactions/${targetUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log('Raw transactions data:', transactionsResponse.data);
          
          // Validate and process transactions data
          let processedTransactions = [];
          if (Array.isArray(transactionsResponse.data)) {
            processedTransactions = transactionsResponse.data.map((transaction, index) => {
              // Ensure transaction has required fields
              return {
                ...transaction,
                _id: transaction._id || transaction.id || `transaction-${index}`,
                createdAt: transaction.createdAt || transaction.created || null,
                description: transaction.description || transaction.name || transaction.type || 'Subscription Payment',
                amount: transaction.amount || transaction.amountInUSD || (transaction.amountInCents ? transaction.amountInCents / 100 : null) || transaction.total || transaction.price || 0,
                status: transaction.status || transaction.paymentStatus || 'unknown'
              };
            });
          }
          
          console.log('Processed transactions data:', processedTransactions);
          setTransactions(processedTransactions);
        } catch (transactionError) {
          console.warn('Could not fetch transaction data:', transactionError);
          // More detailed error logging
          if (transactionError.response) {
            console.error('Transaction API Error Response:', transactionError.response.status, transactionError.response.data);
          } else if (transactionError.request) {
            console.error('Transaction API No Response:', transactionError.request);
          } else {
            console.error('Transaction API Error:', transactionError.message);
          }
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching billing data:', err);
        // More detailed error logging
        if (err.response) {
          console.error('General API Error Response:', err.response.status, err.response.data);
          setError(`API Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          console.error('General API No Response:', err.request);
          setError('Network Error: Unable to connect to the server. Please check if the backend is running.');
        } else {
          console.error('General API Error:', err.message);
          setError(`Request Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchBillingData();
    }
  }, [isAuthenticated, navigate, targetUserId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">User data not found</span>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    // Handle cases where amount might be undefined, null, or NaN
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSubscriptionStatus = (subscription) => {
    if (!subscription) return 'No subscription';
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    if (subscription.status === 'cancelled') {
      return 'Cancelled';
    } else if (endDate < now) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isAdminView ? `Billing Details for ${userData.name}` : 'My Billing'}
            </h1>
            {isAdminView && (
              <button 
                onClick={() => navigate('/ad-dashboard/users')}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm"
              >
                ← Back to All Users
              </button>
            )}
          </div>
          {!isAdminView && (
            <p className="text-gray-300">
              Manage your subscription and payment information
            </p>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="billing-card p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 billing-card-header">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-400">User ID</p>
            <p className="font-medium text-white">{userData.id || 'N/A'}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-400">Name</p>
            <p className="font-medium text-white">{userData.name || 'N/A'}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium text-white">{userData.email || 'N/A'}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-400">Role</p>
            <p className="font-medium text-white capitalize">{userData.role || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {subscriptionData ? (
        <div className="billing-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 billing-card-header">Subscription Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-400">Plan Type</p>
              <p className="font-medium text-lg capitalize text-white">
                {subscriptionData.planType || 'Free'} 
                {subscriptionData.isTrial ? ' (Trial)' : ''}
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-400">Status</p>
              <p className="font-medium text-lg text-white">
                {getSubscriptionStatus(subscriptionData)}
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-400">Profiles Allowed</p>
              <p className="font-medium text-lg text-white">
                {(subscriptionData.profiles || 1)} Profile{(subscriptionData.profiles || 1) !== 1 ? 's' : ''}
              </p>
            </div>
            
            {subscriptionData.startDate && (
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-400">Start Date</p>
                <p className="font-medium text-white">{formatDate(subscriptionData.startDate)}</p>
              </div>
            )}
            
            {subscriptionData.endDate && (
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-gray-400">
                  {new Date(subscriptionData.endDate) < new Date() ? 'Expired On' : 'Expires On'}
                </p>
                <p className="font-medium text-white">{formatDate(subscriptionData.endDate)}</p>
              </div>
            )}
            
            {subscriptionData.cancelledAt && (
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-400">Cancelled On</p>
                <p className="font-medium text-white">{formatDate(subscriptionData.cancelledAt)}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="billing-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 billing-card-header">Subscription Details</h2>
          <p className="text-gray-400">No active subscription found</p>
        </div>
      )}

      {/* Transaction History */}
      <div className="billing-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4 billing-card-header">Transaction History</h2>
        
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-indigo-900 rounded-lg overflow-hidden text-sm">
              <thead className="bg-indigo-800">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Date</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Description</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Plan Type</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Amount</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Method</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-700">
                {transactions.map((transaction, index) => {
                  // Add a check for transaction data
                  if (!transaction) return null;
                  
                  return (
                    <tr key={transaction._id || transaction.id || index} className="hover:bg-indigo-800 transition-colors duration-150">
                      <td className="py-2 px-3 text-indigo-200">
                        {transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}
                      </td>
                      <td className="py-2 px-3 font-medium text-white">
                        {transaction.description || transaction.name || transaction.type || 'Subscription Payment'}
                      </td>
                      <td className="py-2 px-3 text-indigo-200 capitalize">
                        {transaction.metadata?.planType || 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-indigo-200">
                        {formatCurrency(transaction.amount || transaction.amountInUSD || (transaction.amountInCents / 100) || transaction.total || transaction.price)}
                      </td>
                      <td className="py-2 px-3 text-indigo-200">
                        {transaction.paymentMethodTypes && transaction.paymentMethodTypes.length > 0
                          ? transaction.paymentMethodTypes[0]
                          : 'Card'}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                          (transaction.status || transaction.paymentStatus) === 'completed' || (transaction.status || transaction.paymentStatus) === 'paid'
                            ? 'bg-emerald-500 text-white'
                            : (transaction.status || transaction.paymentStatus) === 'pending'
                            ? 'bg-amber-500 text-white'
                            : (transaction.status || transaction.paymentStatus) === 'failed' || (transaction.status || transaction.paymentStatus) === 'cancelled'
                            ? 'bg-rose-500 text-white'
                            : 'bg-indigo-500 text-white'
                        }`}>
                          {(transaction.status || transaction.paymentStatus) ? 
                            (transaction.status || transaction.paymentStatus).substring(0, 10) : 
                            'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-indigo-300">No transaction history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;