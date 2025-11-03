/**
 * ServiceTemplate - A template for creating service modules
 */
class ServiceTemplate {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * Example method for making API calls
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} API response
   */
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

export default ServiceTemplate;