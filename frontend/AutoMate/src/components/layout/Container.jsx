
/**
 * Container component for consistent page layout and spacing
 */
const Container = ({
  children,
  size = 'default',
  className = '',
  padding = true
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
    full: 'w-full'
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`mx-auto ${sizeClasses[size]} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card container for content sections
 */
export const Card = ({
  children,
  className = '',
  padding = true,
  shadow = true
}) => {
  const paddingClasses = padding ? 'p-4 sm:p-6' : '';
  const shadowClasses = shadow ? 'shadow-sm' : '';

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
      ${shadowClasses} ${paddingClasses} ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * Grid container for responsive layouts
 */
export const Grid = ({
  children,
  cols = 1,
  gap = 6,
  className = ''
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = `gap-${gap}`;

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Container;