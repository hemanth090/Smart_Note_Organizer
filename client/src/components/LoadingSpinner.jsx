/**
 * LoadingSpinner Component
 * Displays loading animation with optional message
 */

import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-4">
      {/* Spinner */}
      <div className="relative">
        <FiRefreshCw 
          className={`${sizeClasses[size]} text-primary-500 animate-spin`}
        />
      </div>
      
      {/* Message */}
      {message && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 text-center font-medium`}>
          {message}
        </p>
      )}
      
      {/* Progress dots animation */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
