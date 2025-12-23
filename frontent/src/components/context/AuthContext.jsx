import React from 'react'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../config/firebase'

const userContext = createContext()
export const useAuth = () => useContext(userContext)

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start with true to indicate initial loading
  const [isInitialized, setIsInitialized] = useState(false)
  // console.log("User >>>>>>>",user)
  // Subscription-related state
  const [subscriptionData, setSubscriptionData] = useState(null);
  // console.log("Subs >>>>>>>",subscriptionData);
  const [trialEligible, setTrialEligible] = useState(true);
  const [trialMessage, setTrialMessage] = useState("");
  const [trialData, setTrialData] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // Transaction state
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  // Subscription plans (pricing) loaded once and shared across app
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE
  console.log("Backend API Base", API_BASE)

  // axios instance
  const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  })

  // attach token if available
  api.interceptors.request.use((config) => {
    const raw = localStorage.getItem('auth')
    let t = token
    try {
      if (!t && raw) t = JSON.parse(raw)?.token
    } catch (_) {}
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })

  // Check trial eligibility and active trial status
  const checkSubscriptionStatus = useCallback(async (userId, token) => {
    if (!userId) return;
    
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      // Check trial eligibility first
      try {
        const eligibilityResponse = await axios.get(
          `${API_BASE}/api/subscription/check-trial-eligibility/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        // console.log('Trial eligibility:', eligibilityResponse.data);
        setTrialEligible(eligibilityResponse.data.eligible);
        if (!eligibilityResponse.data.eligible) {
          setTrialMessage(eligibilityResponse.data.reason);
        }
      } catch (error) {
        console.error('Error checking trial eligibility:', error);
        // Don't fail the whole process if trial check fails
      }

      // Check for subscription (active or expired)
      try {
        const response = await axios.get(
          `${API_BASE}/api/subscription/verify?userId=${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // console.log('Subscription response:', response.data);
        
        if (response.data.success) {
          if (response.data.subscription) {
            // Subscription found (could be active or expired)
            const sub = response.data.subscription;
            const now = new Date();
            const endDate = new Date(sub.endDate);
            const isActive = sub.status === 'active' && endDate > now;
            
            const subscription = {
              active: isActive,
              id: sub.id,
              planType: sub.planType,
              status: sub.status,
              profiles: sub.profiles || 1,
              startDate: sub.startDate,
              endDate: sub.endDate,
              daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
              isTrial: sub.planType === 'trial',
              pricePerProfile: sub.pricePerProfile || 0,
              totalPrice: sub.totalPrice || 0,
              // Include all subscription data from the server
              ...sub
            };
            
            // console.log('Setting subscription data:', subscription);
            setSubscriptionData(subscription);
            
            if (subscription.isTrial) {
              setTrialData({
                endDate: new Date(subscription.endDate),
                planType: 'trial',
                status: subscription.status,
                isActive: isActive
              });
            } else {
              setTrialData(null);
            }
          } else {
            // No subscription found
            console.log('No subscription data found');
            setSubscriptionData({
              active: false,
              planType: null,
              status: null,
              endDate: null,
              profiles: 0
            });
            setTrialData(null);
          }
        } else {
          // API returned success: false
          console.error('Subscription verification failed:', response.data.error);
          setSubscriptionError(response.data.error || 'Failed to verify subscription');
          setSubscriptionData({
            active: false,
            planType: null,
            endDate: null,
            profiles: 0
          });
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionError(error.response?.data?.error || error.message || 'Failed to check subscription status');
        setSubscriptionData({
          active: false,
          planType: null,
          endDate: null,
          profiles: 0
        });
      }
    } catch (error) {
      console.error('Error in subscription check:', error);
      setSubscriptionError(error.message || 'Failed to process subscription check');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [API_BASE]);

  // Activate trial
  const activateTrial = async () => {
    const userId = user?._id || user?.id;
    
    if (!userId) {
      throw new Error("User not found. Please log in again.");
    }

    if (!trialEligible) {
      throw new Error(trialMessage || "You are not eligible for a free trial.");
    }

    try {
      setSubscriptionLoading(true);
      console.log('Sending trial activation request...', { userId });
      
      const response = await axios.post(
        `${API_BASE}/api/subscription/start-trial`, 
        { userId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // console.log('Trial activation response:', response.data);
      
      // Update trial status
      setTrialEligible(false);
      setTrialMessage("Trial has been used");
      
      if (response.data.endDate) {
        setTrialData({
          endDate: new Date(response.data.endDate),
          planType: 'trial'
        });
        
        // Update subscription data
        setSubscriptionData(prev => ({
          ...prev,
          active: true,
          planType: 'trial',
          endDate: response.data.endDate,
          profiles: 1,
          status: 'active'
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error activating trial:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    } finally {
      setSubscriptionLoading(false);
    }
  }

  // Calculate remaining trial days
  const getRemainingTrialDays = () => {
    if (!trialData?.endDate) return 0

    const today = new Date()
    const end = new Date(trialData.endDate)

    // Strip time (set to midnight)
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async (userId, token) => {
    if (!userId || !token) return;

    try {
      setTransactionsLoading(true);
      setTransactionsError(null);

      const response = await axios.get(
        `${API_BASE}/api/subscription/transactions/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Transactions response:', response.data);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactionsError(error.response?.data?.message || error.message || 'Failed to fetch transaction history');
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [API_BASE]);

  // Fetch subscription data when user state is available
  useEffect(() => {
    if (user && token) {
      const userId = user._id || user.id;
      if (userId) {
        checkSubscriptionStatus(userId, token);
        fetchUserTransactions(userId, token);
      }
    }
  }, [user, token, checkSubscriptionStatus, fetchUserTransactions]);

  // Fetch subscription plans (pricing) once
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true)
        setPlansError(null)
        const { data } = await axios.get(
          `${API_BASE}/api/subscription/plans`
        )
        setPlans(data || [])
      } catch (error) {
        console.error('Error fetching plans:', error)
        setPlansError(
          error?.response?.data?.message || 'Failed to load subscription plans'
        )
      } finally {
        setPlansLoading(false)
      }
    }

    fetchPlans()
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const raw = localStorage.getItem('auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.token) {
            // Set token immediately for API calls
            setToken(parsed.token)
            
            // Fetch fresh user data to validate token
            const { success, user: userData } = await fetchCurrentUser()
            if (success && userData) {
              setUser(userData)
              setIsAuthenticated(true)
              persist({ user: userData, token: parsed.token })
            } else {
              // If token is invalid, clear auth data
              clearPersist()
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearPersist()
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  const persist = (data) => {
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const clearPersist = () => {
    localStorage.removeItem('auth')
  }

  const signup = async ({ username, email, password, phone }) => {
    // setIsLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', { name: username, email, password, phone })
      console.log(data)
      setUser(data.user)
      setToken(data.token)
      setIsAuthenticated(true)
      persist({ user: data.user, token: data.token })
      return { success: true, message: data?.message || 'Signup successful' }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Signup failed'
      return { success: false, error: msg }
    } finally {
      // setIsLoading(false)
    }
  }

  const login = async (emailOrPhone, password) => {
    // setIsLoading(true)
    try {
      const payload = emailOrPhone.includes('@') ? { email: emailOrPhone, password } : { phone: emailOrPhone, password }
      const { data } = await api.post('/api/auth/login', payload)

      setUser(data.user)
      setToken(data.token)
      setIsAuthenticated(true)
      persist({ user: data.user, token: data.token })
      return { success: true, message: data?.message || 'Login successful', user: data.user }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Login failed'
      return { success: false, error: msg }
    } finally {
      // setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    setSubscriptionData(null)
    setTrialData(null)
    setTrialEligible(true)
    setTrialMessage("")
    clearPersist()
  }

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data)
      return { success: true, user: data }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // If token is invalid, clear local storage
      if (error.response?.status === 401) {
        clearPersist()
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
      }
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user' }
    }
  }

  const signupWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()
      
      // Send ID token to backend for verification and user creation
      const { data } = await api.post('/api/auth/firebase/google-signup', { idToken })
      
      setUser(data.user)
      setToken(data.token)
      setIsAuthenticated(true)
      persist({ user: data.user, token: data.token })
      
      return { success: true, message: data?.message || 'Google signup successful' }
    } catch (e) {
      console.error('Google signup error:', e)
      const msg = e?.response?.data?.message || e.message || 'Google signup failed'
      return { success: false, error: msg }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <userContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      isLoading: isLoading || !isInitialized, // Consider loading true until initialized
      signup, 
      login, 
      logout, 
      signupWithGoogle, 
      fetchCurrentUser,
      setUser,
      isInitialized,
      // Subscription-related values
      subscriptionData,
      trialEligible,
      trialMessage,
      trialData,
      subscriptionLoading,
      subscriptionError,
      checkSubscriptionStatus,
      activateTrial,
      getRemainingTrialDays,
      // Transactions
      transactions,
      transactionsLoading,
      transactionsError,
      fetchUserTransactions,
      // Plans (pricing)
      plans,
      plansLoading,
      plansError
    }}>
      {children}
    </userContext.Provider>
  )
}

export default AuthContextProvider