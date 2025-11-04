/**
 * Date utility functions for handling various date formats
 */

/**
 * Parse a date that could be a timestamp, ISO string, or Date object
 * @param {string|number|Date} dateValue - The date value to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a string
  if (typeof dateValue === 'string') {
    // Try parsing as ISO string first
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try parsing as timestamp if it's a numeric string
    const timestamp = parseInt(dateValue, 10);
    if (!isNaN(timestamp)) {
      const timestampDate = new Date(timestamp);
      return isNaN(timestampDate.getTime()) ? null : timestampDate;
    }
  }
  
  return null;
};

/**
 * Format a date for display
 * @param {string|number|Date} dateValue - The date value to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string or 'Invalid Date'
 */
export const formatDate = (dateValue, options = {}) => {
  const date = parseDate(dateValue);
  if (!date) return 'Invalid Date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format a date for short display
 * @param {string|number|Date} dateValue - The date value to format
 * @returns {string} - Short formatted date string
 */
export const formatDateShort = (dateValue) => {
  return formatDate(dateValue, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate days between two dates
 * @param {string|number|Date} fromDate - Start date
 * @param {string|number|Date} toDate - End date (defaults to now)
 * @returns {number|null} - Number of days or null if invalid dates
 */
export const daysBetween = (fromDate, toDate = new Date()) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  
  if (!from || !to) return null;
  
  const diffTime = Math.abs(to - from);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is within a certain number of days from now
 * @param {string|number|Date} dateValue - The date to check
 * @param {number} days - Number of days
 * @returns {boolean} - True if within the specified days
 */
export const isWithinDays = (dateValue, days) => {
  const date = parseDate(dateValue);
  if (!date) return false;
  
  const now = new Date();
  const diffDays = daysBetween(date, now);
  return diffDays !== null && diffDays <= days;
};

/**
 * Get a date that is a certain number of days ago
 * @param {number} days - Number of days ago
 * @returns {Date} - Date object
 */
export const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};