// Models/Snippet.js (or EnhancedSnippet.js)
const mongoose = require('mongoose');

// Sub-schemas for better organization
const aiMetadataSchema = new mongoose.Schema({
  description: { type: String, maxlength: 500 },
  summary: { type: String, maxlength: 280 },
  explanation: { type: String, maxlength: 2000 },
  generatedAt: { type: Date, default: Date.now },
  confidence: { type: Number, min: 0, max: 1, default: 0.8 }
}, { _id: false });

const codeAnalysisSchema = new mongoose.Schema({
  functions: [{ type: String, trim: true }],
  classes: [{ type: String, trim: true }],
  imports: [{ type: String, trim: true }],
  dependencies: [{ type: String, trim: true }],
  variables: [{ type: String, trim: true }],
  comments: [{ type: String, trim: true }],
  lineCount: { type: Number, min: 0, default: 0 },
  characterCount: { type: Number, min: 0, default: 0 }
}, { _id: false });

const qualityMetricsSchema = new mongoose.Schema({
  overall: { type: Number, min: 0, max: 10, default: 5 },
  readability: { type: Number, min: 0, max: 10, default: 5 },
  security: { type: Number, min: 0, max: 10, default: 5 },
  performance: { type: Number, min: 0, max: 10, default: 5 },
  maintainability: { type: Number, min: 0, max: 10, default: 5 },
  lastAnalyzed: { type: Date, default: Date.now }
}, { _id: false });

const engagementSchema = new mongoose.Schema({
  views: { type: Number, default: 0, min: 0 },
  copies: { type: Number, default: 0, min: 0 },
  favorites: { type: Number, default: 0, min: 0 },
  shares: { type: Number, default: 0, min: 0 },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, min: 0, max: 5, default: 0 }
}, { _id: false });

// Main Enhanced Snippet Schema
const enhancedSnippetSchema = new mongoose.Schema({
  // Core ownership



  isE2EE: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  
  encryptedContent: {
    type: String, // Base64 encoded encrypted content
    select: false // Don't return by default
  },
  
  encryptionMetadata: {
    algorithm: { 
      type: String, 
      default: 'AES-256-GCM' 
    },
    iv: { 
      type: String // Initialization vector for decryption
    },
    salt: { 
      type: String // For key derivation
    },
    authTag: { 
      type: String // Authentication tag for GCM mode
    },
    keyDerivation: {
      type: String,
      enum: ['PBKDF2', 'scrypt', 'argon2'],
      default: 'PBKDF2'
    }
  },

  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },

  // Basic content (required)
  title: { 
    type: String, 
    required: [true, "Title is required"],
    trim: true, 
    maxlength: [200, "Title cannot exceed 200 characters"],
    minlength: [3, "Title must be at least 3 characters"]
  },
  
  code: { 
    type: String, 
    required: [true, "Code content is required"],
    minlength: [1, "Content cannot be empty"]
  },
  
  // Auto-detected language with confidence
  language: { 
    type: String, 
    required: [true, "Programming language is required"],
    trim: true,
    lowercase: true,
    index: true
  },
  
  languageConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.9
  },

  // AI-generated content
  aiMetadata: {
    type: aiMetadataSchema,
    default: () => ({})
  },

  // Code analysis results
  codeAnalysis: {
    type: codeAnalysisSchema,
    default: () => ({})
  },

  // Quality metrics
  qualityMetrics: {
    type: qualityMetricsSchema,
    default: () => ({})
  },

  // Classification and categorization
  category: {
    type: String,
    enum: ["web-development", "mobile-development", "data-science", "algorithms", 
           "devops", "api", "database", "testing", "ui-components", "utilities", "other"],
    default: "other",
    index: true
  },

  domain: {
    type: String,
    enum: ["frontend", "backend", "fullstack", "mobile", "desktop", "embedded", 
           "data", "ml-ai", "devops", "testing", "other"],
    default: "other",
    index: true
  },

  intent: {
    type: String,
    enum: ["crud", "authentication", "data-processing", "ui-component", 
           "utility", "algorithm", "configuration", "template", "tutorial", "other"],
    default: "other"
  },

  complexity: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "beginner",
    index: true
  },

  useCase: {
    type: String,
    enum: ["production", "tutorial", "boilerplate", "prototype", "example", "utility"],
    default: "example"
  },

  // Enhanced taxonomy (searchable arrays)
  tags: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) { return arr.length <= 30; },
      message: "Cannot have more than 30 tags"
    },
    index: true
  },
  
  frameworks: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) { return arr.length <= 20; },
      message: "Cannot have more than 20 frameworks"
    },
    index: true
  },
  
  libraries: {
    type: [{ type: String, lowercase: true, trim: true }],
    index: true
  },

  topics: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) { return arr.length <= 15; },
      message: "Cannot have more than 15 topics"
    },
    index: true
  },

  // Search optimization fields
  searchKeywords: {
    type: [{ type: String, lowercase: true, trim: true }],
    index: true
  },

  stemmedTerms: {
    type: [{ type: String, lowercase: true, trim: true }]
  },

  synonyms: {
    type: [{ type: String, lowercase: true, trim: true }]
  },

  // Visibility and status
  visibility: { 
    type: String, 
    enum: {
      values: ["private", "public", "unlisted", "team"],
      message: "Visibility must be private, public, unlisted, or team"
    },
    default: "private",
    index: true
  },
  
  status: {
    type: String,
    enum: ["draft", "published", "archived", "flagged"],
    default: "published",
    index: true
  },

  // User interaction flags
  pinned: { type: Boolean, default: false, index: true },
  favorite: { type: Boolean, default: false, index: true },
  featured: { type: Boolean, default: false, index: true },

  // Engagement metrics
  engagement: {
    type: engagementSchema,
    default: () => ({})
  },

  // Additional metadata
  sourceUrl: { type: String, trim: true },
  documentation: { type: String, maxlength: 3000 },
  notes: { type: String, maxlength: 1000 },
  
  // Version control (for future)
  version: { type: String, default: "1.0.0" },
  changelog: [{ 
    version: String, 
    changes: String, 
    date: { type: Date, default: Date.now }
  }],

  // Collaboration (for future)
  collaborators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],

  // Related snippets (AI-suggested)
  relatedSnippets: [{
    snippet: { type: mongoose.Schema.Types.ObjectId, ref: 'Snippet' },
    similarity: { type: Number, min: 0, max: 1 },
    reason: String
  }],

  // Processing flags
  needsAnalysis: { type: Boolean, default: true },
  lastAnalyzed: { type: Date },
  processingErrors: [String]

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
},



);

