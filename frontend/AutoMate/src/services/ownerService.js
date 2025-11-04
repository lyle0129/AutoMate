import apiClient from './apiClient';

/**
 * Owner service for API communication
 */
class OwnerService {
  /**
   * Get all owners (admin/mechanic only)
   */
  async getAllOwners() {
    return apiClient.get('/owners');
  }

  /**
   * Get owner by ID
   */
  async getOwnerById(id) {
    return apiClient.get(`/owners/${id}`);
  }

  /**
   * Get owner with their vehicles
   */
  async getOwnerWithVehicles(id) {
    return apiClient.get(`/owners/${id}/with-vehicles`);
  }

  /**
   * Get vehicles for a specific owner
   */
  async getOwnerVehicles(id) {
    return apiClient.get(`/owners/${id}/vehicles`);
  }

  /**
   * Create new owner (admin only)
   */
  async createOwner(ownerData) {
    return apiClient.post('/owners', ownerData);
  }

  /**
   * Update owner (admin only)
   */
  async updateOwner(id, ownerData) {
    return apiClient.put(`/owners/${id}`, ownerData);
  }

  /**
   * Delete owner (admin only)
   */
  async deleteOwner(id) {
    return apiClient.delete(`/owners/${id}`);
  }
}

export default new OwnerService();