import React, { useState, useEffect, useMemo } from 'react';
import { useGoogleBusiness } from '../context/GoogleBusinessContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessProfileDropdown = ({
  onSelect,
  className = '',
  showLabel = true,
  disabled = false,
  multiple = false
}) => {
  const {
    businesses = [],
    selectedBusiness,
    selectedBusinesses = [],
    selectBusiness,
    loading: businessesLoading
  } = useGoogleBusiness();

  const { subscriptionData, subscriptionLoading } = useAuth();
  const { theme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(null);
  const [internalSelectedMultiple, setInternalSelectedMultiple] = useState([]);

  /* ---------------- SUBSCRIPTION CHECK ---------------- */

  const isSubscriptionActive = useMemo(() => {
    if (subscriptionLoading) return true;
    if (!subscriptionData) return false;

    const now = new Date();
    const endDate = new Date(subscriptionData.endDate);
    return subscriptionData.active && endDate > now;
  }, [subscriptionData, subscriptionLoading]);

  /* ---------------- LIMIT CALCULATION (FIXED) ---------------- */

  const { maxProfiles, usedProfiles } = useMemo(() => {
    if (!subscriptionData) {
      return { maxProfiles: 1, usedProfiles: 0 };
    }

    const profilesAllowed = Number(subscriptionData.profiles || 1);

    return {
      maxProfiles: profilesAllowed,
      usedProfiles: multiple
        ? selectedBusinesses.length
        : selectedBusiness
        ? 1
        : 0
    };
  }, [subscriptionData, multiple, selectedBusinesses, selectedBusiness]);

  /* ---------------- CORE FIX: CAN SELECT BUSINESS ---------------- */

  const canSelectBusiness = (business) => {
    if (!subscriptionData || !subscriptionData.active) return false;

    // already selected → always allowed
    if (multiple) {
      if (selectedBusinesses.some(b => b.name === business.name)) return true;
      return selectedBusinesses.length < maxProfiles;
    }

    if (selectedBusiness?.name === business.name) return true;

    return usedProfiles < maxProfiles;
  };

  /* ---------------- AUTO SELECT FIRST BUSINESS ---------------- */

  useEffect(() => {
    if (
      businesses.length > 0 &&
      !selectedBusiness &&
      !businessesLoading &&
      isSubscriptionActive
    ) {
      if (canSelectBusiness(businesses[0])) {
        selectBusiness(businesses[0]);
        setInternalSelected(businesses[0]);
      }
    }
  }, [businesses, selectedBusiness, businessesLoading, isSubscriptionActive]);

  /* ---------------- SYNC INTERNAL STATE ---------------- */

  useEffect(() => {
    if (multiple) {
      setInternalSelectedMultiple(selectedBusinesses);
    } else {
      setInternalSelected(selectedBusiness);
    }
  }, [selectedBusiness, selectedBusinesses, multiple]);

  /* ---------------- HANDLE SELECTION ---------------- */

  const handleSelect = (business) => {
    if (!canSelectBusiness(business)) return;

    if (multiple) {
      const alreadySelected = internalSelectedMultiple.some(
        b => b.name === business.name
      );

      const updated = alreadySelected
        ? internalSelectedMultiple.filter(b => b.name !== business.name)
        : [...internalSelectedMultiple, business];

      setInternalSelectedMultiple(updated);
      onSelect?.(updated);
      return;
    }

    selectBusiness(business);
    setInternalSelected(business);
    setIsOpen(false);
    onSelect?.(business);
  };

  /* ---------------- LOADING ---------------- */

  if (businessesLoading || subscriptionLoading) {
    return (
      <div className={`animate-pulse h-10 w-48 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
    );
  }

  /* ---------------- NO SUBSCRIPTION ---------------- */

  if (!subscriptionData || !isSubscriptionActive) {
    return (
      <div className={`p-4 border-l-4 ${
        theme === 'dark'
          ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
          : 'bg-yellow-50 border-yellow-400 text-yellow-700'
      }`}>
        <AlertCircle className="inline mr-2 h-4 w-4" />
        Subscription inactive.
        <Link to="/pricing" className="underline ml-1 font-semibold">
          Upgrade plan
        </Link>
      </div>
    );
  }

  /* ---------------- NO BUSINESSES ---------------- */

  if (!businesses.length) {
    return (
      <div className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
        No business profiles found.
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className={`text-sm mb-1 block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Business Profile
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg border ${
          theme === 'dark' 
            ? 'border-gray-700 bg-gray-800 text-white' 
            : 'border-gray-300 bg-white text-purple-700'
        }`}
      >
        <span className="truncate text-sm">
          {multiple
            ? `${internalSelectedMultiple.length} selected`
            : internalSelected?.title || 'Select Business'}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            theme === 'dark' ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-100 text-purple-700'
          }`}>
            {usedProfiles}/{maxProfiles}
          </span>
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full rounded shadow border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
          {businesses.map(business => {
            const isSelected = multiple
              ? internalSelectedMultiple.some(b => b.name === business.name)
              : internalSelected?.name === business.name;

            const selectable = canSelectBusiness(business);

            return (
              <button
                key={business.name}
                onClick={() => selectable && handleSelect(business)}
                disabled={!selectable}
                className={`w-full px-4 py-2 text-left text-sm flex justify-between ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : selectable
                    ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="truncate">{business.title || business.locationName}</span>
                {!selectable && <Lock className="h-3 w-3 text-yellow-400" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-1 text-xs text-green-500">
        Subscription active ({maxProfiles} profiles)
      </div>
    </div>
  );
};

export default BusinessProfileDropdown;
