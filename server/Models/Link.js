// Models/Link.js
const mongoose = require('mongoose');
const crypto = require('crypto');

// ==================== SUB-SCHEMAS ====================

const shareStatsSchema = new mongoose.Schema({
  views: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  copies: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  downloads: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  uniqueVisitors: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  lastViewedAt: { 
    type: Date 
  }
}, { _id: false });

const shareSettingsSchema = new mongoose.Schema({
  allowCopy: { 
    type: Boolean, 
    default: true 
  },
  allowDownload: { 
    type: Boolean, 
    default: true 
  },
  allowComments: { 
    type: Boolean, 
    default: true 
  },
  requireAuth: { 
    type: Boolean, 
    default: false 
  },
  password: { 
    type: String, 
    select: false 
  },
  maxViews: { 
    type: Number, 
    default: null,
    min: 1
  },
  expiresAt: { 
    type: Date, 
    default: null 
  }
}, { _id: false });

const accessLogEntrySchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  ip: { 
    type: String, 
    trim: true 
  },
  userAgent: { 
    type: String, 
    trim: true 
  },
  action: { 
    type: String, 
    enum: ['view', 'copy', 'download', 'denied'],
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  country: String,
  city: String
}, { _id: false });

// ==================== MAIN LINK SCHEMA ====================

const linkSchema = new mongoose.Schema({
  // Core references
  snippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet',
    required: [true, 'Snippet reference is required'],
    index: true
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required'],
    index: true
  },

  // Unique share identifier (12-character hex)
  shareId: {
    type: String,
    required: [true, 'Share ID is required'],
    unique: true,
    index: true,
    trim: true,
    minlength: 12,
    maxlength: 12
  },

  // Full shareable URL
  shareableLink: {
    type: String,
    required: [true, 'Shareable link is required'],
    trim: true
  },

  // Link metadata
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Custom slug (optional - for branded links)
  customSlug: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^[a-z0-9-]+$/, 'Custom slug can only contain lowercase letters, numbers, and hyphens']
  },

  // Share settings
  settings: {
    type: shareSettingsSchema,
    default: () => ({})
  },

  // Share statistics
  stats: {
    type: shareStatsSchema,
    default: () => ({})
  },

  // Encryption awareness
  isE2EEProtected: {
    type: Boolean,
    default: false,
    index: true
  },
  
  requiresDecryption: {
    type: Boolean,
    default: false
  },

  // Status tracking
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'disabled', 'paused'],
    default: 'active',
    index: true
  },

  // Access tracking
  accessLog: {
    type: [accessLogEntrySchema],
    default: [],
    validate: {
      validator: function(arr) { 
        return arr.length <= 1000; 
      },
      message: 'Access log cannot exceed 1000 entries'
    }
  },

  // IP whitelist/blacklist (optional security)
  allowedIPs: {
    type: [String],
    default: []
  },

  blockedIPs: {
    type: [String],
    default: []
  },

  // Geographic restrictions
  allowedCountries: {
    type: [String],
    default: []
  },

  blockedCountries: {
    type: [String],
    default: []
  },

  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  
  lastAccessedAt: { 
    type: Date 
  },
  
  expiresAt: { 
    type: Date, 
    index: true 
  },
  
  revokedAt: { 
    type: Date 
  },

  pausedAt: {
    type: Date
  },

  // Notes for owner
  notes: {
    type: String,
    maxlength: 1000
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================

linkSchema.index({ snippet: 1, owner: 1 });
linkSchema.index({ shareId: 1, status: 1 });
linkSchema.index({ owner: 1, status: 1, createdAt: -1 });
linkSchema.index({ expiresAt: 1, status: 1 });
linkSchema.index({ customSlug: 1 }, { unique: true, sparse: true });
linkSchema.index({ 'stats.views': -1, createdAt: -1 });

// ==================== VIRTUALS ====================

/**
 * Check if link is expired
 */
linkSchema.virtual('isExpired').get(function() {
  if (!this.settings.expiresAt && !this.expiresAt) return false;
  const expiryDate = this.settings.expiresAt || this.expiresAt;
  return new Date() > new Date(expiryDate);
});

/**
 * Check if link is active
 */
linkSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired && !this.isViewLimitReached;
});

/**
 * Check if view limit reached
 */
