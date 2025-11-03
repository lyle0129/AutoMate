import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth, useIsAdmin } from '../../hooks/useAuth';
import RegisterForm from '../../components/forms/RegisterForm';
import { ThemeToggle } from '../../components/layout';

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Registration is admin-only - redirect non-admin users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleRegisterSuccess = (user) => {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'mechanic':
        navigate('/mechanic/dashboard');
        break;
      case 'customer':
        navigate('/customer/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="md" />
      </div>
      
      <RegisterForm 
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={handleReturnToDashboard}
      />
    </div>
  );
};

export default Register;