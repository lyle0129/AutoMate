// Export all pages from this directory
// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';

// Dashboard Pages
export { AdminDashboard, MechanicDashboard, CustomerDashboard } from './dashboard';

// Admin Pages
export { UserManagement, ServiceManagement, VehicleList as AdminVehicleList, OwnerList, InvoiceGeneration as AdminInvoiceGeneration } from './admin';

// Mechanic Pages
export { MaintenanceLogging, InvoiceGeneration as MechanicInvoiceGeneration } from './mechanic';

// Customer Pages
export { VehicleList, VehicleDetail, MaintenanceHistory, InvoiceList, InvoiceDetail } from './customer';

// Error Pages
export { NotFound, Unauthorized } from './error';