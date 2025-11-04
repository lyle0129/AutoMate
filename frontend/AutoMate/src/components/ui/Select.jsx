import React, { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Select an option',
  className = '', 
  required = false,
  ...props 
}, ref) => {
  const selectClasses = `
    block w-full px-4 py-3 border rounded-lg shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
    hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
    cursor-pointer
    ${error 
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600 dark:text-red-100' 
      : 'border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800'
    }
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;