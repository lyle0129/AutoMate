import React, { useState, useCallback } from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Form wrapper component with validation and submission handling
 */
const Form = ({ 
  children,
  onSubmit,
  initialValues = {},
  validationRules = {},
  className = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  disabled = false
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return null;
  }, [validationRules, values]);

  // Handle field changes
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Handle field blur for validation
  const handleBlur = useCallback((name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return !hasErrors;
  }, [validationRules, validateField, values]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading || disabled) return;

    const isValid = validateAll();
    if (!isValid) return;

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Clone children and inject form props
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.props.name) {
      const fieldName = child.props.name;
      return React.cloneElement(child, {
        value: values[fieldName] || '',
        onChange: (e) => {
          const value = e.target ? e.target.value : e;
          handleChange(fieldName, value);
        },
        onBlur: (e) => {
          const value = e.target ? e.target.value : e;
          handleBlur(fieldName, value);
        },
        error: touched[fieldName] ? errors[fieldName] : null,
        disabled: disabled || loading
      });
    }
    return child;
  });

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {enhancedChildren}
      
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          type="submit"
          loading={loading}
          disabled={disabled}
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : submitText}
        </Button>
      </div>
    </form>
  );
};

// Form validation helpers
export const validators = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },

  number: (message = 'Must be a valid number') => (value) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  min: (min, message) => (value) => {
    if (value && Number(value) < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    if (value && Number(value) > max) {
      return message || `Must be no more than ${max}`;
    }
    return null;
  },

  match: (fieldName, message) => (value, allValues) => {
    if (value && value !== allValues[fieldName]) {
      return message || `Must match ${fieldName}`;
    }
    return null;
  }
};

export default Form;