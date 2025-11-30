import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const GoogleBusinessContext = createContext();

// Helper function to get storage key for current user
const getStorageKey = (userId) => `google_business_data_${userId || 'guest'}`;

export const useGoogleBusiness = () => {
  const context = useContext(GoogleBusinessContext);
  if (!context) {
    throw new Error('useGoogleBusiness must be used within a GoogleBusinessProvider');
  }
  return context;
};

export const GoogleBusinessProvider = ({ children }) => {
  const { user: authUser, token } = useAuth();
  const BACKEND_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');
  
  // Initialize state with user-specific data from localStorage
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(getStorageKey(authUser?.id));
    return saved ? JSON.parse(saved) : {
      user: null,
      businesses: [],
      selectedBusiness: null,
      selectedBusinesses: [],
      reviews: [],
      localReviews: [],
      loading: false,
      isConnected: false,
      reviewUri: '',
      tokenDetails: {
        accessToken: null,
        expiryDate: null,
        scopes: []
      },
      performanceData: null,
      performanceLoading: false,
      performanceError: null,
      scheduledPosts: [],
      loadingScheduled: false
    };
  });

  // State updater function
  const updateState = useCallback((updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(getStorageKey(authUser?.id), JSON.stringify(newState));
      return newState;
    });
  }, [authUser?.id]);

  // Create individual state setters
  const setUser = useCallback((user) => updateState({ user }), [updateState]);
  const setBusinesses = useCallback((businesses) => updateState({ businesses }), [updateState]);
  const setSelectedBusiness = useCallback((selectedBusiness) => updateState({ selectedBusiness }), [updateState]);
  const setSelectedBusinesses = useCallback((selectedBusinesses) => updateState({ selectedBusinesses }), [updateState]);
  const setReviews = useCallback((reviews) => updateState({ reviews }), [updateState]);
  const setLocalReviews = useCallback((localReviews) => updateState({ localReviews }), [updateState]);
  const setLoading = useCallback((loading) => updateState({ loading }), [updateState]);
  const setIsConnected = useCallback((isConnected) => updateState({ isConnected }), [updateState]);
  const setReviewUri = useCallback((reviewUri) => updateState({ reviewUri }), [updateState]);
  const setTokenDetails = useCallback((tokenDetails) => updateState({ tokenDetails }), [updateState]);
  const setPerformanceData = useCallback((performanceData) => updateState({ performanceData }), [updateState]);
  const setPerformanceLoading = useCallback((performanceLoading) => updateState({ performanceLoading }), [updateState]);
  const setPerformanceError = useCallback((performanceError) => updateState({ performanceError }), [updateState]);
  const setScheduledPosts = useCallback((scheduledPosts) => updateState({ scheduledPosts }), [updateState]);
  const setLoadingScheduled = useCallback((loadingScheduled) => updateState({ loadingScheduled }), [updateState]);

  // Destructure state for easier access
  const {
    user,
    businesses,
    selectedBusiness,
    selectedBusinesses,
    reviews,
    localReviews,
    loading,
    isConnected,
    reviewUri,
    tokenDetails,
    performanceData,
    performanceLoading,
    performanceError,
    scheduledPosts,
    loadingScheduled
  } = state;

  // Reset state when user changes
  useEffect(() => {
    setState({
      user: null,
      businesses: [],
      selectedBusiness: null,
      selectedBusinesses: [],
      reviews: [],
      localReviews: [],
      loading: false,
      isConnected: false,
      reviewUri: '',
      tokenDetails: {
        accessToken: null,
        expiryDate: null,
        scopes: []
      },
      performanceData: null,
      performanceLoading: false,
      performanceError: null,
      scheduledPosts: [],
      loadingScheduled: false
    });
  }, [authUser?.id]);

  const authHeaders = () => ({
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  });

  // Fetch performance metrics for selected business
  const fetchPerformanceMetrics = async (dateRange = null) => {
    if (!selectedBusiness?.name || !tokenDetails?.accessToken) {
      return;
    }

    setPerformanceLoading(true);
    setPerformanceError(null);
    
    try {
      // Default to last 30 days if no date range provided
      const endDate = dateRange?.endDate || new Date();
      const startDate = dateRange?.startDate || new Date(new Date().setDate(new Date().getDate() - 30));
      
      // Extract location ID from the business name
      const locationId = selectedBusiness.name.split('/')[1];
      
      if (!locationId) {
        throw new Error('Invalid business location ID');
      }
      
      // Format dates for the API
      const formattedStartDate = {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1, // Months are 0-indexed
        day: startDate.getDate()
      };
      
      const formattedEndDate = {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1, // Months are 0-indexed
        day: endDate.getDate()
      };
      
      const response = await fetch(`${BACKEND_URL}/api/audit/performance`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          locationId,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          accessToken: tokenDetails.accessToken
        })
      });
      
      const data = await response.json();
      console.log("Performance data",data)
      
      if (response.ok && data.success) {
        setPerformanceData(data.totals);
      } else {
        // throw new Error(data.error || 'Failed to fetch performance data');
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // setPerformanceError(error.message);
      // toast.error('Failed to load performance data: ' + error.message);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Fetch scheduled posts for the selected business location
  const fetchScheduledPosts = async () => {
    if (!selectedBusiness) return;
    
    const locationId = selectedBusiness.name.split("/")[1];
    
    console.log('Frontend: Fetching scheduled posts for locationId:', locationId);
    
    setLoadingScheduled(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/post/user/${locationId}`, {
        headers: authHeaders(),
      });
      
      console.log('Frontend: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Frontend: Received data:', data);
        setScheduledPosts(data.data || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Frontend: Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch scheduled posts');
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error(error.message || 'Failed to load scheduled posts');
    } finally {
      setLoadingScheduled(false);
    }
  };

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
          
          console.log("data.tokenDetails",data)
          // Update token details if available
          if (data.tokenDetails) {
            setTokenDetails({
              accessToken: data.tokenDetails.access_token,
              refreshToken: data.tokenDetails.refresh_token,
              expiryDate: data.tokenDetails.expiry_date ? new Date(data.tokenDetails.expiry_date) : null,
              scopes: data.tokenDetails.scope ? data.tokenDetails.scope.split(' ') : []
            });
          }
          
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
      console.log("data",data)
      if (res.ok) {
        setUser(data.user || {});
        setBusinesses(data.businesses || []);
        
        // Auto-select first business if none selected
        if (data.businesses && data.businesses.length > 0 && !selectedBusiness) {
          const firstBusiness = data.businesses[0];
          setSelectedBusiness(firstBusiness);
          setSelectedBusinesses([firstBusiness]); // Also add to multiple selections
          
          // Set review URI from first business metadata if available
          if (firstBusiness.metadata?.newReviewUri) {
            setReviewUri(firstBusiness.metadata.newReviewUri);
          }
          
          // Auto-fetch reviews for first business
          await fetchReviews(firstBusiness.accountId, firstBusiness.name.split("/")[1]);
          // Also fetch local reviews
          await fetchLocalReviews(firstBusiness.name.split("/")[1]);
          // fetchScheduledPosts will be called by useEffect when selectedBusiness changes
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

  // Fetch local reviews from database by locationId
  const fetchLocalReviews = async (locationId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/reviews/allReviews/${locationId}`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setLocalReviews(data || []);
      } else {
        throw new Error('Failed to fetch local reviews');
      }
    } catch (err) {
      console.error('Error fetching local reviews:', err);
      // Don't show toast error for local reviews as it might not be implemented yet
      // toast.error("Failed to fetch local reviews");
      setLocalReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google
  const connectGoogle = async () => {
   
   
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
      setSelectedBusinesses([]); // Reset multiple selections
      setReviews([]);
      setLocalReviews([]); // Reset local reviews
      setIsConnected(false);
      setPerformanceData(null); // Reset performance data
      
      toast.success("Disconnected successfully");
    } catch (err) {
      console.error('Error disconnecting:', err);
      toast.error("Failed to disconnect");
    }
  };

  // Select a single business and fetch its reviews
  const selectBusiness = async (business) => {
    setSelectedBusiness(business);
    const accountId = business.accountId;
    const locationId = business.name.split("/")[1];
    
    // Set review URI from business metadata if available
    if (business.metadata?.newReviewUri) {
      setReviewUri(business.metadata.newReviewUri);
    }
    
    await fetchReviews(accountId, locationId);
    // Also fetch local reviews when business is selected
    await fetchLocalReviews(locationId);
    // Fetch performance metrics for the selected business
    await fetchPerformanceMetrics();
  };

  // Select multiple businesses
  const selectMultipleBusinesses = async (businesses) => {
    setSelectedBusinesses(businesses);
    
    // If there's at least one business selected, use the first one as the primary
    if (businesses.length > 0) {
      const primaryBusiness = businesses[0];
      setSelectedBusiness(primaryBusiness);
      
      // Set review URI from business metadata if available
      if (primaryBusiness.metadata?.newReviewUri) {
        setReviewUri(primaryBusiness.metadata.newReviewUri);
      }
      
      // Fetch reviews for the primary business
      const accountId = primaryBusiness.accountId;
      const locationId = primaryBusiness.name.split("/")[1];
      await fetchReviews(accountId, locationId);
      // Also fetch local reviews when business is selected
      await fetchLocalReviews(locationId);
      // Fetch performance metrics for the selected business
      await fetchPerformanceMetrics();
    } else {
      // If no businesses selected, clear the primary selection
      setSelectedBusiness(null);
      setReviews([]);
      setLocalReviews([]);
      setPerformanceData(null); // Clear performance data
    }
  };

  // Toggle selection of a business (for multiple selections)
  const toggleBusinessSelection = async (business) => {
    const isSelected = selectedBusinesses.some(b => b.name === business.name);
    
    let newSelections;
    if (isSelected) {
      // Remove from selection
      newSelections = selectedBusinesses.filter(b => b.name !== business.name);
    } else {
      // Add to selection
      newSelections = [...selectedBusinesses, business];
    }
    
    await selectMultipleBusinesses(newSelections);
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

  // Calculate performance totals
  const getPerformanceStats = () => {
    return performanceData || { websiteClicks: 0, callClicks: 0 };
  };

  // Refresh all data when needed
  const refreshData = async () => {
    if (isConnected && selectedBusiness) {
      // Ensure the selected business is set
      console.log('Refreshing data for selected business:', selectedBusiness.title || selectedBusiness.name);
      
      const locationId = selectedBusiness.name.split("/")[1];
      await fetchReviews(selectedBusiness.accountId, locationId);
      await fetchLocalReviews(locationId);
      await fetchScheduledPosts();
      await fetchPerformanceMetrics();
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [authUser]);

  // Fetch scheduled posts when selected business changes
  useEffect(() => {
    if (selectedBusiness) {
      fetchScheduledPosts();
      // Fetch performance metrics when business is selected
      fetchPerformanceMetrics();
    }
  }, [selectedBusiness]);

  const value = {
    // State
    user,
    businesses,
    selectedBusiness,
    selectedBusinesses, // For multiple selections
    reviews,
    localReviews,
    loading,
    isConnected,
    reviewUri,
    tokenDetails,
    scheduledPosts,
    loadingScheduled,
    // Performance metrics
    performanceData,
    performanceLoading,
    performanceError,
    // Actions
    setBusinesses,
    setSelectedBusiness,
    setSelectedBusinesses, // For multiple selections
    setReviews,
    setLocalReviews,
    setLoading,
    checkAuthStatus,
    connectGoogle,
    disconnectGoogle,
    fetchBusinesses,
    fetchReviews,
    fetchLocalReviews,
    selectBusiness,
    selectMultipleBusinesses, // For multiple selections
    toggleBusinessSelection, // Toggle selection
    refreshData,
    fetchScheduledPosts,
    fetchPerformanceMetrics,
    // Computed values
    reviewStats: getReviewStats(),
    performanceStats: getPerformanceStats()
  };

  return (
    <GoogleBusinessContext.Provider value={value}>
      {children}
    </GoogleBusinessContext.Provider>
  );
};