import apiClient from './apiClient';

/**
 * Service management service for API communication
 */
class ServiceService {
  /**
   * Get all services
   */
  async getAllServices() {
    return apiClient.get('/services');
  }

  /**
   * Get service by ID
   */
  async getServiceById(id) {
    return apiClient.get(`/services/${id}`);
  }

  /**
   * Create new service (admin only)
   */
  async createService(serviceData) {
    return apiClient.post('/services', serviceData);
  }

  /**
   * Update service (admin only)
   */
  async updateService(id, serviceData) {
    return apiClient.put(`/services/${id}`, serviceData);
  }

  /**
   * Delete service (admin only)
   */
  async deleteService(id) {
    return apiClient.delete(`/services/${id}`);
  }
}

export default new ServiceService();