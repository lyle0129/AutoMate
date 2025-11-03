import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const RegisterForm = ({ onSuccess, onSwitchToLogin, showRoleSelection = true }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // Default role
    owner_id: '', // Admin can set owner_id for customers
  });
  const [formErrors, setFormErrors] = useState({});

  // Role options
  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'mechanic', label: 'Mechanic' },
    { value: 'admin', label: 'Administrator' },
  ];

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
    } else if (formData.user_name.length < 3) {
      errors.user_name = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    // Owner ID validation for customers
    if (formData.role === 'customer' && formData.owner_id && isNaN(formData.owner_id)) {
      errors.owner_id = 'Owner ID must be a number';
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

    // Prepare data for submission
    const submitData = {
      user_name: formData.user_name.trim(),
      password: formData.password,
      role: formData.role,
    };

    // Add owner_id if provided and user is customer
    if (formData.role === 'customer' && formData.owner_id) {
      submitData.owner_id = parseInt(formData.owner_id);
    }

    const result = await register(submitData);
    
    if (result.success) {
      onSuccess && onSuccess(result.user);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New User
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Admin panel - Create a new user account
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
            placeholder="Choose a username"
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
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            error={formErrors.role}
            required
          />

          {formData.role === 'customer' && (
            <Input
              label="Owner ID (Optional)"
              name="owner_id"
              type="number"
              value={formData.owner_id}
              onChange={handleChange}
              error={formErrors.owner_id}
              placeholder="Enter owner ID to associate with an owner"
            />
          )}

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
            {isLoading ? 'Creating User...' : 'Create User'}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Return to{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Dashboard
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;