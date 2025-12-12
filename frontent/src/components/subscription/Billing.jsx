import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle, Clock, CreditCard, Calendar, Tag, Users } from 'lucide-react';

const Billing = () => {
  const { 
    subscriptionData, 
    subscriptionLoading, 
    subscriptionError,
    transactions,
    transactionsLoading,
    transactionsError
  } = useAuth();

  if (subscriptionLoading || transactionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading billing details...</p>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading subscription: {subscriptionError}</span>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>No subscription found</span>
        </div>
      </div>
    );
  }

  const {
    planType,
    status,
    active,
    startDate,
    endDate,
    profiles,
    pricePerProfile,
    totalPrice
  } = subscriptionData;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    if (active) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
          Active
        </span>
      );
    }
    if (status === 'expired') {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
          Expired
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
        {status || 'Inactive'}
      </span>
    );
  };

  const getTransactionStatusBadge = (status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (status === 'succeeded' || status === 'paid') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
          Paid
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
          Failed
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your subscription and billing information
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Plan Details Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Plan Details</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{planType || 'No Plan'}</span>
                    </div>
                    {status && (
                      <div className={`flex items-center space-x-2 ${
                        status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : status === 'expired' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      } px-3 py-1 rounded-full`}>
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                        <span className="text-sm font-medium capitalize">{status}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profiles</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {profiles || 0} {profiles === 1 ? 'Profile' : 'Profiles'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Cycle</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {planType === 'monthly' ? 'Monthly' : planType === 'yearly' ? 'Yearly' : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renewal Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           
          </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Our support team is here to help with any questions about your subscription.
              </p>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                Contact Support
              </button>
            </div>

         
          
        </div>
 {/* Summary Card */}
        
         {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                </div>
                
                {transactionsError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Error loading transactions: {transactionsError}</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No transactions yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Your transaction history will appear here once you make a payment.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Plan & Billing
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount (USD)
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount (INR)
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Payment Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map((transaction) => {
                          // Extract metadata and calculation data
                          const metadata = transaction.metadata || {};
                          const calculation = metadata.calculation || {};
                          
                          // Plan and profile info
                          const planType = metadata.planType 
                            ? metadata.planType.charAt(0).toUpperCase() + metadata.planType.slice(1)
                            : 'N/A';
                          
                          const profiles = metadata.profiles || calculation.profiles || 1;
                          const originalPricePerProfile = parseFloat(metadata.originalPricePerProfile || calculation.originalPricePerProfile || 0);
                          const discountedPricePerProfile = parseFloat(metadata.discountedPricePerProfile || calculation.basePrice || 0);
                          const discountPercent = metadata.discountPercent || calculation.discountPercent || 0;
                          
                          // Format amounts
                          const amountInCents = transaction.amountInCents || 0;
                          const amountInUSD = transaction.amountInUSD || (amountInCents / 100);
                          const amountInINR = transaction.amountInINR || 0;
                          
                          // Calculate totals
                          const originalTotal = parseFloat(metadata.originalTotal || calculation.originalTotal || 0);
                          const discountedTotal = parseFloat(metadata.discountedTotal || calculation.total || 0);
                          const savings = originalTotal - discountedTotal;
                          
                          // Format dates
                          const transactionDate = new Date(transaction.createdAt || transaction.created);
                          const formattedDate = transactionDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                          const formattedTime = transactionDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          
                          return (
                            <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formattedDate}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formattedTime}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900 dark:text-gray-200">
                                  {transaction._id?.substring(0, 8)}...
                                </div>
                                {transaction.sessionId && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={transaction.sessionId}>
                                    {transaction.sessionId.substring(0, 6)}...
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {planType} Plan
                                  </div>
                                  {discountPercent > 0 && (
                                    <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                                      {discountPercent}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {profiles} Profile{profiles !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-baseline space-x-2">
                                  {originalPricePerProfile > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                      ${originalPricePerProfile.toFixed(2)}/profile
                                    </span>
                                  )}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${discountedPricePerProfile.toFixed(2)}/profile
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {metadata.discountApplied === 'Yes' && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      Saved ${savings.toFixed(2)} ({(savings/originalTotal*100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${amountInUSD.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {amountInCents} cents
                                </div>
                                {originalTotal > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="line-through">${originalTotal.toFixed(2)}</span> → 
                                    <span className="font-medium text-green-600 dark:text-green-400"> ${discountedTotal.toFixed(2)}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                {amountInINR > 0 ? (
                                  <>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      ₹{amountInINR.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {amountInUSD > 0 ? (amountInINR/amountInUSD).toFixed(2) : '0.00'} INR/USD
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="mb-1">
                                  {getTransactionStatusBadge(transaction.paymentStatus || transaction.status)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {transaction.paymentMethodTypes?.[0] || 'Card'}
                                </div>
                                {savings > 0 && (
                                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Saved ${savings.toFixed(2)}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
};

export default Billing;