import React from 'react';

/**
 * ComponentTemplate - A template for creating new components
 * @param {Object} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const ComponentTemplate = ({ children, className = '', ...props }) => {
  return (
    <div className={`component-template ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ComponentTemplate;