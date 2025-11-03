import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Don't automatically clear global error - let user dismiss it manually
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.user_name.trim()) {
      errors.user_name = 'Username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      onSuccess && onSuccess(result.user);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign In
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Welcome back to AutoMate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="user_name"
            type="text"
            value={formData.user_name}
            onChange={handleChange}
            error={formErrors.user_name}
            required
            placeholder="Enter your username"
            autoComplete="username"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex justify-between items-start">
                <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 focus:outline-none"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>


      </div>
    </div>
  );
};

export default LoginForm;