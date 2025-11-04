import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';

/**
 * Reusable form field component that handles different input types
 */
const FormField = ({ 
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  options = [], // For select fields
  className = '',
  ...props
}) => {
  const fieldId = `field-${name}`;

  // Handle change events
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(name, newValue);
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(name, e.target.value);
    }
  };

  // Render different input types
  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      disabled,
      placeholder,
      required,
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <Select
            {...commonProps}
            options={options}
            error={error}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              dark:placeholder-gray-500
              ${error 
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-red-100' 
                : 'border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              }
            `}
          />
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            error={error}
          />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;