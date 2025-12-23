import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Added ThemeContext import
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

  const { theme } = useTheme(); // Added theme hook
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const openTransactionDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDialog(true);
  };

  const closeTransactionDialog = () => {
    setShowTransactionDialog(false);
    setSelectedTransaction(null);
  };

  if (subscriptionLoading || transactionsLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading billing details...</p>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className={`flex items-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading subscription: {subscriptionError}</span>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className={`flex items-center ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
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
        <span className={`${baseClasses} ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
          Active
        </span>
      );
    }
    if (status === 'expired') {
      return (
        <span className={`${baseClasses} ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          Expired
        </span>
      );
    }
    return (
      <span className={`${baseClasses} ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
        {status || 'Inactive'}
      </span>
    );
  };

  const getTransactionStatusBadge = (status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (status === 'succeeded' || status === 'paid') {
      return (
        <span className={`${baseClasses} ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
          Paid
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className={`${baseClasses} ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          Failed
        </span>
      );
    }
    return (
      <span className={`${baseClasses} ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className={`min-h-screen p-3 sm:p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>Billing & Subscription</h1>
            <p className={`mt-1 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your subscription and billing information
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            {getStatusBadge()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Plan Details Card - Modern Credit Card Design */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01] ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                : 'bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-500/20'
            } relative`}>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
              
              <div className="relative z-10 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Current Plan</p>
                    <h2 className="text-2xl font-bold">
                      {planType ? `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan` : 'No Active Plan'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Credit Card Chip */}
                    <div className="bg-yellow-400/90 w-10 h-8 rounded-md flex items-center justify-center">
                      <div className="w-6 h-4 bg-yellow-300/70 rounded-sm"></div>
                    </div>
                    {status && (
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        status === 'active' 
                          ? 'bg-green-500/20 text-green-300' 
                          : status === 'expired' 
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mt-6 sm:mt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Profiles */}
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-white/10">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/80 mb-0.5">Profiles</p>
                        <p className="text-lg font-medium text-white">
                          {profiles || 0} {profiles === 1 ? 'Profile' : 'Profiles'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-white/10">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/80 mb-0.5">Start Date</p>
                        <p className="text-lg font-medium text-white">
                          {formatDate(startDate) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Renewal Date */}
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-white/10">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/80 mb-0.5">Renewal Date</p>
                        <p className="text-lg font-medium text-white">
                          {formatDate(endDate) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex flex-col xs:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-white/80 mb-1">Price per Profile</p>
                      <p className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
                        {formatCurrency(pricePerProfile || 0)}/mo
                      </p>
                    </div>
                    <div className="flex-1 xs:text-right">
                      <p className="text-xs text-white/80 mb-1">Total</p>
                      <p className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
                        {formatCurrency(totalPrice || 0)}/mo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           
          </div>

            <div className={`rounded-xl shadow-sm border p-4 sm:p-5 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-purple-200 backdrop-blur-sm'}`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>Need Help?</h2>
              <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
                Our support team is here to help with any questions about your subscription.
              </p>
              <button className={`w-full text-sm sm:text-base font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' 
                  : 'border border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}>
                Contact Support
              </button>
            </div>

         
          
        </div>
 {/* Summary Card */}
        
         {/* Transaction History */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Transaction History</h2>
                </div>
                
                {transactionsError ? (
                  <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className={`flex items-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Error loading transactions: {transactionsError}</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No transactions yet</h3>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your transaction history will appear here once you make a payment.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y">
                      <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Date & Time
                          </th>
                          <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Transaction ID
                          </th>
                          <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Plan & Billing
                          </th>
                          <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Amount (USD)
                          </th>
                          <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Amount (INR)
                          </th>
                          <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Payment Status
                          </th>
                          <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Currency
                          </th>
                          <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className={theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}>
                        {transactions.map((transaction, index) => {
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
                          
                          // Determine row styling based on index for alternating colors
                          const rowClass = theme === 'dark' 
                            ? (index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50')
                            : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
                          
                          return (
                            <tr key={transaction._id} className={`${rowClass} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {formattedDate}
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formattedTime}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div 
                                  className={`text-sm font-mono cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                                  onClick={() => openTransactionDialog(transaction)}
                                >
                                  {transaction._id?.substring(0, 8)}...
                                </div>
                                {transaction.sessionId && (
                                  <div 
                                    className={`text-xs mt-1 cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => openTransactionDialog(transaction)}
                                    title={transaction.sessionId}
                                  >
                                    Session: {transaction.sessionId.substring(0, 6)}...
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {planType} Plan
                                  </div>
                                  {discountPercent > 0 && (
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                      {discountPercent}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {profiles} Profile{profiles !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-baseline space-x-2">
                                  {originalPricePerProfile > 0 && (
                                    <span className={`text-xs line-through ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      ${originalPricePerProfile.toFixed(2)}/profile
                                    </span>
                                  )}
                                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ${discountedPricePerProfile.toFixed(2)}/profile
                                  </span>
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {metadata.discountApplied === 'Yes' && (
                                    <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                      Saved ${savings.toFixed(2)} ({(savings/originalTotal*100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  ${amountInUSD.toFixed(2)}
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {amountInCents} cents
                                </div>
                                {originalTotal > 0 && (
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span className="line-through">${originalTotal.toFixed(2)}</span> → 
                                    <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}> ${discountedTotal.toFixed(2)}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                {amountInINR > 0 ? (
                                  <>
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      ₹{amountInINR.toLocaleString('en-IN')}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {amountInUSD > 0 ? (amountInINR/amountInUSD).toFixed(2) : '0.00'} INR/USD
                                    </div>
                                  </>
                                ) : (
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="mb-1">
                                  {getTransactionStatusBadge(transaction.paymentStatus || transaction.status)}
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {transaction.paymentMethodTypes?.[0] || 'Card'}
                                </div>
                                {savings > 0 && (
                                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    Saved ${savings.toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {transaction.currency || 'USD'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {transaction.quantity || profiles || 1}
                                </div>
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

      {/* Transaction Detail Dialog */}
      {showTransactionDialog && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-lg w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Transaction Details
                </h3>
                <button 
                  onClick={closeTransactionDialog}
                  className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Transaction ID</p>
                  <p className={`mt-1 font-mono text-sm break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTransaction._id}
                  </p>
                </div>
                
                {selectedTransaction.sessionId && (
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Session ID</p>
                    <p className={`mt-1 font-mono text-sm break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTransaction.sessionId}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Payment Status</p>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTransaction.paymentStatus || selectedTransaction.status || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</p>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTransaction.paymentMethodTypes?.[0] || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created At</p>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedTransaction.createdAt || selectedTransaction.created).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={closeTransactionDialog}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;