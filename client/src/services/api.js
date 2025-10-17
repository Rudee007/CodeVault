// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cv_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', config.method.toUpperCase(), config.url);
      console.log('📦 Request Data:', config.data);
      console.log('🔑 Has Token:', !!token);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', response.config.url, response.status);
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error('❌ API Error:', status, data.message || data);
      
      // ✅ Enhanced 400 error logging for validation debugging
      if (status === 400) {
        console.group('🔍 400 BAD REQUEST - VALIDATION ERROR DETAILS');
        console.error('Error Message:', data.message);
        console.error('Validation Errors:', data.errors);
        console.error('Error Details:', data.details);
        console.error('Full Response Data:', data);
        console.error('Request URL:', error.config.url);
        console.error('Request Method:', error.config.method);
        console.error('Request Data:', error.config.data);
        console.groupEnd();
      }
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        console.warn('🚪 Unauthorized - Clearing token and redirecting to login');
        localStorage.removeItem('cv_token');
        localStorage.removeItem('cv_user');
        localStorage.removeItem('cv_userId');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('🚫 Access denied - Insufficient permissions');
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('🔍 Resource not found');
      }
      
      // Handle 500 Server Error
      if (status === 500) {
        console.error('💥 Server error occurred');
      }
      
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error: No response from server');
      console.error('Request details:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
