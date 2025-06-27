/**
 * Smart Notes Organizer - Express Server (No Database)
 * Test version without MongoDB to isolate connection issues
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Smart Notes Organizer API (No Database)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'GET /api/test-connection'
    ]
  });
});

// Test endpoint for frontend connectivity
app.get('/api/test-connection', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Frontend-Backend connection successful (No Database)',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'No origin header',
    userAgent: req.get('User-Agent') || 'No user agent'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Notes Organizer API is running (No Database)',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock recent notes endpoint
app.get('/api/notes/recent', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock recent notes (No Database)',
    data: [
      {
        _id: 'mock1',
        originalFilename: 'test-image-1.jpg',
        textPreview: 'This is a mock note for testing...',
        notesPreview: 'Mock AI-generated notes...',
        createdAt: new Date().toISOString(),
        ocrConfidence: 85,
        metadata: { fileSize: 1024 }
      },
      {
        _id: 'mock2',
        originalFilename: 'test-image-2.jpg',
        textPreview: 'Another mock note for testing...',
        notesPreview: 'More mock AI-generated notes...',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        ocrConfidence: 92,
        metadata: { fileSize: 2048 }
      }
    ]
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Start server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Smart Notes Organizer server (No DB) running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🧪 Test connection: http://localhost:${PORT}/api/test-connection`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📊 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('📊 Process terminated');
  });
});

module.exports = app;