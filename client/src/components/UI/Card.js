import React from 'react';
import { clsx } from 'clsx';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('bg-gray-50 rounded-lg shadow-soft border border-gray-300', className)} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-300', className)}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-800', className)}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={clsx('text-sm text-gray-600 mt-1', className)}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-300 bg-gray-100', className)}>
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};

