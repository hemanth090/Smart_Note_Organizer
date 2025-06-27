/**
 * Smart Notes Organizer - Express Server
 * Main server file that sets up Express app with middleware, routes, and database connection
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const notesRoutes = require('./routes/notes');
const uploadRoutes = require('./routes/upload');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow all origins for production deployment
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Root route - Welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart Notes Organizer API Server',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
    documentation: {
      health: '/api/health',
      api_info: '/api',
      test_connection: '/api/test-connection'
    },
    frontend_url: process.env.CLIENT_URL || 'Frontend not configured',
    note: 'This is the backend API server. Visit the frontend URL for the user interface.'
  });
});

// API Routes
app.use('/api/notes', notesRoutes);
app.use('/api/upload', uploadRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Smart Notes Organizer API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'POST /api/notes/process',
      'POST /api/notes/ocr-only',
      'GET /api/notes/history',
      'GET /api/notes/test'
    ]
  });
});

// Test endpoint for frontend connectivity
app.get('/api/test-connection', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Frontend-Backend connection successful',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'No origin header',
    userAgent: req.get('User-Agent') || 'No user agent'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Notes Organizer API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum size limit'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file',
      message: 'Unexpected file field or too many files'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Memory optimization for Render
if (process.env.NODE_ENV === 'production') {
  // Enable garbage collection
  if (global.gc) {
    setInterval(() => {
      global.gc();
    }, 30000); // Run GC every 30 seconds
  }
  
  // Monitor memory usage
  setInterval(() => {
    const usage = process.memoryUsage();
    const rss = Math.round(usage.rss / 1024 / 1024);
    console.log(`📊 Memory usage: ${rss}MB RSS`);
    
    // Warning if memory usage is high
    if (rss > 400) {
      console.warn(`⚠️ High memory usage: ${rss}MB (limit: 512MB)`);
    }
  }, 60000); // Check every minute
}

// Start server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`🚀 Smart Notes Organizer server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  
  // Log initial memory usage
  const usage = process.memoryUsage();
  console.log(`📊 Initial memory: ${Math.round(usage.rss / 1024 / 1024)}MB RSS`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📊 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('📊 Process terminated');
  });
});

module.exports = app;
