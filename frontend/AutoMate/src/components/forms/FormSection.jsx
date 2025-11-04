import React from 'react';

/**
 * Form section component for organizing form fields into logical groups
 */
const FormSection = ({ 
  title, 
  description, 
  children, 
  className = '',
  collapsible = false,
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div 
          className={`border-b border-gray-200 dark:border-gray-700 pb-4 ${
            collapsible ? 'cursor-pointer' : ''
          }`}
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {collapsible && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              >
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Form group component for organizing related fields
 */
export const FormGroup = ({ 
  children, 
  columns = 1, 
  className = '' 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Form actions component for submit/cancel buttons
 */
export const FormActions = ({ 
  children, 
  align = 'right', 
  className = '' 
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`
      flex flex-col sm:flex-row ${alignClasses[align]} 
      space-y-3 sm:space-y-0 sm:space-x-3 
      pt-6 border-t border-gray-200 dark:border-gray-700 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default FormSection;