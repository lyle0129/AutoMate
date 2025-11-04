import apiClient from './apiClient';

/**
 * Vehicle service for API communication
 */
class VehicleService {
  /**
   * Get all vehicles (filtered by user role)
   */
  async getAllVehicles() {
    return apiClient.get('/vehicles');
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id) {
    return apiClient.get(`/vehicles/${id}`);
  }

  /**
   * Create new vehicle (admin only)
   */
  async createVehicle(vehicleData) {
    return apiClient.post('/vehicles', vehicleData);
  }

  /**
   * Update vehicle (admin only)
   */
  async updateVehicle(id, vehicleData) {
    return apiClient.put(`/vehicles/${id}`, vehicleData);
  }

  /**
   * Delete vehicle (admin only)
   */
  async deleteVehicle(id) {
    return apiClient.delete(`/vehicles/${id}`);
  }
}

export default new VehicleService();