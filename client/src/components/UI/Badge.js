import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    secondary: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200',
    success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    error: 'bg-error-100 dark:bg-error-900 text-error-800 dark:text-error-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

