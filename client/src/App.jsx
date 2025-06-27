/**
 * Smart Notes Organizer - Main App Component
 * React application for uploading images and generating AI-enhanced study notes
 */

import React, { useState, useEffect } from 'react';
import { 
  FiSun, 
  FiMoon, 
  FiUpload, 
  FiFileText, 
  FiCopy, 
  FiCheck, 
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiEye,
  FiSettings,
  FiInfo
} from 'react-icons/fi';
import ImageUpload from './components/ImageUpload';
import NotesDisplay from './components/NotesDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import RecentNotes from './components/RecentNotes';

function App() {
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [noteStyle, setNoteStyle] = useState('comprehensive');
  const [selectedNote, setSelectedNote] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Test backend connectivity on app load
    const testConnection = async () => {
      try {
        console.log('Testing backend connection...');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/test-connection`);
        if (response.ok) {
          const data = await response.json();
          console.log('Backend connection successful:', data);
        } else {
          console.error('Backend connection failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Backend connection error:', error);
      }
    };

    testConnection();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle image upload and processing
  const handleImageUpload = async (file) => {
    const startTime = Date.now();
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Uploading image...');
    setOcrText('');
    setAiNotes('');
    setCopied(false);
    setConfidence(0);
    setProcessingTime(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (noteStyle !== 'comprehensive') {
        formData.append('noteStyle', noteStyle);
      }

      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Full URL:', `${import.meta.env.VITE_API_URL}/notes/process`);

      setProcessingStep('🔍 Extracting text with OCR...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/process`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      setProcessingStep('🤖 Generating AI-enhanced notes with Llama3...');
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        const endTime = Date.now();
        setUploadedImage(result.data.originalImage);
        setOcrText(result.data.ocr.text);
        setAiNotes(result.data.aiNotes);
        setConfidence(result.data.ocr.confidence || 0);
        setProcessingTime(Math.round((endTime - startTime) / 1000));
        setProcessingStep('✅ Complete!');
        
        // Trigger refresh of recent notes
        setRefreshTrigger(prev => prev + 1);
        
        // Auto-hide success message after 2 seconds
        setTimeout(() => setProcessingStep(''), 2000);
      } else {
        throw new Error(result.message || 'Processing failed');
      }

    } catch (err) {
      console.error('Processing error:', err);
      let errorMessage = err.message;
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Failed to connect to server. Please ensure the backend is running on http://localhost:5002';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy notes to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiNotes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download notes as text file
  const downloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([aiNotes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Reset application state
  const resetApp = () => {
    setUploadedImage(null);
    setOcrText('');
    setAiNotes('');
    setError(null);
    setCopied(false);
    setConfidence(0);
    setProcessingTime(0);
    setShowPreview(false);
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Handle note selection from recent notes
  const handleNoteSelect = async (note) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${note._id}`);
      if (response.ok) {
        const result = await response.json();
        const fullNote = result.data;
        
        setSelectedNote(fullNote);
        setOcrText(fullNote.ocrText);
        setAiNotes(fullNote.aiNotes);
        setConfidence(fullNote.ocrConfidence || 0);
        setUploadedImage({
          filename: fullNote.imageUrl.split('/').pop(),
          originalName: fullNote.originalFilename,
          size: fullNote.metadata?.fileSize || 0,
          url: fullNote.imageUrl
        });
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load selected note');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <FiZap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Notes Organizer
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <span>AI-powered with Llama3-70B</span>
                  {processingTime > 0 && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      {processingTime}s
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                aria-label="Settings"
              >
                <FiSettings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FiMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note Style:
                  </label>
                  <select
                    value={noteStyle}
                    onChange={(e) => setNoteStyle(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="comprehensive">Comprehensive</option>
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="summary">Summary Only</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiInfo className="h-4 w-4" />
                  <span>Choose how detailed you want your AI notes to be</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Upload and OCR */}
          <div className="xl:col-span-4 space-y-6">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                    <FiUpload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Upload Image
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Step 1
                </div>
              </div>
              <ImageUpload 
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
                onReset={resetApp}
              />
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-700 p-6 animate-fade-in">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                    <FiRefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Processing</h3>
                </div>
                <LoadingSpinner message={processingStep} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-700 p-6 animate-fade-in">
                <ErrorMessage message={error} onDismiss={() => setError(null)} />
              </div>
            )}

            {/* OCR Text Display */}
            {ocrText && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                      <FiEye className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Extracted Text (OCR)
                      </h3>
                      {confidence > 0 && (
                        <p className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                          {Math.round(confidence)}% confidence
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      Step 2
                    </div>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiEye className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto scrollbar-thin border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {ocrText}
                  </p>
                </div>
                {uploadedImage && showPreview && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <FiEye className="mr-2 h-4 w-4" />
                      Original Image:
                    </h4>
                    <img 
                      src={`http://localhost:5002${uploadedImage.url}`} 
                      alt="Uploaded" 
                      className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Middle Column - AI Notes */}
          <div className="xl:col-span-5 space-y-6">
            {aiNotes && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                      <FiZap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        AI-Enhanced Study Notes
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Generated by Llama3-70B
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      Step 3
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <NotesDisplay notes={aiNotes} />
                </div>
                
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-sm ${
                      copied 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-green-200 dark:shadow-green-800' 
                        : 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 shadow-blue-200 dark:shadow-blue-800'
                    }`}
                  >
                    {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy Notes'}</span>
                  </button>
                  
                  <button
                    onClick={downloadNotes}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 font-medium transition-all duration-200 hover:scale-105 shadow-sm shadow-purple-200 dark:shadow-purple-800"
                  >
                    <FiDownload className="h-4 w-4" />
                    <span className="text-sm">Download</span>
                  </button>
                  
                  <button
                    onClick={resetApp}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                    <span className="text-sm">New Upload</span>
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Message */}
            {!aiNotes && !isProcessing && !error && (
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700 p-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>
                
                <div className="relative text-center">
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-4 rounded-2xl w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <FiZap className="h-12 w-12 text-white animate-pulse-slow" />
                  </div>
                  
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Smart Notes Organizer
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                    Transform your images into comprehensive study notes with AI-powered OCR and Llama3-70B
                  </p>
                  
                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiUpload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Image</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">JPEG, PNG, GIF, WebP supported</p>
                    </div>
                    
                    <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiEye className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">OCR Extraction</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Advanced text recognition</p>
                    </div>
                    
                    <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600">
                      <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiZap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Llama3-70B</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 text-sm">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                      🚀 Fast Processing
                    </span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                      📱 Mobile Friendly
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                      🌙 Dark Mode
                    </span>
                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                      💾 Download Notes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recent Notes & Info */}
          <div className="xl:col-span-3 space-y-6">
            {/* Recent Notes */}
            <RecentNotes onNoteSelect={handleNoteSelect} refreshTrigger={refreshTrigger} />

            {/* Stats Card */}
            {(ocrText || aiNotes) && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg border border-indigo-200 dark:border-indigo-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg mr-3">
                    <FiInfo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                    Processing Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  {confidence > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">OCR Confidence:</span>
                      <span className={`text-sm font-bold ${getConfidenceColor(confidence)} px-2 py-1 rounded-full bg-white dark:bg-gray-700`}>
                        {Math.round(confidence)}%
                      </span>
                    </div>
                  )}
                  {processingTime > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {processingTime}s
                      </span>
                    </div>
                  )}
                  {ocrText && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Text Length:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {ocrText.length.toLocaleString()} chars
                      </span>
                    </div>
                  )}
                  {aiNotes && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes Length:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {aiNotes.length.toLocaleString()} chars
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Model:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900">
                      Llama3-70B
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            {!aiNotes && !isProcessing && !error && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg border border-amber-200 dark:border-amber-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg mr-3">
                    <FiInfo className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    Tips for Better Results
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Use high-resolution images for better OCR accuracy
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Ensure text is clearly visible and well-lit
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Try different note styles in settings
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="bg-orange-100 dark:bg-orange-900 p-1 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Supported formats: JPEG, PNG, GIF, WebP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
