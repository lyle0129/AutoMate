import { ApiError } from '../services/apiClient';

/**
 * Format error messages for user display
 * @param {Error|ApiError|string} error - The error to format
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof ApiError) {
    // Handle specific API errors
    if (error.isAuthError()) {
      return 'Please log in to continue';
    }
    
    if (error.isAuthzError()) {
      return 'You do not have permission to perform this action';
    }
    
    if (error.isValidationError()) {
      return error.message || 'Please check your input and try again';
    }
    
    if (error.isNotFoundError()) {
      return 'The requested resource was not found';
    }
    
    if (error.isConflictError()) {
      return error.message || 'This action conflicts with existing data';
    }
    
    if (error.isServerError()) {
      return 'A server error occurred. Please try again later';
    }
    
    if (error.isNetworkError()) {
      return 'Unable to connect to the server. Please check your internet connection';
    }
    
    return error.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
};

/**
 * Log errors for debugging (in development) or monitoring (in production)
 * @param {Error|ApiError|string} error - The error to log
 * @param {Object} context - Additional context about the error
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message || error,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof ApiError) {
    errorInfo.status = error.status;
    errorInfo.data = error.data;
  }

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('Application Error:', errorInfo);
  }

  // In production, you might want to send to an error monitoring service
  // Example: Sentry, LogRocket, etc.
  if (import.meta.env.PROD) {
    // sendToErrorMonitoring(errorInfo);
  }
};

/**
 * Handle errors consistently across the application
 * @param {Error|ApiError|string} error - The error to handle
 * @param {Object} context - Additional context about the error
 * @returns {string} User-friendly error message
 */
export const handleError = (error, context = {}) => {
  logError(error, context);
  return formatErrorMessage(error);
};

export default {
  formatErrorMessage,
  logError,
  handleError,
};