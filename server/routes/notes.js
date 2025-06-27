/**
 * Notes Routes
 * Handles the complete workflow from image upload to AI note generation
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import services
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const { uploadMiddleware } = require('../middleware/upload');

// Import models
const Note = require('../models/Note');

/**
 * POST /api/notes/process
 * Complete workflow: Upload image -> OCR -> AI note generation
 */
router.post('/process', uploadMiddleware, async (req, res) => {
  let tempFilePath = null;
  
  try {
    const file = req.file;
    tempFilePath = file.path;
    
    console.log(`🚀 Starting note processing for: ${file.originalname}`);
    
    // Step 1: Extract text using OCR
    console.log('📝 Step 1: Extracting text with OCR...');
    const ocrResult = await ocrService.processImageWithPreprocessing(tempFilePath);
    
    if (!ocrResult.text || ocrResult.text.trim().length === 0) {
      return res.status(400).json({
        error: 'No text found',
        message: 'Could not extract any readable text from the image. Please ensure the image contains clear, readable text.'
      });
    }

    // Step 2: Generate AI notes
    console.log('🤖 Step 2: Generating AI-enhanced notes...');
    const aiResult = await aiService.generateStudyNotes(ocrResult.text, {
      noteStyle: req.body.noteStyle || 'comprehensive',
      subject: req.body.subject || null
    });

    // Step 3: Save to database
    let savedNote = null;
    try {
      savedNote = await Note.create({
        originalFilename: file.originalname,
        imagePath: file.path,
        imageUrl: `/uploads/${file.filename}`,
        ocrText: ocrResult.text,
        aiNotes: aiResult.notes,
        ocrConfidence: ocrResult.confidence,
        metadata: {
          fileSize: file.size,
          mimeType: file.mimetype,
          ocrMetadata: {
            words: ocrResult.words,
            lines: ocrResult.lines,
            paragraphs: ocrResult.paragraphs
          },
          aiMetadata: aiResult.metadata,
          processingOptions: {
            noteStyle: req.body.noteStyle || 'comprehensive',
            subject: req.body.subject || null
          }
        }
      });
      console.log('💾 Note saved to database:', savedNote._id);
    } catch (dbError) {
      console.warn('⚠️  Database save failed:', dbError.message);
      // Continue without database save
    }

    // Return complete result
    const response = {
      success: true,
      message: 'Notes generated successfully',
      data: {
        originalImage: {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: `/uploads/${file.filename}`
        },
        ocr: {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          words: ocrResult.words,
          lines: ocrResult.lines
        },
        aiNotes: aiResult.notes,
        metadata: {
          processingTime: Date.now(),
          ocrMetadata: ocrResult.rawData,
          aiMetadata: aiResult.metadata,
          noteId: savedNote?._id || null
        }
      }
    };

    console.log('✅ Note processing completed successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Note processing failed:', error);
    
    // Clean up temporary file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('❌ Failed to clean up temporary file:', cleanupError);
      }
    }

    // Return appropriate error response
    if (error.message.includes('OCR')) {
      return res.status(400).json({
        error: 'OCR processing failed',
        message: 'Could not extract text from the image. Please ensure the image is clear and contains readable text.'
      });
    }
    
    if (error.message.includes('Gemini') || error.message.includes('AI') || error.message.includes('Groq')) {
      return res.status(500).json({
        error: 'AI processing failed',
        message: 'Could not generate notes. Please check your API configuration and try again.'
      });
    }

    res.status(500).json({
      error: 'Processing failed',
      message: 'An unexpected error occurred while processing your image.'
    });
  }
});

/**
 * POST /api/notes/ocr-only
 * Extract text from image using OCR only (no AI processing)
 */
