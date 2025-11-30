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
  
  // Subscription-related state
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [trialEligible, setTrialEligible] = useState(true)
  const [trialMessage, setTrialMessage] = useState("")
  const [trialData, setTrialData] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState(null)

  // Subscription plans (pricing) loaded once and shared across app
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
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
    if (!userId) return
    
    try {
      setSubscriptionLoading(true)
      setSubscriptionError(null)
      
      // Check trial eligibility
      const eligibilityResponse = await api.get(
        `/subscription/check-trial-eligibility/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      console.log(eligibilityResponse.data)
      setTrialEligible(eligibilityResponse.data.eligible)
      if (!eligibilityResponse.data.eligible) {
        setTrialMessage(eligibilityResponse.data.reason)
      }

      // Check for active subscription
      const subscriptionResponse = await api.get(
        `/subscription/verify?userId=${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (subscriptionResponse.data.active && subscriptionResponse.data.planType === 'trial') {
        setTrialData({
          endDate: new Date(subscriptionResponse.data.endDate),
          planType: subscriptionResponse.data.planType
        })
        setSubscriptionData(subscriptionResponse.data)
      } else {
        setTrialData(null)
        setSubscriptionData(subscriptionResponse.data)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setSubscriptionError(error.response?.data?.message || "Failed to check subscription status")
    } finally {
      setSubscriptionLoading(false)
    }
  }, [])

  // Activate trial
  const activateTrial = async (userId, token) => {
    if (!userId) {
      throw new Error("User not found")
    }

    if (!trialEligible) {
      throw new Error(trialMessage || "You are not eligible for a free trial.")
    }

    try {
      setSubscriptionLoading(true)
      const res = await api.post(
        `/subscription/start-trial`, 
        { userId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      // Update trial status
      setTrialEligible(false)
      setTrialMessage("Trial has been used")
      
      if (res.data.endDate) {
        setTrialData({
          endDate: new Date(res.data.endDate),
          planType: 'trial'
        })
        
        // Update subscription data
        setSubscriptionData({
          active: true,
          planType: 'trial',
          endDate: res.data.endDate,
          profiles: 1
        })
      }
      
      return res.data
    } catch (error) {
      console.error('Error activating trial:', error)
      throw new Error(error.response?.data?.message || "Failed to activate trial")
    } finally {
      setSubscriptionLoading(false)
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

  // Fetch subscription data when user state is available
  useEffect(() => {
    if (user && token) {
      const userId = user._id || user.id
      if (userId) {
        checkSubscriptionStatus(userId, token)
      }
    }
  }, [user, token, checkSubscriptionStatus])

  // Fetch subscription plans (pricing) once
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true)
        setPlansError(null)
        const { data } = await api.get(
          `/subscription/plans`
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