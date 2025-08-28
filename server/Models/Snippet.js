const mongoose = require('mongoose');

// Sub-schemas for cleaner organization
const attributesSubSchema = new mongoose.Schema({
  runtime:    { type: String, trim: true },                    // e.g., "node18", "python3.11"
  license:    { type: String, trim: true },                    // e.g., "MIT", "Apache-2.0"
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  os:         [{ type: String, trim: true, lowercase: true }]  // ["linux", "windows", "macos"]
}, { _id: false });

const statsSubSchema = new mongoose.Schema({
  views:  { type: Number, default: 0, min: 0 },
  copied: { type: Number, default: 0, min: 0 }
}, { _id: false });

// Reserved for future AES-GCM encryption
const encryptionSubSchema = new mongoose.Schema({
  encryptedContent: { type: String },  // Base64 ciphertext
  iv:               { type: String },  // 12-byte IV for GCM
  authTag:          { type: String },  // 16-byte authentication tag
  wrappedDEK:       { type: String },  // DEK wrapped by KEK/KMS
  algorithm:        { type: String, default: "AES-256-GCM" }
}, { _id: false });

// Main Snippet Schema
const snippetSchema = new mongoose.Schema({
  // Core ownership & identification
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },

  // Required content fields
  title: { 
    type: String, 
    required: [true, "Title is required"],
    trim: true, 
    maxlength: [140, "Title cannot exceed 140 characters"],
    minlength: [3, "Title must be at least 3 characters"]
  },
  
  content: { 
    type: String, 
    required: [true, "Code content is required"],
    minlength: [1, "Content cannot be empty"]
  },
  
  // FIXED: Renamed from 'language' to avoid MongoDB text index conflict
  programmingLanguage: { 
    type: String, 
    required: [true, "Programming language is required"],
    trim: true,
    index: true  // For language filtering
  },

  // Optional but recommended for search
  summary: { 
    type: String, 
    trim: true, 
    maxlength: [280, "Summary cannot exceed 280 characters"] 
  },

  // Search-optimized taxonomy arrays (normalized on save)
  tags: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) {
        return arr.length <= 20; // Max 20 tags
      },
      message: "Cannot have more than 20 tags"
    },
    index: true  // Multikey index for fast tag filtering
  },
  
  frameworks: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) {
        return arr.length <= 15; // Max 15 frameworks
      },
      message: "Cannot have more than 15 frameworks"
    },
    index: true  // Multikey index
  },
  
  topics: {
    type: [{ type: String, lowercase: true, trim: true }],
    validate: {
      validator: function(arr) {
        return arr.length <= 10; // Max 10 topics
      },
      message: "Cannot have more than 10 topics"
    },
    index: true  // Multikey index
  },

  // Precomputed keywords for lightweight search
  keywords: {
    type: [{ type: String, lowercase: true, trim: true }],
    index: true
  },

  // Visibility and flags
  visibility: { 
    type: String, 
    enum: {
      values: ["private", "public", "unlisted"],
      message: "Visibility must be private, public, or unlisted"
    },
    default: "private",
    index: true  // For public/private filtering
  },
  
  pinned: { type: Boolean, default: false, index: true },
  isArchived: { type: Boolean, default: false, index: true },

  // Engagement metrics
  stars: { type: Number, default: 0, min: 0 },
  favoritesCount: { type: Number, default: 0, min: 0 },
  stats: { type: statsSubSchema, default: () => ({}) },

  // Additional attributes for filtering
  attributes: { type: attributesSubSchema, default: () => ({}) },

  // Future encryption support
  encryption: encryptionSubSchema

}, { 
  timestamps: true,  // Adds createdAt and updatedAt
  autoIndex: true    // Set to false in production
});

/* ==================== NORMALIZATION MIDDLEWARE ==================== */

// Helper function to normalize strings to slugs
function slugify(str) {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "")     // Remove special characters
    .replace(/-+/g, "-")            // Replace multiple hyphens with single
    .replace(/^-|-$/g, "");         // Remove leading/trailing hyphens
}

