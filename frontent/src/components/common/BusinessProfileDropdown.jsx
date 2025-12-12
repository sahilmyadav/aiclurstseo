import React, { useState, useEffect, useMemo } from 'react';
import { useGoogleBusiness } from '../context/GoogleBusinessContext';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessProfileDropdown = ({ 
  onSelect, 
  className = '',
  showLabel = true,
  disabled = false,
  multiple = false // Allow multiple selections
}) => {
  const { 
    businesses = [], 
    selectedBusiness, 
    selectedBusinesses = [], // For multiple selections
    selectBusiness,
    selectMultipleBusinesses, // New function for multiple selections
    toggleBusinessSelection, // Toggle selection
    loading: businessesLoading 
  } = useGoogleBusiness();
  
  const { subscriptionData, subscriptionLoading } = useAuth();
  console.log('Subscription Data:', subscriptionData);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(null);
  const [internalSelectedMultiple, setInternalSelectedMultiple] = useState([]); // For multiple selections

  // Check if subscription is active
  const isSubscriptionActive = useMemo(() => {
    if (subscriptionLoading) return true; // Assume active while loading to prevent flickering
    if (!subscriptionData) return false;
    
    // Check if subscription is active and not expired
    const now = new Date();
    const endDate = new Date(subscriptionData.endDate);
    return subscriptionData.active && endDate > now;
  }, [subscriptionData, subscriptionLoading]);

  // Get subscription limits
  const { maxProfiles = 1, usedProfiles = 0 } = useMemo(() => {
    if (!subscriptionData) return { maxProfiles: 1, usedProfiles: 0 };
    
    // Use the actual profiles count from subscription data
    const subscriptionProfiles = subscriptionData.profiles || 1;
    
    return {
      maxProfiles: subscriptionProfiles,
      usedProfiles: multiple ? selectedBusinesses.length : (selectedBusiness ? 1 : 0)
    };
  }, [subscriptionData, businesses, multiple, selectedBusinesses, selectedBusiness]);

  // Check if a business can be selected
  const canSelectBusiness = (business) => {
    // If no subscription data, cannot select
    if (!subscriptionData) return false;
    
    // Check if subscription is active
    const isActive = subscriptionData.active && 
                    subscriptionData.subscription?.status === 'active';
    
    if (!isActive) return false;
    
    // If already selected, can deselect
    if (multiple) {
      return selectedBusinesses.some(b => b.name === business.name) || 
             selectedBusinesses.length < maxProfiles;
    } else {
      if (business.name === selectedBusiness?.name) return true;
    }
    
    // Check if within subscription limits
    return usedProfiles < maxProfiles;
  };

  // Auto-select first business if none selected and within limits
  useEffect(() => {
    if (businesses?.length > 0 && !selectedBusiness && !businessesLoading && 
        subscriptionData?.active && subscriptionData.subscription?.status === 'active') {
      const firstBusiness = businesses[0];
      if (canSelectBusiness(firstBusiness)) {
        selectBusiness(firstBusiness);
        setInternalSelected(firstBusiness);
        if (multiple) {
          selectMultipleBusinesses([firstBusiness]);
          setInternalSelectedMultiple([firstBusiness]);
        }
      }
    }
  }, [businesses, selectedBusiness, businessesLoading, selectBusiness, maxProfiles, multiple, selectMultipleBusinesses]);

  // Update internal state when selectedBusiness changes
  useEffect(() => {
    if (multiple) {
      setInternalSelectedMultiple(selectedBusinesses);
    } else {
      if (selectedBusiness) {
        setInternalSelected(selectedBusiness);
      }
    }
  }, [selectedBusiness, selectedBusinesses, multiple]);

  const handleSelect = (business) => {
    if (!canSelectBusiness(business)) return;
    
    if (multiple) {
      // Handle multiple selections
      toggleBusinessSelection(business);
      
      // Update internal state
      const newSelections = selectedBusinesses.some(b => b.name === business.name)
        ? selectedBusinesses.filter(b => b.name !== business.name)
        : [...selectedBusinesses, business];
      
      setInternalSelectedMultiple(newSelections);
      
      if (onSelect) {
        onSelect(newSelections);
      }
    } else {
      // Toggle selection if clicking the same business
      if (selectedBusiness?.name === business.name) {
        selectBusiness(null);
        setInternalSelected(null);
      } else {
        selectBusiness(business);
        setInternalSelected(business);
      }
      
      setIsOpen(false);
      if (onSelect) {
        onSelect(business);
      }
    }
  };

  // Show loading state
  if (businessesLoading || subscriptionLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabel && <span className="text-sm text-gray-300">Loading subscription data...</span>}
        <div className="animate-pulse h-10 w-48 bg-gray-700 rounded-md"></div>
      </div>
    );
  }

  // Show subscription status message if no active subscription
  if (!subscriptionData || subscriptionData.status === 'expired') {
    return (
      <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {!subscriptionData 
                ? 'No active subscription found. '
                : 'Your subscription has expired. '}
              <Link 
                to="/pricing" 
                className="font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                Upgrade your plan
              </Link>{' '}
              to continue adding business profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no businesses are available
  if (!businesses || businesses.length === 0) {
    return (
      <div className={`text-sm text-yellow-400 ${className}`}>
        No business profiles found. Please connect your Google Business account.
      </div>
    );
  }
  
  // Get the number of selectable profiles
  const selectableProfiles = Math.min(maxProfiles, businesses.length);

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Business Profile
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-2 bg-[#1a1b2e]/90 border ${
            disabled ? 'border-gray-700 text-gray-500 cursor-not-allowed' : 'border-white/10 hover:bg-[#1a1b2e] hover:border-white/20'
          } rounded-lg transition-colors`}
        >
          <span className="text-sm truncate">
            {multiple ? (
              internalSelectedMultiple.length > 0 ? (
                <span className="flex items-center">
                  {internalSelectedMultiple.length} profile{internalSelectedMultiple.length !== 1 ? 's' : ''} selected
                </span>
              ) : 'Select Business Profiles'
            ) : internalSelected ? (
              <span className="flex items-center">
                {internalSelected.title || internalSelected.locationName}
              </span>
            ) : 'Select Business'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} />
        </button>
        
        {!disabled && (
          <div className="absolute right-2 -top-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
            {usedProfiles}/{maxProfiles} profiles
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1b2e] border border-white/10 rounded-lg shadow-lg max-h-60 overflow-auto">
          {businesses.map((business) => {
            const isSelectable = canSelectBusiness(business);
            const isSelected = multiple 
              ? internalSelectedMultiple.some(b => b.name === business.name)
              : internalSelected?.name === business.name;
            
            return (
              <div 
                key={business.name}
                className={`relative group ${!isSelectable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={!isSelectable ? `You only have access to ${maxProfiles} profile${maxProfiles > 1 ? 's' : ''}` : ''}
              >
                <button
                  type="button"
                  onClick={() => isSelectable && handleSelect(business)}
                  disabled={!isSelectable}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : !isSelectable
                      ? 'text-gray-500 hover:bg-white/5'
                      : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">
                    {business.title || business.locationName}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-green-400 ml-2 flex-shrink-0"></span>
                  )}
                  {!isSelectable && !isSelected && (
                    <Lock className="h-3 w-3 ml-2 flex-shrink-0 text-yellow-400" />
                  )}
                </button>
                {!isSelectable && (
                  <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-2 text-xs text-white bg-gray-800 rounded shadow-lg">
                    You only have access to {maxProfiles} profile{maxProfiles > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
          
          {maxProfiles > 1 && (
            <div className="px-4 py-2 text-xs text-gray-400 border-t border-white/5">
              {usedProfiles >= maxProfiles ? (
                <span className="text-yellow-400">
                  Upgrade your plan to select more than {maxProfiles} profiles
                </span>
              ) : (
                <span>
                  {maxProfiles - usedProfiles} of {maxProfiles} profiles remaining
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show subscription status if available */}
      {subscriptionData && (
        <div className="mt-1 text-xs text-gray-400">
          {subscriptionData.active ? (
            <span className="text-green-400">
              {subscriptionData.planType === 'trial' 
                ? `Trial active until ${new Date(subscriptionData.endDate).toLocaleDateString()}`
                : `Subscription Active (${subscriptionData.profiles || 1} profile${(subscriptionData.profiles || 1) !== 1 ? 's' : ''})`}
            </span>
          ) : (
            <span className="text-yellow-400">No active subscription</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessProfileDropdown;