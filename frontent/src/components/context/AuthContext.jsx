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
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
          setIsAuthenticated(true);
        }
      }
    } catch (_) {}
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
    <userContext.Provider value={{ user, token, isAuthenticated, isLoading, signup, login, logout, signupWithGoogle, setUser }}>
      {children}
    </userContext.Provider>
  )
}

export default AuthContextProvider