import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

/**
 * SearchableSelect - A dropdown with search functionality for better UX with large datasets
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  displayKey = 'label',
  valueKey = 'value',
  disabled = false,
  error = false,
  renderOption = null,
  renderSelected = null,
  emptyMessage = 'No options found'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const displayValue = typeof option === 'object' ? option[displayKey] : option;
    return displayValue?.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get selected option
  const selectedOption = options.find(option => {
    const optionValue = typeof option === 'object' ? option[valueKey] : option;
    return optionValue === value;
  });

  const handleSelect = (option) => {
    const optionValue = typeof option === 'object' ? option[valueKey] : option;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? '' : 'text-gray-500 dark:text-gray-400'}>
            {selectedOption
              ? renderSelected
                ? renderSelected(selectedOption)
                : typeof selectedOption === 'object'
                ? selectedOption[displayKey]
                : selectedOption
              : placeholder}
          </span>
          <div className="flex items-center space-x-2">
            {selectedOption && !disabled && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'object' ? option[valueKey] : option;
                const isSelected = optionValue === value;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {renderOption
                      ? renderOption(option)
                      : typeof option === 'object'
                      ? option[displayKey]
                      : option}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
