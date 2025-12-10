import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const GoogleBusinessContext = createContext();

// Helper function to get storage key for current user
const getStorageKey = (userId) => `google_business_data_${userId || 'guest'}`;
const getOAuthStorageKey = (userId) => `google_oauth_tokens_${userId || 'guest'}`;

export const useGoogleBusiness = () => {
  const context = useContext(GoogleBusinessContext);
  if (!context) {
    throw new Error('useGoogleBusiness must be used within a GoogleBusinessProvider');
  }
  return context;
};

export const GoogleBusinessProvider = ({ children }) => {
  const { user: authUser, token } = useAuth();
  const BACKEND_URL = (import.meta.env.VITE_API_BASE ).replace(/\/$/, '');
  const { subscriptionData } = useAuth();

  // ==============================
  // OLD STATE (UNCHANGED)
  // ==============================
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
      loadingScheduled: false,
      reviewStats: null
    };
  });

  // ==============================
  // NEW STATE: Google OAuth Tokens
  // ==============================
  const [googleOAuth, setGoogleOAuth] = useState(() => {
    const saved = localStorage.getItem(getOAuthStorageKey(authUser?.id));
    return saved ? JSON.parse(saved) : {
      access_token: null,
      refresh_token: null,
      expiry_date: null,
    };
  });

  const setGoogleOAuthTokens = useCallback((tokens) => {
    setGoogleOAuth(tokens);
    localStorage.setItem(
      getOAuthStorageKey(authUser?.id),
      JSON.stringify(tokens)
    );
  }, [authUser?.id]);

  // ==============================
  // SYNC GOOGLE OAUTH WITH TOKEN DETAILS
  // ==============================
  useEffect(() => {
    if (googleOAuth?.access_token) {
      updateState({
        tokenDetails: {
          accessToken: googleOAuth.access_token,
          refreshToken: googleOAuth.refresh_token || state.tokenDetails?.refreshToken,
          expiryDate: googleOAuth.expiry_date ? new Date(googleOAuth.expiry_date) : null,
          scopes: state.tokenDetails?.scopes || []
        }
      });
    }
  }, [googleOAuth, authUser?.id]);

  // ==============================
  // STATE SETTERS
  // ==============================
  const updateState = useCallback((updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(getStorageKey(authUser?.id), JSON.stringify(newState));
      return newState;
    });
  }, [authUser?.id]);

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
    loadingScheduled,
    reviewStats
  } = state;

  const setUser = useCallback((u) => updateState({ user: u }), [updateState]);
  const setBusinesses = useCallback((v) => updateState({ businesses: v }), [updateState]);
  const setSelectedBusiness = useCallback((v) => updateState({ selectedBusiness: v }), [updateState]);
  const setSelectedBusinesses = useCallback((v) => updateState({ selectedBusinesses: v }), [updateState]);
  const setReviews = useCallback((v) => updateState({ reviews: v }), [updateState]);
  const setLocalReviews = useCallback((v) => updateState({ localReviews: v }), [updateState]);
  const setLoading = useCallback((v) => updateState({ loading: v }), [updateState]);
  const setIsConnected = useCallback((v) => updateState({ isConnected: v }), [updateState]);
  const setReviewUri = useCallback((v) => updateState({ reviewUri: v }), [updateState]);
  const setTokenDetails = useCallback((v) => updateState({ tokenDetails: v }), [updateState]);
  const setPerformanceData = useCallback((v) => updateState({ performanceData: v }), [updateState]);
  const setPerformanceLoading = useCallback((v) => updateState({ performanceLoading: v }), [updateState]);
  const setPerformanceError = useCallback((v) => updateState({ performanceError: v }), [updateState]);
  const setScheduledPosts = useCallback((v) => updateState({ scheduledPosts: v }), [updateState]);
  const setLoadingScheduled = useCallback((v) => updateState({ loadingScheduled: v }), [updateState]);
  const setReviewStats = useCallback((v) => updateState({ reviewStats: v }), [updateState]);

  // ==============================
  // RESET ON USER CHANGE
  // ==============================
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
      loadingScheduled: false,
      reviewStats: null
    });
    
    const savedOAuth = localStorage.getItem(getOAuthStorageKey(authUser?.id));
    if (savedOAuth) {
      setGoogleOAuth(JSON.parse(savedOAuth));
    }
    
  }, [authUser?.id]);
  
  // ==============================
  // AUTH HEADER
  // ==============================
  const authHeaders = () => ({
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  });
  
  console.log("TOken Details",tokenDetails)
  console.log("Google OAuth",googleOAuth)
  console.log("Review Stats",reviewStats)

  // ==============================
  // GET Google params FOR API
  // ==============================
  const googleParams = () =>
    `access_token=${googleOAuth.access_token || ''}&refresh_token=${googleOAuth.refresh_token || ''}&expiry_date=${googleOAuth.expiry_date || ''}`;

  // ==============================
  // CONNECT GOOGLE
  // ==============================
  const connectGoogle = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };
 
  // ==============================
  // DISCONNECT GOOGLE
  // ==============================
  const disconnectGoogle = async (silent = false) => {
    if (!silent) {
      toast.info('Disconnecting Google Business Profile...');
    }
    
    try {
      // Clear local state
      setUser(null);
      setBusinesses([]);
      setSelectedBusiness(null);
      setSelectedBusinesses([]);
      setReviews([]);
      setLocalReviews([]);
      setIsConnected(false);
      setTokenDetails({ accessToken: null, refreshToken: null, expiryDate: null, scopes: [] });
      
      // Clear Google OAuth tokens
      setGoogleOAuth({
        access_token: null,
        refresh_token: null,
        expiry_date: null
      });
      
      // Clear local storage
      localStorage.removeItem(getStorageKey(authUser?.id));
      localStorage.removeItem(getOAuthStorageKey(authUser?.id));
      
      if (!silent) {
        toast.success('Successfully disconnected Google Business Profile');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      if (!silent) {
        toast.error('Failed to disconnect Google Business Profile');
      }
      return { success: false, error };
    }
  
  };

  
  // ==============================
  // AUTO DISCONNECT ON SUBSCRIPTION END
  // ==============================
  useEffect(() => {
    if (authUser?.id && subscriptionData) {
      const now = new Date();
      const endDate = subscriptionData.endDate ? new Date(subscriptionData.endDate) : null;
      
      // Check if subscription is active
      const isSubscriptionActive = subscriptionData.status === 'active' && 
                                endDate && 
                                endDate > now;
      
      // If not active and token exists (meaning user was connected), disconnect
      if (!isSubscriptionActive && (googleOAuth?.access_token || tokenDetails?.accessToken)) {
        console.log('No active subscription - disconnecting Google Business Profile');
        disconnectGoogle(true).then(() => {
          toast.warning('Your subscription has ended. Google Business Profile has been disconnected.');
        });
      }
    }
  }, [subscriptionData, googleOAuth?.access_token, tokenDetails?.accessToken, authUser?.id]);

  // ==============================
  // FETCH BUSINESSES
  // ==============================
  const fetchBusinesses = async () => {
    if (!googleOAuth.access_token) return;
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/google/businesses?${googleParams()}`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user || {});
        setBusinesses(data.businesses || []);
        setIsConnected(true);

        if (data.businesses?.length > 0 && !selectedBusiness) {
          const first = data.businesses[0];
          setSelectedBusiness(first);
          setSelectedBusinesses([first]);
          if (first.metadata?.newReviewUri) setReviewUri(first.metadata.newReviewUri);

          await fetchReviews(first.accountId, first.name.split("/")[1]);
          await fetchLocalReviews(first.name.split("/")[1]);
        }
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      toast.error("Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FETCH REVIEWS
  // ==============================
  const fetchReviews = async (accountId, locationId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/google/reviews/${accountId}/${locationId}?${googleParams()}`, {
        headers: authHeaders(),
      });

      const data = await res.json();
      if (res.ok) {
        const reviews = data.reviews || [];
        setReviews(reviews);
        // Calculate and set review stats
        const stats = calculateReviewStats(reviews);
        setReviewStats(stats);
      } else {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
      setReviewStats(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateReviewStats = useCallback((reviews) => {
    // console.log('Calculating review stats for reviews:', reviews);
    if (!reviews || !reviews.length) {
      console.log('No reviews to calculate stats');
      return null;
    }
    
    // Map string ratings to numbers
    const ratingMap = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5
    };
    
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => {
      const rating = ratingMap[review.starRating] || 0;
      // console.log(`Review ID: ${review.reviewId}, Star Rating: ${review.starRating}, Mapped Rating: ${rating}`);
      return sum + rating;
    }, 0);
    
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // Group by rating
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      const rating = ratingMap[review.starRating];
      if (rating && rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });
    
    // Convert to array format expected by the UI
    const ratings = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratingCounts[rating] || 0,
      percentage: totalReviews > 0 ? Math.round((ratingCounts[rating] / totalReviews) * 100) : 0
    }));
    
    // Get recent reviews (last 5)
    const recentReviews = [...reviews]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 5);
    
    const result = {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratings,  // Array format for the UI
      recentReviews
    };
    
    console.log('Calculated review stats:', result);
    return result;
  }, []);

  const fetchLocalReviews = async (locationId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/reviews/allReviews/${locationId}`, {
        headers: authHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setLocalReviews(data || []);
      } else {
        setLocalReviews([]);
      }
    } catch (err) {
      setLocalReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // SELECT BUSINESS
  // ==============================
  const selectBusiness = async (b) => {
    setSelectedBusiness(b);
    if (b.metadata?.newReviewUri) setReviewUri(b.metadata.newReviewUri);

    await fetchReviews(b.accountId, b.name.split("/")[1]);
    await fetchLocalReviews(b.name.split("/")[1]);
  };

  // ==============================
  // SCHEDULED POSTS
  // ==============================
  const fetchScheduledPosts = useCallback(async () => {
    if (!selectedBusiness) return;
    
    const locationId = selectedBusiness.name.split("/")[1];
    if (!locationId) return;

    // console.log('Frontend: Fetching scheduled posts for locationId:', locationId);
    
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
      if (!error.message.includes('404')) {
        toast.error(error.message || 'Failed to load scheduled posts');
      }
    } finally {
      setLoadingScheduled(false);
    }
  }, [selectedBusiness, token]);

  // Fetch scheduled posts when selected business changes
  useEffect(() => {
    if (selectedBusiness?.name) {
      fetchScheduledPosts();
    }
  }, [selectedBusiness, fetchScheduledPosts]);

  // ==============================
  // PERFORMANCE METRICS
  // ==============================
  const fetchPerformanceMetrics = async ({ startDate, endDate }) => {
    if (!selectedBusiness) {
      console.error('No business selected');
      return null;
    }

    try {
      setPerformanceLoading(true);
      setPerformanceError(null);
      
      const locationId = selectedBusiness.name.split("/")[1];
      
      // Format dates as required by the backend
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Get the access token from the OAuth context
      const accessToken = googleOAuth?.access_token;
      if (!accessToken) {
        throw new Error('No access token available. Please reconnect your Google account.');
      }
      
      const requestBody = {
        locationId,
        accessToken,
        startDate: {
          year: start.getFullYear(),
          month: start.getMonth() + 1, // JavaScript months are 0-indexed
          day: start.getDate()
        },
        endDate: {
          year: end.getFullYear(),
          month: end.getMonth() + 1, // JavaScript months are 0-indexed
          day: end.getDate()
        }
      };

      const response = await fetch(`${BACKEND_URL}/api/audit/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...authHeaders()
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          // Handle expired or invalid token
          setPerformanceError('Your session has expired. Please reconnect your Google account.');
          // Optionally trigger re-authentication
          // disconnectGoogle();
        }
        throw new Error(errorData.error || 'Failed to fetch performance metrics');
      }
      const data = await response.json();
      console.log("Performace",data)
      setPerformanceData(data.totals);
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setPerformanceError(error.message);
      return null;
    } finally {
      setPerformanceLoading(false);
    }
  };

  // ==============================
  // VALUE EXPORT
  // ==============================
  const value = {
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
    loadingScheduled,
    reviewStats,
    googleOAuth,
    setGoogleOAuthTokens,

    connectGoogle,
    disconnectGoogle,
    fetchBusinesses,
    fetchReviews,
    selectBusiness,
    fetchLocalReviews,
    fetchPerformanceMetrics,
    fetchScheduledPosts,
  };

  // Handle OAuth callback and save tokens from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expiry_date = params.get('expiry_date');
    
    if (access_token && authUser?.id) {
      const tokens = {
        access_token,
        refresh_token,
        expiry_date: expiry_date ? parseInt(expiry_date) : null
      };
      
      // Save tokens to state and localStorage
      setGoogleOAuthTokens(tokens);
      
      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [authUser?.id]);

  // Fetch businesses when we have a valid token
  useEffect(() => {
    if (googleOAuth.access_token && authUser) {
      fetchBusinesses();
    }
  }, [googleOAuth.access_token, authUser]);

  return (
    <GoogleBusinessContext.Provider value={value}>
      {children}
    </GoogleBusinessContext.Provider>
  );
};
