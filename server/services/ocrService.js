/**
 * OCR Service using Tesseract.js
 * Extracts text from uploaded images
 */

const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Tesseract worker
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔍 Initializing OCR service...');
      this.worker = await Tesseract.createWorker('eng');
      this.isInitialized = true;
      console.log('✅ OCR service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OCR service:', error);
      throw new Error('OCR service initialization failed');
    }
  }

  /**
   * Extract text from image file
   * @param {string} imagePath - Path to the image file
   * @param {Object} options - OCR options
   * @returns {Promise<Object>} - OCR result with text and confidence
   */
  async extractText(imagePath, options = {}) {
    try {
      // Ensure worker is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file not found');
      }

      console.log(`🔍 Starting OCR processing for: ${path.basename(imagePath)}`);
      
      // Perform OCR with timeout (removed logger to fix worker thread issue)
      const ocrPromise = this.worker.recognize(imagePath, options);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR processing timeout')), 60000); // 60 second timeout
      });
      
      const { data } = await Promise.race([ocrPromise, timeoutPromise]);
      
      // Clean up extracted text
      const cleanedText = this.cleanText(data.text);
      
      console.log(`✅ OCR completed. Confidence: ${Math.round(data.confidence)}%`);
      console.log(`📄 Extracted text length: ${cleanedText.length} characters`);

      return {
        text: cleanedText,
        confidence: data.confidence,
        words: data.words?.length || 0,
        lines: data.lines?.length || 0,
        paragraphs: data.paragraphs?.length || 0,
        rawData: {
          text: data.text,
          confidence: data.confidence,
          words: data.words,
          lines: data.lines,
          paragraphs: data.paragraphs
        }
      };

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Clean and format extracted text
   * @param {string} text - Raw OCR text
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Fix common OCR errors
      .replace(/\|/g, 'I') // Common OCR mistake
      .replace(/0/g, 'O') // In some contexts
      // Ensure proper sentence spacing
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Remove isolated single characters that are likely OCR errors
      .replace(/\b[a-z]\b/g, '')
      // Clean up multiple spaces again
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Process image with preprocessing for better OCR results
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} - OCR result
   */
  async processImageWithPreprocessing(imagePath) {
    try {
      // Basic OCR first
      const result = await this.extractText(imagePath);
      
      // If confidence is low, try with different PSM modes
      if (result.confidence < 70) {
        console.log('🔄 Low confidence detected, trying alternative OCR settings...');
        
        const alternativeResult = await this.extractText(imagePath, {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
        });
        
        // Return the result with higher confidence
        if (alternativeResult.confidence > result.confidence) {
          console.log('✅ Alternative OCR settings improved results');
          return alternativeResult;
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      throw error;
    }
  }

  /**
   * Terminate the OCR worker
   */
  async terminate() {
    if (this.worker && this.isInitialized) {
      try {
        await this.worker.terminate();
        this.isInitialized = false;
        console.log('🔍 OCR service terminated');
      } catch (error) {
        console.error('❌ Error terminating OCR service:', error);
      }
    }
  }
}

// Create singleton instance
const ocrService = new OCRService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔍 Terminating OCR service...');
  await ocrService.terminate();
});

process.on('SIGTERM', async () => {
  console.log('🔍 Terminating OCR service...');
  await ocrService.terminate();
});

// Handle unhandled rejections in OCR service
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('tesseract')) {
    console.error('❌ OCR Service unhandled rejection:', reason);
  }
});

module.exports = ocrService;
