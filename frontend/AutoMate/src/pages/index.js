// Export all pages from this directory
// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';

// Dashboard Pages
export { AdminDashboard, MechanicDashboard, CustomerDashboard } from './dashboard';

// Error Pages
export { NotFound, Unauthorized } from './error';