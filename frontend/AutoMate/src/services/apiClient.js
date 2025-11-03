// Centralized API client for all backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client class
class ApiClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Always include cookies for authentication
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new ApiError(data.message || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Network error: Unable to connect to server', 0);
      }
      
      throw new ApiError(error.message || 'An unexpected error occurred', 0);
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  // Check if error is due to authentication
  isAuthError() {
    return this.status === 401;
  }

  // Check if error is due to authorization
  isAuthzError() {
    return this.status === 403;
  }

  // Check if error is due to validation
  isValidationError() {
    return this.status === 400;
  }

  // Check if error is due to not found
  isNotFoundError() {
    return this.status === 404;
  }

  // Check if error is due to conflict
  isConflictError() {
    return this.status === 409;
  }

  // Check if error is server error
  isServerError() {
    return this.status >= 500;
  }

  // Check if error is network error
  isNetworkError() {
    return this.status === 0;
  }
}

// Create and export default instance
const apiClient = new ApiClient();

export { ApiClient, ApiError };
export default apiClient;