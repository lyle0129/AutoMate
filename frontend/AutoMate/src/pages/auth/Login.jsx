import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/forms/LoginForm';
import { ThemeToggle } from '../../components/layout';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSuccess = (user) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="md" />
      </div>
      
      <LoginForm 
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Login;