import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for search and filtering functionality
 */
export const useSearch = (data = [], searchFields = [], options = {}) => {
  const {
    itemsPerPage = 10,
    caseSensitive = false,
    exactMatch = false
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      
      result = result.filter(item => {
        return searchFields.some(field => {
          const fieldValue = getNestedValue(item, field);
          if (fieldValue == null) return false;
          
          const stringValue = caseSensitive ? 
            String(fieldValue) : 
            String(fieldValue).toLowerCase();
          
          return exactMatch ? 
            stringValue === searchValue : 
            stringValue.includes(searchValue);
        });
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          
          // Handle special cases
          if (key === 'owner_id' && value === 'null') {
            return itemValue == null;
          }
          
          if (key === 'yearFrom') {
            return getNestedValue(item, 'year') >= value;
          }
          
          if (key === 'yearTo') {
            return getNestedValue(item, 'year') <= value;
          }
          
          if (key === 'contact_filter') {
            if (value === 'has_contact') {
              return getNestedValue(item, 'contact') != null && getNestedValue(item, 'contact') !== '';
            }
            if (value === 'no_contact') {
              return getNestedValue(item, 'contact') == null || getNestedValue(item, 'contact') === '';
            }
          }
          
          if (key === 'vehicle_count_filter') {
            // This would need to be handled externally since we need vehicle data
            return true; // Skip this filter in the hook, handle in component
          }
          
          if (key === 'paid_at_exists') {
            const paidAt = getNestedValue(item, 'paid_at');
            if (value === true) {
              return paidAt != null && paidAt !== '';
            }
            if (value === false) {
              return paidAt == null || paidAt === '';
            }
          }
          
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            return itemValue >= value.min && itemValue <= value.max;
          }
          
          // Convert to string for comparison if needed
          if (typeof value === 'string' && typeof itemValue === 'number') {
            return itemValue.toString() === value;
          }
          
          return itemValue === value;
        });
      }
    });

    return result;
  }, [data, searchTerm, searchFields, filters, caseSensitive, exactMatch]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [sortedData.length, currentPage, itemsPerPage]);

  // Update search term
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Update filters
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Remove filter
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Update sort configuration
  const updateSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Clear sort
  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  }, [paginationInfo.totalPages]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPreviousPage]);

  return {
    // Data
    data: paginatedData,
    filteredData,
    sortedData,
    
    // Search
    searchTerm,
    updateSearchTerm,
    
    // Filters
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    
    // Sorting
    sortConfig,
    updateSort,
    clearSort,
    
    // Pagination
    paginationInfo,
    changePage,
    nextPage,
    previousPage,
    
    // Utilities
    hasActiveFilters: Object.keys(filters).length > 0 || searchTerm !== '',
    isEmpty: paginatedData.length === 0,
    isFiltered: filteredData.length !== data.length
  };
};

export default useSearch;