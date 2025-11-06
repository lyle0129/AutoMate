import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/forms/LoginForm';
import { ThemeToggle } from '../../components/layout';
import car from "../../assets/car.jpg" ;

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSuccess = (user) => {
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
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Theme toggle (fixed and visible on all devices) */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle size="md" />
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left side – Slanted image (desktop) / Rectangular image (mobile) */}
        <div className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-auto overflow-hidden">
          {/* Mobile: rectangular image */}
          <img
            src={car}
            alt="Shop placeholder"
            className="absolute inset-0 w-full h-full object-cover block lg:hidden"
          />

          {/* Desktop: slanted image */}
          <img
            src={car}
            alt="Shop placeholder"
            className="hidden lg:block absolute inset-0 w-full h-full object-cover"
            style={{
              clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
            }}
          />

          {/* Slanted overlay for desktop only */}
          <div
            className="hidden lg:block absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-700/80 dark:from-blue-800/80 dark:to-indigo-900/80"
            style={{
              clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
            }}
          ></div>

          {/* Rectangular overlay for mobile */}
          <div className="block lg:hidden absolute inset-0 bg-gradient-to-br from-blue-600/70 to-indigo-700/70 dark:from-blue-800/70 dark:to-indigo-900/70"></div>

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
              AutoMate Garage
            </h1>
            <p className="text-base sm:text-lg text-white/90 mt-2 drop-shadow-md">
              Your trusted car service partner
            </p>
          </div>
        </div>

        {/* Right side – Login form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 sm:p-12">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              Welcome Back
            </h2>
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">AutoMate</span> by Lyle
      </footer>
    </div>
  );
};

export default Login;
