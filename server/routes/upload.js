/**
 * Upload Routes
 * Handles image upload endpoints
 */

const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../middleware/upload');

/**
 * POST /api/upload/image
 * Upload a single image file
 */
router.post('/image', uploadMiddleware, async (req, res) => {
  try {
    const file = req.file;
    
    // Return file information
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      file: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the image'
    });
  }
});

/**
 * GET /api/upload/test
 * Test endpoint to verify upload functionality
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Upload service is running',
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
    allowedTypes: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp'
  });
});

module.exports = router;
