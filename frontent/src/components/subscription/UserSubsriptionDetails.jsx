import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const UserSubscriptionDetails = () => {
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
  console.log("transactions>>>>>>>>>>>>>>>..",subscriptionData)
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
          console.log("subscriptiondata", subscriptionResponse.data);
          // Update to handle nested subscription data
          const responseData = subscriptionResponse.data;
          if (responseData.success && responseData.subscription) {
            setSubscriptionData(responseData.subscription);
          } else if (responseData.success && !responseData.subscription) {
            // Handle case where subscription is null/undefined but API returned success
            console.warn('No subscription data found in response');
            setSubscriptionData(null);
          } else {
            // Handle case where API didn't return success
            console.warn('Subscription API did not return success');
            setSubscriptionData(null);
          }
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
          
          console.log('Raw transactions data>>>>>>>>>>>>>>>>>>>:', transactionsResponse.data);
          
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
  // Calculate days left in subscription
  const getDaysLeft = () => {
    try {
      if (!subscriptionData?.endDate) return 0;
      const endDate = new Date(subscriptionData.endDate);
      const today = new Date();
      const diffTime = endDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating days left:', error);
      return 0;
    }
  };
  
  const daysLeft = subscriptionData ? getDaysLeft() : 0;
  
  // Format subscription dates
  const formatSubscriptionDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'N/A';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {isAdminView ? `Billing Dashboard - ${userData.name}` : 'My Billing Dashboard'}
            </h1>
            <p className="text-gray-400">
              {isAdminView ? 'View and manage user subscription details' : 'Manage your subscription and payment information'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {isAdminView && (
              <button 
                onClick={() => navigate('/ad-dashboard/users')}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Users
              </button>
            )}
            {!subscriptionData && (
              <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm">
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Info and Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Account Information</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-white">{userData?.name || 'User'}</p>
                <p className="text-sm text-gray-400">{userData?.email || 'No email'}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">User ID:</span>
                <span className="text-gray-200 font-mono">{userData?.id?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Account Type:</span>
                <span className="text-gray-200 capitalize">{userData?.role || 'user'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-gray-200">
                  {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Status Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-xl p-6 shadow-sm border border-indigo-700">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Subscription Status</h2>
                <p className="text-indigo-200 text-sm">
                  {subscriptionData ? 'Manage your subscription' : 'No active subscription'}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscriptionData.status?.toLowerCase() === 'expired' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {subscriptionData.status}
              </span>
            </div>
            
            {subscriptionData ? (
              <div className="mt-4 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-indigo-300 mb-1">Current Plan</p>
                  <p className="text-xl font-bold text-white">
                    {subscriptionData.planType } Plan
                  </p>
                 
                </div>
                
                {subscriptionData.status?.toLowerCase() !== 'expired' && (
                  <div className="pt-4 border-t border-indigo-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-indigo-300">Subscription Progress</span>
                      <span className="text-indigo-200">{daysLeft} days remaining</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 rounded-full h-2.5">
                      <div 
                        className="bg-green-400 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, daysLeft))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-indigo-400 mt-1">
                      <span>
                        Started: {subscriptionData?.startDate 
                          ? formatSubscriptionDate(subscriptionData.startDate) 
                          : 'N/A'}
                      </span>
                      <span>
                        {subscriptionData?.endDate 
                          ? `Renews: ${formatSubscriptionDate(subscriptionData.endDate)}`
                          : 'No active subscription'}
                      </span>
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="mt-6 text-center py-8 bg-indigo-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="mt-3 text-lg font-medium text-white">No Active Subscription</h3>
                <p className="mt-1 text-indigo-200 text-sm">Upgrade your account to unlock all features</p>
                <div className="mt-6">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    View Plans & Pricing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     
      {/* Transaction History */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Transaction History</h2>
            <p className="text-sm text-gray-400">View all your payment transactions</p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <div className="relative">
              <select className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Transactions</option>
                <option>Payments</option>
                <option>Refunds</option>
                <option>Failed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
        
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions.map((transaction, index) => {
                  if (!transaction) return null;
                  
                  const status = (transaction.status || transaction.paymentStatus || '').toLowerCase();
                  const isPaid = status === 'completed' || status === 'paid' || status === 'succeeded';
                  const isPending = status === 'pending' || status === 'processing';
                  const isFailed = status === 'failed' || status === 'declined' || status === 'cancelled';
                  
                  const amount = transaction.amount || transaction.amountInUSD || 
                               (transaction.amountInCents ? transaction.amountInCents / 100 : 0) || 
                               transaction.total || transaction.price || 0;
                  
                  const paymentMethod = transaction.paymentMethodTypes?.[0] || 
                                      transaction.payment_method_type || 'card';
                  
                  return (
                    <tr key={transaction._id || transaction.id || index} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {transaction.description || transaction.name || 'Subscription Payment'}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          {paymentMethod === 'card' ? (
                            <>
                              <svg className="h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                              </svg>
                              Card ending in {transaction.last4 || '••••'}
                            </>
                          ) : (
                            <span className="capitalize">{paymentMethod}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 font-mono">
                          {transaction.invoiceId || `INV-${(transaction._id || '').substring(0, 8).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(amount)}
                        </div>
                        {transaction.refundedAmount > 0 && (
                          <div className="text-xs text-rose-400">
                            Refunded: {formatCurrency(transaction.refundedAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                          isPaid 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : isPending 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                              : isFailed 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            // Handle view receipt
                            console.log('View receipt for:', transaction._id);
                          }}
                          className="text-blue-500 hover:text-blue-400 mr-3"
                        >
                          Receipt
                        </button>
                        <button 
                          onClick={() => {
                            // Handle download invoice
                            console.log('Download invoice for:', transaction._id);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-t border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">{transactions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 border border-blue-600 text-sm font-medium">
                      1
                    </button>
                    <button className="bg-gray-800 text-gray-400 hover:bg-gray-700 px-4 py-2 border border-gray-700 text-sm font-medium">
                      2
                    </button>
                    <button className="bg-gray-800 text-gray-400 hover:bg-gray-700 px-4 py-2 border border-gray-700 text-sm font-medium">
                      3
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No transactions</h3>
            <p className="mt-1 text-sm text-gray-400">
              You don't have any transactions yet.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionDetails;
