/**
 * Minimal test server to verify basic connectivity
 */

const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple test routes
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is running!' });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-connection', (req, res) => {
  res.json({
    success: true,
    message: 'Connection test successful',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on http://localhost:${PORT}`);
  console.log(`🌐 Test URLs:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/api`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/test-connection`);
});