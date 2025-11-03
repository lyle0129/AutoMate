import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ 
  size = 'md', 
  showLabel = false, 
  variant = 'button',
  className = '' 
}) => {
  const { theme, toggleTheme, isDark, isSystemTheme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'p-1.5',
      icon: 16,
      text: 'text-xs'
    },
    md: {
      button: 'p-2',
      icon: 20,
      text: 'text-sm'
    },
    lg: {
      button: 'p-3',
      icon: 24,
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  // Get current icon based on theme
  const getCurrentIcon = () => {
    if (isSystemTheme) {
      return <Monitor size={config.icon} />;
    }
    return isDark ? <Moon size={config.icon} /> : <Sun size={config.icon} />;
  };

  // Get accessible label
  const getAriaLabel = () => {
    if (isSystemTheme) {
      return 'Switch to light theme (currently following system)';
    }
    return isDark ? 'Switch to light theme' : 'Switch to dark theme';
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (isSystemTheme) {
      return 'Following system theme';
    }
    return isDark ? 'Dark mode' : 'Light mode';
  };

  if (variant === 'dropdown') {
    // Dropdown variant for use in menus
    return (
      <button
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center w-full px-3 py-2 text-left
          hover:bg-gray-100 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200
          ${config.text}
          ${className}
        `}
        aria-label={getAriaLabel()}
        role="menuitem"
      >
        <span className="mr-3 flex-shrink-0">
          {getCurrentIcon()}
        </span>
        <span className="flex-1">
          {isSystemTheme ? 'System Theme' : isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  // Default button variant
  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        className={`
          ${config.button}
          rounded-lg
          bg-gray-100 hover:bg-gray-200 
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          border border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95
          ${className}
        `}
        aria-label={getAriaLabel()}
        title={getTooltipText()}
      >
        <span className="flex items-center justify-center">
          {getCurrentIcon()}
        </span>
      </button>
      
      {showLabel && (
        <span className={`
          ml-2 ${config.text}
          text-gray-700 dark:text-gray-300
          select-none
        `}>
          {isSystemTheme ? 'Auto' : isDark ? 'Dark' : 'Light'}
        </span>
      )}
      
      {/* Tooltip for better UX */}
      <div className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700
        rounded shadow-lg opacity-0 group-hover:opacity-100
        transition-opacity duration-200 pointer-events-none
        whitespace-nowrap z-50
      `}>
        {getTooltipText()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
};

export default ThemeToggle;