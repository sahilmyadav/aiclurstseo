import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Billing = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    subscriptionData, 
    subscriptionLoading, 
    subscriptionError 
  } = useAuth();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get userId from URL params (for admin view) or use current user's ID
  const userIdFromParams = searchParams.get('userId');
  const isAdminView = !!userIdFromParams && user?.role === 'admin';
  const targetUserId = userIdFromParams || user?._id || user?.id;
  
  const [userData, setUserData] = useState(null);
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
          
          let processedTransactions = [];
          if (Array.isArray(transactionsResponse.data)) {
            processedTransactions = transactionsResponse.data.map((transaction, index) => ({
              ...transaction,
              _id: transaction._id || transaction.id || `transaction-${index}`,
              createdAt: transaction.createdAt || transaction.created || null,
              description: transaction.description || transaction.name || transaction.type || 'Subscription Payment',
              amount: transaction.amount || transaction.amountInUSD || 
                     (transaction.amountInCents ? transaction.amountInCents / 100 : null) || 
                     transaction.total || transaction.price || 0,
              status: transaction.status || transaction.paymentStatus || 'unknown'
            }));
          }
          
          setTransactions(processedTransactions);
        } catch (transactionError) {
          console.warn('Could not fetch transaction data:', transactionError);
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError(err.message || 'Error fetching billing data');
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchBillingData();
    }
  }, [isAuthenticated, navigate, targetUserId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSubscriptionStatus = () => {
    if (subscriptionLoading) return 'Loading...';
    if (subscriptionError) return 'Error loading subscription';
    if (!subscriptionData || !subscriptionData.subscription) return 'No active subscription';
    
    const now = new Date();
    const endDate = new Date(subscriptionData.subscription.endDate);
    
    if (subscriptionData.subscription.status === 'cancelled') {
      return 'Cancelled';
    } else if (endDate < now) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Loading billing information...</p>
      </div>
    );
  }

  if (error || subscriptionError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <strong className="font-bold">Error: </strong>
          <span className="ml-1">{error || subscriptionError}</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <strong className="font-bold">Warning: </strong>
          <span className="ml-1">User data not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isAdminView ? `Billing Details for ${userData.name}` : 'My Billing'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your subscription and view billing history
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscription Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            getSubscriptionStatus() === 'Active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : getSubscriptionStatus() === 'Expired'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {getSubscriptionStatus()}
          </span>
        </div>

        {subscriptionData?.subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {subscriptionData.subscription.planType || 'N/A'}
                {subscriptionData.subscription.isTrial ? ' (Trial)' : ''}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center mt-1">
                {subscriptionData.subscription.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="capitalize">{subscriptionData.subscription.status}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profiles</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscriptionData.subscription.profiles || 1}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(subscriptionData.subscription.totalPrice || 0)}
                <span className="text-sm text-gray-500 ml-1">
                  ({formatCurrency(subscriptionData.subscription.pricePerProfile || 0)} per profile)
                </span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="text-gray-900 dark:text-white">
                {formatDate(subscriptionData.subscription.startDate)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {getSubscriptionStatus() === 'Active' ? 'Next Billing' : 'End Date'}
              </p>
              <div>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(subscriptionData.subscription.endDate)}
                </p>
                {subscriptionData.subscription.daysRemaining > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subscriptionData.subscription.daysRemaining} days remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No active subscription found</p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Billing History</h2>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'succeeded' || transaction.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;