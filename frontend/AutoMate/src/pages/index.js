// Export all pages from this directory
// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';

// Dashboard Pages
export { AdminDashboard, MechanicDashboard, CustomerDashboard } from './dashboard';

// Admin Pages
export { UserManagement, ServiceManagement, OwnerList, OwnerDetail, Reports, InvoiceGeneration as AdminInvoiceGeneration } from './admin';

// Mechanic Pages
export { MaintenanceLogging, InvoiceGeneration as MechanicInvoiceGeneration } from './mechanic';

// Customer Pages
export { VehicleList } from './customer';

// Shared Pages
export { AccountSettings, VehicleDetail, MaintenanceHistory, InvoiceList, InvoiceDetail, AdminVehicleList } from './shared';

// Error Pages
export { NotFound, Unauthorized } from './error';