import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

/**
 * Owner form component for creating and editing owners
 */
const OwnerForm = ({ 
  owner = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Populate form with owner data when editing
  useEffect(() => {
    if (owner) {
      setFormData({
        name: owner.name || '',
        contact: owner.contact || ''
      });
    }
  }, [owner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Owner name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Owner name must be at least 2 characters';
    }

    // Contact is optional, but if provided, should be valid
    if (formData.contact && formData.contact.trim().length > 0) {
      const contactRegex = /^[\d\s\-\+\(\)\.]+$/;
      if (!contactRegex.test(formData.contact.trim())) {
        errors.contact = 'Please enter a valid contact number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      contact: formData.contact.trim() || null
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Owner Name */}
        <div>
          <Input
            label="Owner Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            placeholder="Enter owner's full name"
            required
          />
        </div>

        {/* Contact Information */}
        <div>
          <Input
            label="Contact Number"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            error={formErrors.contact}
            placeholder="Enter phone number (optional)"
            type="tel"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Contact information is optional but recommended for communication
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {owner ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            owner ? 'Update Owner' : 'Create Owner'
          )}
        </Button>
      </div>
    </form>
  );
};

export default OwnerForm;