// Pre-save middleware for normalization
snippetSchema.pre('save', function(next) {
  // FIXED: Normalize programmingLanguage instead of language
  if (this.programmingLanguage) {
    this.programmingLanguage = slugify(this.programmingLanguage);
  }

  // Normalize and dedupe arrays
  const normalizeArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    const normalized = arr
      .map(item => slugify(item))
      .filter(item => item.length > 0);
    return [...new Set(normalized)]; // Remove duplicates
  };

  this.tags = normalizeArray(this.tags);
  this.frameworks = normalizeArray(this.frameworks);
  this.topics = normalizeArray(this.topics);
  
  // Generate keywords from title, summary, tags, frameworks, topics
  const keywordSources = [
    ...(this.title ? this.title.split(/\s+/) : []),
    ...(this.summary ? this.summary.split(/\s+/) : []),
    ...this.tags,
    ...this.frameworks,
    ...this.topics
  ];
  
  this.keywords = normalizeArray(keywordSources);

  // Normalize visibility
  if (this.visibility) {
    this.visibility = this.visibility.toLowerCase();
  }

  // Business rule: encrypted snippets cannot be public
  if (this.encryption?.encryptedContent && this.visibility === "public") {
    this.visibility = "private";
  }

  next();
});

/* ==================== INDEXES FOR SEARCH OPTIMIZATION ==================== */

// ESR (Equality, Sort, Range) compound indexes for common queries
snippetSchema.index({ owner: 1, createdAt: -1 });                              // User's snippets by date
snippetSchema.index({ visibility: 1, createdAt: -1 });                         // Public snippets by date
snippetSchema.index({ visibility: 1, programmingLanguage: 1, createdAt: -1 }); // FIXED: Updated index
snippetSchema.index({ visibility: 1, pinned: -1, createdAt: -1 });             // Public + pinned first

// Performance indexes for common filters
snippetSchema.index({ createdAt: -1 });                              // Recent snippets
snippetSchema.index({ stars: -1 });                                  // Popular snippets
snippetSchema.index({ "stats.views": -1 });                          // Most viewed

// FIXED: Text search index with proper language override configuration
snippetSchema.index(
  { title: "text", summary: "text" }, 
  { 
    weights: { title: 5, summary: 2 },
    default_language: "english",
    language_override: "textLanguage",  // Use a field that doesn't exist
    name: "snippet_text_search"
  }
);

/* ==================== VIRTUAL PROPERTIES ==================== */

// Virtual for snippet URL (useful for frontend routing)
snippetSchema.virtual('url').get(function() {
  return `/snippets/${this._id}`;
});

// Virtual for readable creation date
snippetSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
snippetSchema.set('toJSON', { virtuals: true });

/* ==================== STATIC METHODS ==================== */

// Find public snippets with filters
snippetSchema.statics.findPublicSnippets = function(filters = {}) {
  const query = { visibility: 'public', isArchived: false };
  
  // FIXED: Updated field name
  if (filters.programmingLanguage) query.programmingLanguage = filters.programmingLanguage;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = filters.tagsOperator === 'OR' 
      ? { $in: filters.tags }
      : { $all: filters.tags };
  }
  if (filters.frameworks && filters.frameworks.length > 0) {
    query.frameworks = { $in: filters.frameworks };
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return this.find(query)
    .populate('owner', 'name email')
    .sort({ pinned: -1, createdAt: -1 })
    .limit(filters.limit || 20);
};

// Find user's snippets
snippetSchema.statics.findUserSnippets = function(userId, filters = {}) {
  const query = { owner: userId };
  
  if (filters.archived !== undefined) query.isArchived = filters.archived;
  if (filters.pinned !== undefined) query.pinned = filters.pinned;
  
  return this.find(query)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(filters.limit || 50);
};

/* ==================== INSTANCE METHODS ==================== */

// Increment view count
snippetSchema.methods.incrementViews = function() {
  this.stats.views = (this.stats.views || 0) + 1;
  return this.save();
};

// Increment copy count
snippetSchema.methods.incrementCopied = function() {
  this.stats.copied = (this.stats.copied || 0) + 1;
  return this.save();
};

// Check if user can view this snippet
snippetSchema.methods.canUserView = function(userId) {
  if (this.visibility === 'public') return true;
  if (this.visibility === 'unlisted') return true;
  return this.owner.toString() === userId?.toString();
};

// Export the model
module.exports = mongoose.model('Snippet', snippetSchema);
