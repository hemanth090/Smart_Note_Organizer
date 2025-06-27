/**
 * ImageUpload Component
 * Handles drag-and-drop image upload with preview and validation
 */

import React, { useState, useRef } from 'react';
import { FiUpload, FiImage, FiX, FiRefreshCw } from 'react-icons/fi';

const ImageUpload = ({ onImageUpload, isProcessing, onReset }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!supportedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle upload button click
  const handleUpload = () => {
    if (selectedFile && onImageUpload) {
      onImageUpload(selectedFile);
    }
  };

  // Reset component
  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Drop Zone */}
      {!selectedFile && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!isProcessing ? openFileDialog : undefined}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FiUpload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {dragActive ? 'Drop your image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag and drop or click to select
              </p>
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500">
              <p>Supported: JPEG, PNG, GIF, WebP</p>
              <p>Max size: 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {selectedFile && previewUrl && (
        <div className="space-y-4">
          <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-start space-x-4">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center mt-2">
                      <FiImage className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedFile.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  {!isProcessing && (
                    <button
                      onClick={handleReset}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      aria-label="Remove image"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className={`flex-1 btn-primary flex items-center justify-center space-x-2 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiUpload className="h-4 w-4" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
            
            {!isProcessing && (
              <button
                onClick={openFileDialog}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiImage className="h-4 w-4" />
                <span>Change</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
