/**
 * ErrorMessage Component
 * Displays error messages with dismiss functionality
 */

import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ErrorMessage = ({ message, onDismiss, type = 'error' }) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      text: 'text-red-700 dark:text-red-300',
      button: 'text-red-400 hover:text-red-600 dark:hover:text-red-200'
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-300',
      button: 'text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200'
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
      button: 'text-blue-400 hover:text-blue-600 dark:hover:text-blue-200'
    }
  };

  const styles = typeStyles[type] || typeStyles.error;

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0">
          <FiAlertCircle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        
        {/* Message */}
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>
        </div>
        
        {/* Dismiss Button */}
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 transition-colors duration-200 ${styles.button}`}
              aria-label="Dismiss"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