router.post('/ocr-only', uploadMiddleware, async (req, res) => {
  let tempFilePath = null;
  
  try {
    const file = req.file;
    tempFilePath = file.path;
    
    console.log(`🔍 Starting OCR-only processing for: ${file.originalname}`);
    
    const ocrResult = await ocrService.processImageWithPreprocessing(tempFilePath);
    
    if (!ocrResult.text || ocrResult.text.trim().length === 0) {
      return res.status(400).json({
        error: 'No text found',
        message: 'Could not extract any readable text from the image.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Text extracted successfully',
      data: {
        originalImage: {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: `/uploads/${file.filename}`
        },
        ocr: ocrResult
      }
    });

  } catch (error) {
    console.error('❌ OCR processing failed:', error);
    
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('❌ Failed to clean up temporary file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'OCR processing failed',
      message: 'Could not extract text from the image.'
    });
  }
});

/**
 * GET /api/notes/history
 * Get processing history with pagination
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 20, page = 1, userId = 'anonymous' } = req.query;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('originalFilename textPreview notesPreview createdAt metadata.fileSize tags ocrConfidence');

    const total = await Note.countDocuments({ userId, status: 'completed' });

    res.status(200).json({
      success: true,
      message: 'History retrieved successfully',
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'Could not retrieve processing history.'
    });
  }
});

/**
 * GET /api/notes/recent
 * Get recent notes for dashboard
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5, userId = 'anonymous' } = req.query;

    console.log('📋 Fetching recent notes...');
    
    const recentNotes = await Note.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('originalFilename textPreview notesPreview createdAt ocrConfidence metadata.fileSize')
      .lean();

    console.log(`📋 Found ${recentNotes.length} recent notes`);

    res.status(200).json({
      success: true,
      message: 'Recent notes retrieved successfully',
      data: recentNotes
    });
  } catch (error) {
    console.error('❌ Failed to fetch recent notes:', error);
    res.status(500).json({
      error: 'Failed to fetch recent notes',
      message: 'Could not retrieve recent notes.'
    });
  }
});

/**
 * GET /api/notes/:id
 * Get a specific note by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'The requested note does not exist.'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('❌ Failed to fetch note:', error);
    res.status(500).json({
      error: 'Failed to fetch note',
      message: 'Could not retrieve the requested note.'
    });
  }
});

/**
 * DELETE /api/notes/:id
 * Delete a specific note by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'The requested note does not exist.'
      });
    }

    // Clean up image file
    if (note.imagePath && fs.existsSync(note.imagePath)) {
      try {
        fs.unlinkSync(note.imagePath);
      } catch (cleanupError) {
        console.warn('⚠️  Failed to delete image file:', cleanupError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete note:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      message: 'Could not delete the requested note.'
    });
  }
});

/**
 * POST /api/notes/test-note
 * Create a test note for debugging
 */
router.post('/test-note', async (req, res) => {
  try {
    const testNote = await Note.create({
      originalFilename: 'test-image.jpg',
      imagePath: '/test/path',
      imageUrl: '/uploads/test-image.jpg',
      ocrText: 'This is a test OCR text for debugging purposes.',
      aiNotes: '# Test Notes\n\nThis is a test note created for debugging the recent notes functionality.\n\n## Key Points\n- Test functionality\n- Debug recent notes\n- Verify database connection',
      ocrConfidence: 85,
      metadata: {
        fileSize: 1024,
        mimeType: 'image/jpeg',
        ocrMetadata: {
          words: 10,
          lines: 2,
          paragraphs: 1
        },
        aiMetadata: {
          model: 'llama3-70b-8192',
          inputLength: 50,
          outputLength: 200
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test note created successfully',
      data: testNote
    });
  } catch (error) {
    console.error('❌ Failed to create test note:', error);
    res.status(500).json({
      error: 'Failed to create test note',
      message: error.message
    });
  }
});

/**
 * GET /api/notes/test
 * Test endpoint to verify services
 */
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    let dbStatus = 'Connected';
    let dbDetails = {};
    try {
      const mongoose = require('mongoose');
      dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
      dbDetails = {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } catch (dbError) {
      dbStatus = 'Error: ' + dbError.message;
    }

    const status = {
      ocrService: 'Available',
      aiService: aiService.isConfigured() ? 'Configured (Groq/Llama3-70B)' : 'Not configured (missing API key)',
      database: dbStatus,
      databaseDetails: dbDetails
    };

    res.status(200).json({
      message: 'Notes service status',
      services: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service check failed',
      message: error.message
    });
  }
});

module.exports = router;
