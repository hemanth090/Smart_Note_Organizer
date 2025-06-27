/**
 * Note Model
 * MongoDB schema for storing processed notes with OCR and AI data
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  // Original image information
  originalFilename: {
    type: String,
    required: true,
    trim: true
  },
  
  imagePath: {
    type: String,
    required: true
  },
  
  imageUrl: {
    type: String,
    required: true
  },
  
  // OCR extracted text
  ocrText: {
    type: String,
    required: true
  },
  
  ocrConfidence: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // AI generated notes
  aiNotes: {
    type: String,
    required: true
  },
  
  // Processing metadata
  metadata: {
    // File metadata
    fileSize: {
      type: Number,
      required: true
    },
    
    mimeType: {
      type: String,
      required: true
    },
    
    // OCR metadata
    ocrMetadata: {
      words: Number,
      lines: Number,
      paragraphs: Number,
      processingTime: Number
    },
    
    // AI metadata
    aiMetadata: {
      model: {
        type: String,
        default: 'gemini-pro'
      },
      inputLength: Number,
      outputLength: Number,
      finishReason: String,
      processingTime: Number
    },
    
    // Processing options
    processingOptions: {
      noteStyle: {
        type: String,
        default: 'comprehensive'
      },
      subject: String,
      includeKeyPoints: {
        type: Boolean,
        default: true
      },
      includeSummary: {
        type: Boolean,
        default: true
      },
      includeQuestions: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // User information (for future multi-user support)
  userId: {
    type: String,
    default: 'anonymous'
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  
  // Error information (if processing failed)
  error: {
    message: String,
    step: {
      type: String,
      enum: ['upload', 'ocr', 'ai', 'save']
    },
    timestamp: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
noteSchema.index({ createdAt: -1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ status: 1 });
noteSchema.index({ tags: 1 });

// Virtual for formatted creation date
noteSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for text preview
noteSchema.virtual('textPreview').get(function() {
  if (!this.ocrText) return '';
  return this.ocrText.length > 100 
    ? this.ocrText.substring(0, 100) + '...'
    : this.ocrText;
});

// Virtual for notes preview
noteSchema.virtual('notesPreview').get(function() {
  if (!this.aiNotes) return '';
  // Remove markdown formatting for preview
  const plainText = this.aiNotes.replace(/[#*`_~]/g, '');
  return plainText.length > 150 
    ? plainText.substring(0, 150) + '...'
    : plainText;
});

// Pre-save middleware to update the updatedAt field
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get recent notes
noteSchema.statics.getRecent = function(limit = 10, userId = 'anonymous') {
  return this.find({ userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('originalFilename textPreview notesPreview createdAt metadata.fileSize');
};

// Static method to get notes by tag
noteSchema.statics.getByTag = function(tag, userId = 'anonymous') {
  return this.find({ 
    userId, 
    status: 'completed',
    tags: { $in: [tag.toLowerCase()] }
  })
  .sort({ createdAt: -1 });
};

// Static method to search notes
noteSchema.statics.search = function(query, userId = 'anonymous') {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    userId,
    status: 'completed',
    $or: [
      { originalFilename: searchRegex },
      { ocrText: searchRegex },
      { aiNotes: searchRegex },
      { tags: { $in: [searchRegex] } }
    ]
  })
  .sort({ createdAt: -1 });
};

// Instance method to add tags
noteSchema.methods.addTags = function(newTags) {
  if (!Array.isArray(newTags)) {
    newTags = [newTags];
  }
  
  const cleanTags = newTags
    .map(tag => tag.toString().trim().toLowerCase())
    .filter(tag => tag.length > 0);
  
  this.tags = [...new Set([...this.tags, ...cleanTags])];
  return this.save();
};

// Instance method to remove tags
noteSchema.methods.removeTags = function(tagsToRemove) {
  if (!Array.isArray(tagsToRemove)) {
    tagsToRemove = [tagsToRemove];
  }
  
  const cleanTags = tagsToRemove.map(tag => tag.toString().trim().toLowerCase());
  this.tags = this.tags.filter(tag => !cleanTags.includes(tag));
  return this.save();
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
