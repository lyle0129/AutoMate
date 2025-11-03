import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  required = false,
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the actual input type
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Show password toggle for password fields
  const shouldShowToggle = type === 'password' || showPasswordToggle;
  
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    dark:placeholder-gray-500
    ${shouldShowToggle ? 'pr-10' : ''}
    ${error 
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-red-100' 
      : 'border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
    }
    ${className}
  `;

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          {...props}
        />
        {shouldShowToggle && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;