import { toast } from 'sonner';

const fetchWithAuth = async (url, options = {}) => {
  // Get backend URL from environment variable
  const BACKEND_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject('Session expired. Please log in again.');
    }

    // Handle other error statuses
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }

    // For 204 No Content responses, return null
    if (response.status === 204) {
      return null;
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    toast.error(error.message || 'An error occurred. Please try again.');
    throw error;
  }
};

export default fetchWithAuth;
