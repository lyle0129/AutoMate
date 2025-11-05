import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  checkAuthStatus, 
  storeUserData, 
  clearUserData, 
  getStoredUserData 
} from '../services/authService';

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CHECK_AUTH_START: 'CHECK_AUTH_START',
  CHECK_AUTH_SUCCESS: 'CHECK_AUTH_SUCCESS',
  CHECK_AUTH_FAILURE: 'CHECK_AUTH_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial auth state - check for stored user data
const getInitialState = () => {
  const storedUser = getStoredUserData();
  return {
    user: storedUser,
    isAuthenticated: !!storedUser,
    isLoading: true, // Still need to verify with server
    error: null,
  };
};

const initialState = getInitialState();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.CHECK_AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.CHECK_AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.CHECK_AUTH_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    verifyAuthStatus();
  }, []);

  // Verify authentication status with server
  const verifyAuthStatus = async () => {
    dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_START });
    
    const result = await checkAuthStatus();
    
    if (result.success && result.data.user) {
      dispatch({ 
        type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS, 
        payload: result.data.user 
      });
      storeUserData(result.data.user);
    } else {
      dispatch({ 
        type: AUTH_ACTIONS.CHECK_AUTH_FAILURE, 
        payload: null 
      });
      clearUserData();
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    const result = await loginUser(credentials);
    
    if (result.success && result.data.user) {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: result.data.user 
      });
      storeUserData(result.data.user);
      return { success: true, user: result.data.user };
    } else {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: result.error 
      });
      return { success: false, error: result.error };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    const result = await registerUser(userData);
    
    if (result.success && result.data.user) {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: result.data.user 
      });
      storeUserData(result.data.user);
      return { success: true, user: result.data.user };
    } else {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: result.error 
      });
      return { success: false, error: result.error };
    }
  };

  // Logout function
  const logout = async () => {
    const result = await logoutUser();
    
    // Clear local state regardless of server response
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    clearUserData();
    
    if (!result.success) {
      console.error('Logout error:', result.error);
    }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ 
      type: AUTH_ACTIONS.UPDATE_USER, 
      payload: userData 
    });
    storeUserData(userData);
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuthStatus: verifyAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;