// Authentication service for API communication
import apiClient, { ApiError } from './apiClient';

// Helper function to handle API responses consistently
const handleApiResponse = async (apiCall) => {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { 
        success: false, 
        error: error.message,
        status: error.status 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    };
  }
};

// Login user
export const loginUser = async (credentials) => {
  return handleApiResponse(() => apiClient.post('/auth/login', credentials));
};

// Register user
export const registerUser = async (userData) => {
  return handleApiResponse(() => apiClient.post('/auth/register', userData));
};

// Logout user
export const logoutUser = async () => {
  return handleApiResponse(() => apiClient.post('/auth/logout'));
};

// Check authentication status
export const checkAuthStatus = async () => {
  try {
    // Use the new /auth/me endpoint to verify authentication
    const data = await apiClient.get('/auth/me');
    
    if (data.user) {
      // Update stored user data with fresh data from server
      storeUserData(data.user);
      return { 
        success: true, 
        data: { user: data.user } 
      };
    } else {
      // No user data returned
      clearUserData();
      return { success: false, error: 'No user data received' };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isAuthError()) {
        // Unauthorized - clear stored data
        clearUserData();
        return { success: false, error: 'Authentication required' };
      } else if (error.isNetworkError()) {
        // Network error - assume offline, keep stored user if available
        const storedUser = getStoredUserData();
        if (storedUser) {
          return { 
            success: true, 
            data: { user: storedUser },
            offline: true 
          };
        }
      }
    }
    
    // Clear stored data on any other error
    clearUserData();
    return { 
      success: false, 
      error: error.message || 'Failed to check authentication status' 
    };
  }
};

// Store user data in localStorage for session persistence
export const storeUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user data from localStorage
export const clearUserData = () => {
  localStorage.removeItem('user');
};

// Get stored user data
export const getStoredUserData = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  checkAuthStatus,
  storeUserData,
  clearUserData,
  getStoredUserData,
};