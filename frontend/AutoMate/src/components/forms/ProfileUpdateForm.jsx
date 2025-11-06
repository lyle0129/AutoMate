import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * Profile Update Form component for changing username and password
 */
const ProfileUpdateForm = ({ user, onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    user_name: user?.user_name || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.user_name.trim()) {
      errors.user_name = 'Username is required';
    } else if (formData.user_name.length < 3) {
      errors.user_name = 'Username must be at least 3 characters';
    }
    
    // Password validation (only if changing password)
    if (formData.new_password || formData.current_password) {
      if (!formData.current_password) {
        errors.current_password = 'Current password is required to change password';
      }
      
      if (!formData.new_password) {
        errors.new_password = 'New password is required';
      } else if (formData.new_password.length < 6) {
        errors.new_password = 'New password must be at least 6 characters';
      }
      
      if (formData.new_password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission
    const updateData = {
      user_name: formData.user_name
    };
    
    // Only include password fields if user is changing password
    if (formData.new_password) {
      updateData.current_password = formData.current_password;
      updateData.new_password = formData.new_password;
    }
    
    onSubmit(updateData);
  };

  const hasChanges = () => {
    return formData.user_name !== user?.user_name || formData.new_password;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}
      
      {/* Username Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Account Information
        </h3>
        
        <div>
          <Input
            label="Username"
            name="user_name"
            type="text"
            value={formData.user_name}
            onChange={handleInputChange}
            error={validationErrors.user_name}
            icon={User}
            placeholder="Enter your username"
            required
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Change Password
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Leave password fields empty if you don't want to change your password.
        </p>
        
        <div>
          <div className="relative">
            <Input
              label="Current Password"
              name="current_password"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.current_password}
              onChange={handleInputChange}
              error={validationErrors.current_password}
              icon={Lock}
              placeholder="Enter your current password"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              label="New Password"
              name="new_password"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.new_password}
              onChange={handleInputChange}
              error={validationErrors.new_password}
              icon={Lock}
              placeholder="Enter your new password"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              label="Confirm New Password"
              name="confirm_password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleInputChange}
              error={validationErrors.confirm_password}
              icon={Lock}
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!hasChanges() || loading}
        >
          Update Profile
        </Button>
      </div>
    </form>
  );
};

export default ProfileUpdateForm;