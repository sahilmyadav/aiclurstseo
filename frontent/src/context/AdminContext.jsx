import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [metrics, setMetrics] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({
    metrics: false,
    users: false,
    reviews: false
  });
  const [error, setError] = useState({
    metrics: null,
    users: null,
    reviews: null
  });
  const [pagination, setPagination] = useState({
    users: { page: 1, limit: 10, total: 0, pages: 1 },
    reviews: { page: 1, limit: 10, total: 0, pages: 1 }
  });

  const VITE_API_BASE = import.meta.env.VITE_API_BASE;
  console.log("VITE_API_BASE", VITE_API_BASE);
  
  // Axios instance with default config
  const api = axios.create({
    baseURL: VITE_API_BASE || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use((config) => {
    const raw = localStorage.getItem('auth');
    let token = null;
    try {
      if (raw) token = JSON.parse(raw)?.token;
    } catch (_) {}
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle API errors
  const handleError = (error, type) => {
    console.error(`Error fetching ${type}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    setError(prev => ({
      ...prev,
      [type]: errorMessage
    }));
    
    setLoading(prev => ({
      ...prev,
      [type]: false
    }));
  };

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      setLoading(prev => ({ ...prev, metrics: true }));
      setError(prev => ({ ...prev, metrics: null }));
      
      const response = await api.get('/admin/metrics');
      setMetrics(response.data.data.metrics);
      
      return response.data.data;
    } catch (error) {
      handleError(error, 'metrics');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  // Fetch users with pagination
//   const fetchUsers = async (page = 1, limit = 10) => {
//     try {
//       setLoading(prev => ({ ...prev, users: true }));
//       setError(prev => ({ ...prev, users: null }));
      
//       const response = await api.get('/admin/users', {
//         params: { page, limit }
//       });
      
//       setUsers(response.data.data);
//       setPagination(prev => ({
//         ...prev,
//         users: {
//           ...response.data.pagination,
//           page: parseInt(page),
//           limit: parseInt(limit)
//         }
//       }));
      
//       return response.data.data;
//     } catch (error) {
//       handleError(error, 'users');
//       throw error;
//     } finally {
//       setLoading(prev => ({ ...prev, users: false }));
//     }
//   };

  // Fetch reviews with pagination
//   const fetchReviews = async (page = 1, limit = 10) => {
//     try {
//       setLoading(prev => ({ ...prev, reviews: true }));
//       setError(prev => ({ ...prev, reviews: null }));
      
//       const response = await api.get('/admin/reviews', {
//         params: { page, limit }
//       });
      
//       setReviews(response.data.data);
//       setPagination(prev => ({
//         ...prev,
//         reviews: {
//           ...response.data.pagination,
//           page: parseInt(page),
//           limit: parseInt(limit)
//         }
//       }));
      
//       return response.data.data;
//     } catch (error) {
//       handleError(error, 'reviews');
//       throw error;
//     } finally {
//       setLoading(prev => ({ ...prev, reviews: false }));
//     }
//   };

  // Initial data load
  useEffect(() => {
    fetchMetrics();
    // fetchUsers();
    // fetchReviews();
  }, [users.role === 'admin']);

  // Context value
  const value = {
    metrics,
    users,
    reviews,
    loading,
    error,
    pagination,
    // fetchMetrics,
    // fetchUsers,
    // fetchReviews,
    // setPagination
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
