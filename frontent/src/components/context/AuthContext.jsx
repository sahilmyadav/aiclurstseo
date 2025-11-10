import React from 'react'
import { createContext, useContext } from 'react'
import { useState,useEffect } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';

const userContext = createContext();
export const useAuth = () => useContext(userContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with true to indicate initial loading
  const [isInitialized, setIsInitialized] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE ;
  console.log("Backend API Base",API_BASE)

  // axios instance
  const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  });

  // attach token if available
  api.interceptors.request.use((config) => {
    const raw = localStorage.getItem('auth');
    let t = token;
    try {
      if (!t && raw) t = JSON.parse(raw)?.token;
    } catch (_) {}
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const raw = localStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token) {
            // Set token immediately for API calls
            setToken(parsed.token);
            
            // Fetch fresh user data to validate token
            const { success, user: userData } = await fetchCurrentUser();
            if (success && userData) {
              setUser(userData);
              setIsAuthenticated(true);
              persist({ user: userData, token: parsed.token });
            } else {
              // If token is invalid, clear auth data
              clearPersist();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearPersist();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const persist = (data) => {
    localStorage.setItem('auth', JSON.stringify(data));
  };

  const clearPersist = () => {
    localStorage.removeItem('auth');
  };

  const signup = async ({ username, email, password, phone }) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name: username, email, password, phone });
      console.log(data)
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      persist({ user: data.user, token: data.token });
      return { success: true, message: data?.message || 'Signup successful' };
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Signup failed';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    setIsLoading(true);
    try {
      const payload = emailOrPhone.includes('@') ? { email: emailOrPhone, password } : { phone: emailOrPhone, password };
      const { data } = await api.post('/api/auth/login', payload);

      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      persist({ user: data.user, token: data.token });
      return { success: true, message: data?.message || 'Login successful' };
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Login failed';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    clearPersist();
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If token is invalid, clear local storage
      if (error.response?.status === 401) {
        clearPersist();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user' };
    }
  };

  const signupWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Send ID token to backend for verification and user creation
      const { data } = await api.post('/api/auth/firebase/google-signup', { idToken });
      
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      persist({ user: data.user, token: data.token });
      
      return { success: true, message: data?.message || 'Google signup successful' };
    } catch (e) {
      console.error('Google signup error:', e);
      const msg = e?.response?.data?.message || e.message || 'Google signup failed';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

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
      isInitialized
    }}>
      {children}
    </userContext.Provider>
  )
}

export default AuthContextProvider