linkSchema.virtual('isViewLimitReached').get(function() {
  if (!this.settings.maxViews) return false;
  return this.stats.views >= this.settings.maxViews;
});

/**
 * Engagement rate percentage
 */
linkSchema.virtual('engagementRate').get(function() {
  if (!this.stats.views || this.stats.views === 0) return 0;
  const interactions = this.stats.copies + this.stats.downloads;
  return parseFloat(((interactions / this.stats.views) * 100).toFixed(2));
});

/**
 * Days until expiration
 */
linkSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.settings.expiresAt && !this.expiresAt) return null;
  const expiryDate = this.settings.expiresAt || this.expiresAt;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// ==================== STATIC METHODS ====================

/**
 * Generate unique share ID (12-character hex)
 * @returns {string}
 */
linkSchema.statics.generateShareId = function() {
  return crypto.randomBytes(6).toString('hex');
};

/**
 * Create a new share link
 * @param {Object} data - Link creation data
 * @returns {Promise<Link>}
 */
linkSchema.statics.createShareLink = async function(data) {
  const { 
    snippet, 
    owner, 
    settings = {}, 
    title, 
    description,
    customSlug,
    notes
  } = data;

  // Verify snippet exists and is shareable
  const Snippet = mongoose.model('Snippet');
  const snippetDoc = await Snippet.findById(snippet);
  
  if (!snippetDoc) {
    throw new Error('Snippet not found');
  }

  // Verify ownership
  if (snippetDoc.owner.toString() !== owner.toString()) {
    throw new Error('You can only share your own snippets');
  }
  
  // Check if snippet is encrypted (E2EE)
  if (snippetDoc.isE2EE) {
    throw new Error('Encrypted snippets cannot be shared for security reasons');
  }
  
  // Check if snippet is shareable (public or unlisted)
  if (!['public', 'unlisted'].includes(snippetDoc.visibility)) {
    throw new Error('Only public or unlisted snippets can be shared. Change visibility first.');
  }

  // Check if snippet is published
  if (snippetDoc.status !== 'published') {
    throw new Error('Only published snippets can be shared');
  }

  // Generate unique share ID
  const shareId = this.generateShareId();
  
  // Build shareable link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const shareableLink = customSlug 
    ? `${frontendUrl}/s/${customSlug}` 
    : `${frontendUrl}/share/${shareId}`;

  // Set expiry if provided
  let expiresAt = null;
  if (settings.expiresIn) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(settings.expiresIn));
  }

  // Hash password if provided
  let hashedPassword = null;
  if (settings.password) {
    const bcrypt = require('bcryptjs');
    hashedPassword = await bcrypt.hash(settings.password, 10);
  }

  // Create link
  const link = await this.create({
    snippet,
    owner,
    shareId,
    shareableLink,
    customSlug,
    title: title || snippetDoc.title,
    description: description || snippetDoc.aiMetadata?.summary || snippetDoc.summary,
    notes,
    settings: {
      allowCopy: settings.allowCopy !== undefined ? settings.allowCopy : true,
      allowDownload: settings.allowDownload !== undefined ? settings.allowDownload : true,
      allowComments: settings.allowComments !== undefined ? settings.allowComments : true,
      requireAuth: settings.requireAuth || false,
      password: hashedPassword,
      maxViews: settings.maxViews || null,
      expiresAt
    },
    expiresAt,
    isE2EEProtected: snippetDoc.isE2EE,
    requiresDecryption: false,
    allowedIPs: settings.allowedIPs || [],
    blockedIPs: settings.blockedIPs || [],
    allowedCountries: settings.allowedCountries || [],
    blockedCountries: settings.blockedCountries || []
  });

  return link;
};

/**
 * Find link by share ID
 * @param {string} shareId - The share ID
 * @returns {Promise<Link>}
 */
linkSchema.statics.findByShareId = async function(shareId) {
  return this.findOne({ 
    shareId, 
    status: 'active' 
  })
    .populate('snippet')
    .populate('owner', 'name email');
};

/**
 * Find link by custom slug
 * @param {string} slug - Custom slug
 * @returns {Promise<Link>}
 */
linkSchema.statics.findBySlug = async function(slug) {
  return this.findOne({ 
    customSlug: slug.toLowerCase(), 
    status: 'active' 
  })
    .populate('snippet')
    .populate('owner', 'name email');
};