enhancedSnippetSchema.methods.isEncrypted = function() {
  return this.isE2EE && !!this.encryptedContent;
};

/**
 * Get decryptable code (returns encrypted version if E2EE)
 * @returns {string}
 */
enhancedSnippetSchema.methods.getCode = function() {
  if (this.isE2EE) {
    return this.encryptedContent || '[Encrypted Content]';
  }
  return this.code;
};

/**
 * Check if user can decrypt (must be owner)
 * @param {ObjectId} userId
 * @returns {boolean}
 */
enhancedSnippetSchema.methods.canDecrypt = function(userId) {
  return this.owner.toString() === userId?.toString();
};

// ==================== UPDATE PRE-SAVE MIDDLEWARE ====================

enhancedSnippetSchema.pre('save', function(next) {
  // ... your existing pre-save code ...

  // ✅ NEW: Don't index encrypted content
  if (this.isE2EE && this.isModified('code')) {
    // Store encrypted version separately
    this.encryptedContent = this.code;
    // Clear plaintext code for security
    this.code = '[Encrypted - Decrypt on client]';
    // Don't analyze encrypted content
    this.needsAnalysis = false;
  }

  next();
});

// ==================== UPDATE canUserView METHOD ====================

enhancedSnippetSchema.methods.canUserView = function(userId) {
  // If encrypted, only owner can view
  if (this.isE2EE) {
    return this.owner.toString() === userId?.toString();
  }
  
  // Existing visibility logic
  if (this.visibility === 'public') return true;
  if (this.visibility === 'unlisted') return true;
  if (this.owner.toString() === userId?.toString()) return true;
  if (this.collaborators.includes(userId)) return true;
  return false;
};

// ==================== ADD NEW VIRTUAL ====================

/**
 * Virtual: Is snippet shareable (encrypted snippets cannot be shared)
 */
enhancedSnippetSchema.virtual('isShareable').get(function() {
  return !this.isE2EE && 
         ['public', 'unlisted'].includes(this.visibility) && 
         this.status === 'published';
});
// Indexes for optimal search performance
enhancedSnippetSchema.index({ owner: 1, createdAt: -1 });
enhancedSnippetSchema.index({ visibility: 1, status: 1, createdAt: -1 });
enhancedSnippetSchema.index({ 
  visibility: 1, 
  language: 1, 
  category: 1, 
  createdAt: -1 
});
enhancedSnippetSchema.index({ 
  "engagement.views": -1, 
  "engagement.favorites": -1 
});
enhancedSnippetSchema.index({ 
  "qualityMetrics.overall": -1,
  createdAt: -1 
});

