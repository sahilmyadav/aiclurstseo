import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const GoogleBusinessContext = createContext();

export const useGoogleBusiness = () => {
  const context = useContext(GoogleBusinessContext);
  if (!context) {
    throw new Error('useGoogleBusiness must be used within a GoogleBusinessProvider');
  }
  return context;
};

export const GoogleBusinessProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user: authUser, token } = useAuth();
  const BACKEND_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

  const authHeaders = () => ({
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  });

  // Check Google authentication status
  const checkAuthStatus = async () => {
    if (!authUser) return;
    try {
      const res = await fetch(`${BACKEND_URL}/auth/google/status`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setIsConnected(true);
          await fetchBusinesses();
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  // Fetch businesses from Google
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/google/businesses`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      // console.log("data",data)
      if (res.ok) {
        setUser(data.user || {});
        setBusinesses(data.businesses || []);
        
        // Auto-select first business if none selected
        if (data.businesses && data.businesses.length > 0 && !selectedBusiness) {
          const firstBusiness = data.businesses[0];
          setSelectedBusiness(firstBusiness);
          // Auto-fetch reviews for first business
          await fetchReviews(firstBusiness.accountId, firstBusiness.name.split("/")[1]);
        }
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      toast.error("Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for selected business
  const fetchReviews = async (accountId, locationId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/google/reviews/${accountId}/${locationId}`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        setReviews(data.reviews || []);
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error("Failed to fetch reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google
  const connectGoogle = async () => {
    if (!authUser) {
      toast.error("Please log in first");
      return;
    }
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  // Disconnect from Google
  const disconnectGoogle = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/google/disconnect`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
      
      // Reset all state
      setUser(null);
      setBusinesses([]);
      setSelectedBusiness(null);
      setReviews([]);
      setIsConnected(false);
      
      toast.success("Disconnected successfully");
    } catch (err) {
      console.error('Error disconnecting:', err);
      toast.error("Failed to disconnect");
    }
  };

  // Select a business and fetch its reviews
  const selectBusiness = async (business) => {
    setSelectedBusiness(business);
    const accountId = business.accountId;
    const locationId = business.name.split("/")[1];
    await fetchReviews(accountId, locationId);
  };

  // Calculate review statistics
  const getReviewStats = () => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        ratings: [],
        recentCount: 0
      };
    }

    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    const ratings = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => ratingMap[r.starRating] === rating).length
    }));

    const totalRating = reviews.reduce((sum, review) => sum + (ratingMap[review.starRating] || 0), 0);
    const average = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Count recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = reviews.filter(review => 
      new Date(review.createTime) > thirtyDaysAgo
    ).length;

    return {
      average,
      total: reviews.length,
      ratings,
      recentCount
    };
  };

  useEffect(() => {
    checkAuthStatus();
  }, [authUser]);

  const value = {
    // State
    user,
    businesses,
    selectedBusiness,
    reviews,
    loading,
    isConnected,
    
    // Actions
    connectGoogle,
    disconnectGoogle,
    fetchBusinesses,
    fetchReviews,
    selectBusiness,
    checkAuthStatus,
    
    // Computed values
    reviewStats: getReviewStats()
  };

  return (
    <GoogleBusinessContext.Provider value={value}>
      {children}
    </GoogleBusinessContext.Provider>
  );
};