/**
 * Get user's sharing analytics
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>}
 */
linkSchema.statics.getUserAnalytics = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        owner: userId
      }
    },
    {
      $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        activeLinks: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        totalViews: { $sum: '$stats.views' },
        totalCopies: { $sum: '$stats.copies' },
        totalDownloads: { $sum: '$stats.downloads' },
        totalUniqueVisitors: { $sum: '$stats.uniqueVisitors' }
      }
    }
  ]);

  return result[0] || {
    totalLinks: 0,
    activeLinks: 0,
    totalViews: 0,
    totalCopies: 0,
    totalDownloads: 0,
    totalUniqueVisitors: 0
  };
};

/**
 * Get popular links for user
 * @param {ObjectId} userId - User ID
 * @param {number} limit - Number of links to return
 * @returns {Promise<Array>}
 */
linkSchema.statics.getPopularLinks = async function(userId, limit = 5) {
  return this.find({ 
    owner: userId, 
    status: 'active' 
  })
    .populate('snippet', 'title programmingLanguage')
    .sort({ 'stats.views': -1, 'stats.copies': -1 })
    .limit(limit)
    .lean();
};

/**
 * Expire old links (scheduled job)
 * @returns {Promise<number>} Number of expired links
 */
linkSchema.statics.expireOldLinks = async function() {
  const result = await this.updateMany(
    {
      status: 'active',
      expiresAt: { $lte: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );

  return result.modifiedCount;
};

/**
 * Clean up old access logs (keep last 100 per link)
 * @returns {Promise<number>}
 */
linkSchema.statics.cleanupAccessLogs = async function() {
  const links = await this.find({ 
    'accessLog.100': { $exists: true } 
  });

  let cleanedCount = 0;
  for (const link of links) {
    link.accessLog = link.accessLog.slice(-100);
    await link.save();
    cleanedCount++;
  }

  return cleanedCount;
};

// ==================== INSTANCE METHODS ====================

/**
 * Validate access to link
 * @param {Object} options - Access validation options
 * @returns {Object} { allowed: boolean, reason: string }
 */
linkSchema.methods.validateAccess = async function(options = {}) {
  const { userId, password, ip, country } = options;

  // Check if snippet is encrypted
  if (this.isE2EEProtected) {
    return { 
      allowed: false, 
      reason: 'This snippet is encrypted and cannot be shared' 
    };
  }

  // Check status
  if (this.status === 'revoked') {
    return { allowed: false, reason: 'This link has been revoked' };
  }

  if (this.status === 'disabled') {
    return { allowed: false, reason: 'This link is disabled' };
  }

  if (this.status === 'paused') {
    return { allowed: false, reason: 'This link is temporarily paused' };
  }

  if (this.status === 'expired') {
    return { allowed: false, reason: 'This link has expired' };
  }

  // Check expiry
  if (this.isExpired) {
    // Auto-update status
    this.status = 'expired';
    await this.save();
    return { allowed: false, reason: 'This link has expired' };
  }

  // Check view limit
  if (this.isViewLimitReached) {
    this.status = 'expired';
    await this.save();
    return { allowed: false, reason: 'View limit has been reached' };
  }

  // Check auth requirement
  if (this.settings.requireAuth && !userId) {
    return { 
      allowed: false, 
      reason: 'You must be logged in to view this snippet' 
    };
  }

  // Check password (if set)
  if (this.settings.password) {
    if (!password) {
      return { 
        allowed: false, 
        reason: 'This link is password protected',
        requiresPassword: true
      };
    }
    
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, this.settings.password);
    
    if (!isValidPassword) {
      return { 
        allowed: false, 
        reason: 'Invalid password' 
      };
    }
  }

  // Check IP restrictions
  if (ip) {
    if (this.blockedIPs.includes(ip)) {
      return { allowed: false, reason: 'Access denied from your location' };
    }
    
    if (this.allowedIPs.length > 0 && !this.allowedIPs.includes(ip)) {
      return { allowed: false, reason: 'Access denied from your location' };
    }
  }

  // Check country restrictions
  if (country) {
    if (this.blockedCountries.includes(country)) {
      return { allowed: false, reason: 'Access denied from your country' };
    }
    
    if (this.allowedCountries.length > 0 && !this.allowedCountries.includes(country)) {
      return { allowed: false, reason: 'Access denied from your country' };
    }
  }

  return { allowed: true };
};

/**
 * Record an access event
 * @param {Object} accessData - Access event data
 * @returns {Promise<Link>}
 */
linkSchema.methods.recordAccess = async function(accessData) {
  const { action, ip, userAgent, userId, country, city } = accessData;

  // Update stats based on action
  switch (action) {
    case 'view':
      this.stats.views += 1;
      break;
    case 'copy':
      this.stats.copies += 1;
      break;
    case 'download':
      this.stats.downloads += 1;
      break;
  }

  // Track unique visitors by IP
  if (ip && action === 'view') {
    const existingVisitor = this.accessLog.find(log => log.ip === ip);
    if (!existingVisitor) {
      this.stats.uniqueVisitors += 1;
    }
  }

  // Update timestamps
  this.stats.lastViewedAt = new Date();
  this.lastAccessedAt = new Date();

  // Add to access log (keep last 100)
  this.accessLog.push({
    timestamp: new Date(),
    ip,
    userAgent,
    action,
    userId,
    country,
    city
  });

  // Keep only last 100 entries
  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }

  // Check if should auto-expire
  if (this.isViewLimitReached || this.isExpired) {
    this.status = 'expired';
  }

  return this.save();
};

