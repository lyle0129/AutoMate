import apiClient from './apiClient';

/**
 * Maintenance service for API communication
 */
class MaintenanceService {
  /**
   * Get all maintenance logs (filtered by user role)
   */
  async getAllMaintenanceLogs() {
    return apiClient.get('/maintenance');
  }

  /**
   * Get maintenance log by ID
   */
  async getMaintenanceLogById(id) {
    return apiClient.get(`/maintenance/${id}`);
  }

  /**
   * Get maintenance logs by vehicle ID
   */
  async getMaintenanceLogsByVehicleId(vehicleId) {
    return apiClient.get(`/maintenance/vehicle/${vehicleId}`);
  }

  /**
   * Get maintenance history summary for a vehicle
   */
  async getMaintenanceHistorySummary(vehicleId) {
    return apiClient.get(`/maintenance/vehicle/${vehicleId}/summary`);
  }

  /**
   * Get available services for a vehicle
   */
  async getAvailableServicesForVehicle(vehicleId) {
    return apiClient.get(`/maintenance/vehicle/${vehicleId}/services`);
  }

  /**
   * Create new maintenance log (mechanic/admin only)
   */
  async createMaintenanceLog(logData) {
    return apiClient.post('/maintenance', logData);
  }

  /**
   * Update maintenance log (admin only)
   */
  async updateMaintenanceLog(id, logData) {
    return apiClient.put(`/maintenance/${id}`, logData);
  }

  /**
   * Delete maintenance log (admin only)
   */
  async deleteMaintenanceLog(id) {
    return apiClient.delete(`/maintenance/${id}`);
  }

  /**
   * Get unpaid maintenance logs
   */
  async getUnpaidMaintenanceLogs() {
    return apiClient.get('/maintenance/payment/unpaid');
  }

  /**
   * Get paid maintenance logs
   */
  async getPaidMaintenanceLogs() {
    return apiClient.get('/maintenance/payment/paid');
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary() {
    return apiClient.get('/maintenance/payment/summary');
  }

  /**
   * Mark maintenance log as paid (mechanic/admin only)
   */
  async markAsPaid(id, paymentMethod) {
    return apiClient.patch(`/maintenance/${id}/pay`, { paid_using: paymentMethod });
  }

  /**
   * Mark maintenance log as unpaid (admin only)
   */
  async markAsUnpaid(id) {
    return apiClient.patch(`/maintenance/${id}/unpay`);
  }

  /**
   * Update payment method (mechanic/admin only)
   */
  async updatePaymentMethod(id, paymentMethod) {
    return apiClient.patch(`/maintenance/${id}/payment-method`, { paid_using: paymentMethod });
  }
}

export default new MaintenanceService();