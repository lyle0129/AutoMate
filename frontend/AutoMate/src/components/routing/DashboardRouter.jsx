import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * DashboardRouter component that redirects users to their role-appropriate dashboard
 */
const DashboardRouter = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const roleDashboards = {
    admin: '/admin/dashboard',
    mechanic: '/mechanic/dashboard',
    customer: '/customer/dashboard'
  };

  const dashboardPath = roleDashboards[user.role];
  
  if (!dashboardPath) {
    // Unknown role - redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={dashboardPath} replace />;
};

export default DashboardRouter;