/**
 * Revoke the link
 * @returns {Promise<Link>}
 */
linkSchema.methods.revoke = async function() {
  this.status = 'revoked';
  this.revokedAt = new Date();
  return this.save();
};

/**
 * Pause the link
 * @returns {Promise<Link>}
 */
linkSchema.methods.pause = async function() {
  this.status = 'paused';
  this.pausedAt = new Date();
  return this.save();
};

/**
 * Resume the link
 * @returns {Promise<Link>}
 */
linkSchema.methods.resume = async function() {
  if (this.status === 'paused') {
    this.status = 'active';
    this.pausedAt = undefined;
  }
  return this.save();
};

/**
 * Update link settings
 * @param {Object} newSettings - New settings
 * @returns {Promise<Link>}
 */
linkSchema.methods.updateSettings = async function(newSettings) {
  if (newSettings.allowCopy !== undefined) {
    this.settings.allowCopy = newSettings.allowCopy;
  }
  if (newSettings.allowDownload !== undefined) {
    this.settings.allowDownload = newSettings.allowDownload;
  }
  if (newSettings.allowComments !== undefined) {
    this.settings.allowComments = newSettings.allowComments;
  }
  if (newSettings.requireAuth !== undefined) {
    this.settings.requireAuth = newSettings.requireAuth;
  }
  if (newSettings.password !== undefined) {
    if (newSettings.password) {
      const bcrypt = require('bcryptjs');
      this.settings.password = await bcrypt.hash(newSettings.password, 10);
    } else {
      this.settings.password = undefined;
    }
  }
  if (newSettings.maxViews !== undefined) {
    this.settings.maxViews = newSettings.maxViews;
  }
  if (newSettings.expiresIn !== undefined) {
    if (newSettings.expiresIn) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(newSettings.expiresIn));
      this.settings.expiresAt = expiryDate;
      this.expiresAt = expiryDate;
    } else {
      this.settings.expiresAt = undefined;
      this.expiresAt = undefined;
    }
  }

  return this.save();
};

/**
 * Get access summary
 * @returns {Object}
 */
linkSchema.methods.getAccessSummary = function() {
  const uniqueIPs = new Set(this.accessLog.map(log => log.ip).filter(Boolean));
  const uniqueUsers = new Set(this.accessLog.map(log => log.userId?.toString()).filter(Boolean));
  
  return {
    totalAccess: this.accessLog.length,
    uniqueIPs: uniqueIPs.size,
    uniqueUsers: uniqueUsers.size,
    lastAccess: this.lastAccessedAt,
    views: this.stats.views,
    copies: this.stats.copies,
    downloads: this.stats.downloads,
    engagementRate: this.engagementRate
  };
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware
 */
linkSchema.pre('save', function(next) {
  // Ensure shareableLink is set
  if (!this.shareableLink && this.shareId) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.shareableLink = `${frontendUrl}/share/${this.shareId}`;
  }
  
  next();
});

// ==================== EXPORT ====================

module.exports = mongoose.model('Link', linkSchema);