// ✅ FIXED: Advanced text search index with language override configuration
enhancedSnippetSchema.index({
  title: "text",
  "aiMetadata.description": "text",
  "aiMetadata.summary": "text",
  searchKeywords: "text",
  code: "text"
}, {
  weights: {
    title: 10,
    "aiMetadata.description": 8,
    "aiMetadata.summary": 6,
    searchKeywords: 5,
    code: 3
  },
  name: "advanced_snippet_search",
  default_language: "english",      // ✅ Set default text search language
  language_override: "textLanguage" // ✅ Tell MongoDB to NOT use 'language' field
});

// Virtual for search score
enhancedSnippetSchema.virtual('searchScore').get(function() {
  const qualityWeight = 0.3;
  const engagementWeight = 0.4;
  const recencyWeight = 0.3;
  
  const qualityScore = this.qualityMetrics.overall || 5;
  const engagementScore = Math.min(
    (this.engagement.views * 0.1 + this.engagement.favorites * 2 + 
     this.engagement.copies * 1.5 + this.engagement.shares * 3) / 10, 
    10
  );
  const recencyScore = Math.max(
    10 - ((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30)), 
    0
  );
  
  return (
    qualityScore * qualityWeight +
    engagementScore * engagementWeight +
    recencyScore * recencyWeight
  ).toFixed(2);
});

// Pre-save middleware for search optimization
enhancedSnippetSchema.pre('save', function(next) {
  // Auto-generate search keywords
  const sources = [
    ...(this.title ? this.title.split(/\s+/) : []),
    ...(this.aiMetadata?.description ? this.aiMetadata.description.split(/\s+/) : []),
    ...this.tags,
    ...this.frameworks,
    ...this.libraries,
    ...this.topics
  ];
  
  this.searchKeywords = [...new Set(
    sources
      .map(term => term.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(term => term.length > 2)
  )];

  // Update line and character count
  if (this.isModified('code')) {
    this.codeAnalysis.lineCount = (this.code.match(/\n/g) || []).length + 1;
    this.codeAnalysis.characterCount = this.code.length;
    this.needsAnalysis = true;
  }

  // Update average rating
  if (this.engagement.ratings.length > 0) {
    const sum = this.engagement.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.engagement.averageRating = (sum / this.engagement.ratings.length).toFixed(1);
  }

  next();
});

// Instance methods
enhancedSnippetSchema.methods.incrementViews = function() {
  this.engagement.views = (this.engagement.views || 0) + 1;
  return this.save();
};

enhancedSnippetSchema.methods.incrementCopies = function() {
  this.engagement.copies = (this.engagement.copies || 0) + 1;
  return this.save();
};

enhancedSnippetSchema.methods.toggleFavorite = function(userId) {
  return this.save();
};

enhancedSnippetSchema.methods.canUserView = function(userId) {
  if (this.visibility === 'public') return true;
  if (this.visibility === 'unlisted') return true;
  if (this.owner.toString() === userId?.toString()) return true;
  if (this.collaborators.includes(userId)) return true;
  return false;
};

// Static methods for advanced search
enhancedSnippetSchema.statics.searchAdvanced = function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'relevance',
    userId,
    filters = {}
  } = options;

  const searchQuery = { status: 'published' };
  
  // Visibility filter
  if (userId) {
    searchQuery.$or = [
      { visibility: 'public' },
      { visibility: 'unlisted' },
      { owner: userId }
    ];
  } else {
    searchQuery.visibility = 'public';
  }

  // Apply filters
  if (filters.language) searchQuery.language = filters.language;
  if (filters.category) searchQuery.category = filters.category;
  if (filters.complexity) searchQuery.complexity = filters.complexity;
  if (filters.frameworks?.length) {
    searchQuery.frameworks = { $in: filters.frameworks };
  }
  if (filters.tags?.length) {
    searchQuery.tags = { $all: filters.tags };
  }

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Sort options
  let sortOptions = { createdAt: -1 };
  switch (sortBy) {
    case 'relevance':
      sortOptions = query ? { score: { $meta: 'textScore' } } : { "engagement.views": -1 };
      break;
    case 'popular':
      sortOptions = { "engagement.views": -1, "engagement.favorites": -1 };
      break;
    case 'quality':
      sortOptions = { "qualityMetrics.overall": -1 };
      break;
    case 'recent':
      sortOptions = { createdAt: -1 };
      break;
  }

  return this.find(searchQuery)
    .populate('owner', 'name email')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Snippet', enhancedSnippetSchema);
