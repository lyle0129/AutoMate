import ProtectedRoute from './ProtectedRoute';

/**
 * Convenience components for specific role-based routes
 */

// Admin-only route
export const AdminRoute = ({ children, redirectTo }) => (
  <ProtectedRoute allowedRoles={['admin']} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

// Mechanic and Admin route
export const MechanicRoute = ({ children, redirectTo }) => (
  <ProtectedRoute allowedRoles={['admin', 'mechanic']} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

// Customer-only route
export const CustomerRoute = ({ children, redirectTo }) => (
  <ProtectedRoute allowedRoles={['customer']} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

// Any authenticated user route
export const AuthenticatedRoute = ({ children, redirectTo }) => (
  <ProtectedRoute allowedRoles={['admin', 'mechanic', 'customer']} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export default {
  AdminRoute,
  MechanicRoute,
  CustomerRoute,
  AuthenticatedRoute
};