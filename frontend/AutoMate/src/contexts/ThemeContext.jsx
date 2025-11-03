import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme state with system preference detection
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  });

  // Apply theme to document root
  const applyTheme = useCallback((newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.warn('Invalid theme value. Must be "light" or "dark"');
      return;
    }
    
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only update if no theme is saved in localStorage
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    };

    // Add listener for system theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Apply initial theme
    applyTheme(theme);

    // Cleanup listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme, applyTheme]);

  // Get system theme preference
  const getSystemTheme = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Reset to system theme
  const resetToSystemTheme = useCallback(() => {
    localStorage.removeItem('theme');
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  }, [getSystemTheme, applyTheme]);

  // Check if current theme matches system preference
  const isSystemTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('theme');
    return !savedTheme;
  }, []);

  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
    resetToSystemTheme,
    getSystemTheme,
    isSystemTheme: isSystemTheme(),
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;