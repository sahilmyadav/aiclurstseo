/**
 * Dynamic API Configuration
 * Automatically detects the server IP/hostname for API calls
 */

// Get the API base URL dynamically
export const getApiBaseUrl = () => {
  // If VITE_API_BASE is explicitly set and not localhost, use it
  const envApiBase = import.meta.env.VITE_API_BASE;

  if (envApiBase && !envApiBase.includes('localhost') && !envApiBase.includes('127.0.0.1')) {
    return envApiBase.replace(/\/$/, '');
  }

  // In production/deployment, use the same host as the frontend
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    // If running on localhost, use the default backend port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envApiBase || 'http://localhost:8000';
    }

    // For IP-based or domain-based hosting
    // Backend is accessed via /api on the same host (through nginx proxy)
    // Or on port 8000 if direct access
    const isDefaultPort = port === '' || port === '80' || port === '443';

    if (isDefaultPort) {
      // Using nginx reverse proxy - API is on same host
      return `${protocol}//${hostname}`;
    } else {
      // Direct access - backend on port 8000
      return `${protocol}//${hostname}:8000`;
    }
  }

  // Fallback
  return envApiBase || 'http://localhost:8000';
};

// Get the frontend URL dynamically
export const getFrontendUrl = () => {
  const envFrontendUrl = import.meta.env.VITE_FRONTEND_URL;

  if (
    envFrontendUrl &&
    !envFrontendUrl.includes('localhost') &&
    !envFrontendUrl.includes('127.0.0.1')
  ) {
    return envFrontendUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envFrontendUrl || 'http://localhost:5173';
    }

    // For production, return the current origin
    return `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? ':' + port : ''}`;
  }

  return envFrontendUrl || 'http://localhost:5173';
};

// Export constants for backward compatibility
export const API_BASE_URL = getApiBaseUrl();
export const FRONTEND_URL = getFrontendUrl();

// Helper to construct full API URL
export const apiUrl = (path) => {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export default {
  getApiBaseUrl,
  getFrontendUrl,
  apiUrl,
  API_BASE_URL,
  FRONTEND_URL,
};
