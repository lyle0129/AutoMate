/**
 * Utility functions for generating role-based routes
 */

/**
 * Generate role-based path for navigation
 * @param {string} userRole - The user's role (admin, mechanic, customer)
 * @param {string} path - The base path (e.g., 'vehicles', 'invoices', 'maintenance')
 * @param {string} [id] - Optional ID parameter
 * @returns {string} The complete role-based path
 */
export const getRolePath = (userRole, path, id = null) => {
  if (!userRole) return '/';
  
  const basePath = `/${userRole}/${path}`;
  return id ? `${basePath}/${id}` : basePath;
};

/**
 * Generate vehicle detail path based on user role
 * @param {string} userRole - The user's role
 * @param {string} vehicleId - The vehicle ID
 * @returns {string} The vehicle detail path
 */
export const getVehicleDetailPath = (userRole, vehicleId) => {
  return getRolePath(userRole, 'vehicles', vehicleId);
};

/**
 * Generate invoice detail path based on user role
 * @param {string} userRole - The user's role
 * @param {string} invoiceId - The invoice ID
 * @returns {string} The invoice detail path
 */
export const getInvoiceDetailPath = (userRole, invoiceId) => {
  return getRolePath(userRole, 'invoices', invoiceId);
};

/**
 * Generate vehicles list path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} The vehicles list path
 */
export const getVehiclesListPath = (userRole) => {
  return getRolePath(userRole, 'vehicles');
};

/**
 * Generate invoices list path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} The invoices list path
 */
export const getInvoicesListPath = (userRole) => {
  return getRolePath(userRole, 'invoices');
};

/**
 * Generate maintenance history path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} The maintenance history path
 */
export const getMaintenanceHistoryPath = (userRole) => {
  return getRolePath(userRole, 'maintenance');
};