/**
 * RecentNotes Component
 * Displays a list of recently processed notes
 */

import React, { useState, useEffect } from 'react';
import { FiClock, FiFileText, FiEye, FiTrash2 } from 'react-icons/fi';

const RecentNotes = ({ onNoteSelect, refreshTrigger }) => {
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentNotes();
  }, [refreshTrigger]);

  const fetchRecentNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recent notes from:', `${import.meta.env.VITE_API_URL}/notes/recent?limit=5`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/recent?limit=5`);
      
      console.log('Recent notes response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Recent notes result:', result);
        setRecentNotes(result.data || []);
      } else {
        const errorText = await response.text();
        console.error('Recent notes error response:', errorText);
        throw new Error(`Failed to fetch recent notes: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching recent notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg mr-3">
            <FiClock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Recent Notes
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-700 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg mr-3">
            <FiClock className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
            Recent Notes
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
            Unable to load recent notes
          </p>
          <p className="text-red-500 dark:text-red-500 text-xs">
            {error}
          </p>
          <button
            onClick={fetchRecentNotes}
            className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg mr-3">
            <FiClock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Recent Notes
          </h3>
        </div>
        <button
          onClick={fetchRecentNotes}
          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {recentNotes.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FiFileText className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No recent notes found</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Upload an image to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <div
              key={note._id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer group"
              onClick={() => onNoteSelect && onNoteSelect(note)}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {note.originalFilename}
                </h4>
                <div className="flex items-center space-x-2 ml-2">
                  {note.ocrConfidence && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColor(note.ocrConfidence)} bg-white dark:bg-gray-700`}>
                      {Math.round(note.ocrConfidence)}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteSelect && onNoteSelect(note);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiEye className="h-4 w-4 text-gray-500 group-hover:text-blue-500" />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                {note.textPreview || 'No preview available'}
              </p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {formatDate(note.createdAt)}
                </span>
                <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  {formatFileSize(note.metadata?.fileSize || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentNotes;