import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {string[]} props.allowedRoles - Array of roles that can access this route
 * @param {string} props.redirectTo - Path to redirect to if access is denied (default: '/login')
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  requireAuth = true 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    // Redirect to unauthorized page or appropriate dashboard based on user role
    if (!user) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Redirect to appropriate dashboard based on user role
    const roleDashboards = {
      admin: '/admin/dashboard',
      mechanic: '/mechanic/dashboard',
      customer: '/customer/dashboard'
    };
    
    const userDashboard = roleDashboards[user.role] || '/unauthorized';
    return <Navigate to={userDashboard} replace />;
  }

  // Access granted - render children
  return children;
};

export default ProtectedRoute;