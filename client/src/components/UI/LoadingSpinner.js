import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-t-primary-600',
    white: 'border-t-white',
    gray: 'border-t-gray-600'
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-200',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

