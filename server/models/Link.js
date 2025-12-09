// Models/Link.js
const mongoose = require('mongoose');
const crypto = require('crypto');

// ==================== SUB-SCHEMAS ====================

const shareStatsSchema = new mongoose.Schema({
  views: { type: Number, default: 0, min: 0 },
  copies: { type: Number, default: 0, min: 0 },
  downloads: { type: Number, default: 0, min: 0 },
  uniqueVisitors: { type: Number, default: 0, min: 0 },
  lastViewedAt: { type: Date }
}, { _id: false });

const shareSettingsSchema = new mongoose.Schema({
  allowCopy: { type: Boolean, default: true },
  allowDownload: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: true },
  requireAuth: { type: Boolean, default: false },
  password: { type: String, select: false },
  maxViews: { type: Number, default: null, min: 1 },
  expiresAt: { type: Date, default: null }
}, { _id: false });

const accessLogEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  action: { type: String, enum: ['view', 'copy', 'download', 'denied'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  country: String,
  city: String
}, { _id: false });

// ==================== MAIN LINK SCHEMA ====================

const linkSchema = new mongoose.Schema({
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

  shareId: {
    type: String,
    required: [true, 'Share ID is required'],
    unique: true,
    index: true,
    trim: true,
    minlength: 12,
    maxlength: 12
  },

  shareableLink: {
    type: String,
    required: [true, 'Shareable link is required'],
    trim: true
  },

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

  customSlug: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^[a-z0-9-]+$/, 'Custom slug can only contain lowercase letters, numbers, and hyphens']
  },

  settings: {
    type: shareSettingsSchema,
    default: () => ({})
  },

  stats: {
    type: shareStatsSchema,
    default: () => ({})
  },

  isE2EEProtected: {
    type: Boolean,
    default: false,
    index: true
  },
  
  requiresDecryption: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'disabled', 'paused'],
    default: 'active',
    index: true
  },

  accessLog: {
    type: [accessLogEntrySchema],
    default: [],
    validate: {
      validator: function(arr) { return arr.length <= 1000; },
      message: 'Access log cannot exceed 1000 entries'
    }
  },

  allowedIPs: { type: [String], default: [] },
  blockedIPs: { type: [String], default: [] },
  allowedCountries: { type: [String], default: [] },
  blockedCountries: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now, index: true },
  lastAccessedAt: { type: Date },
  expiresAt: { type: Date, index: true },
  revokedAt: { type: Date },
  pausedAt: { type: Date },
  notes: { type: String, maxlength: 1000 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ==================== INDEXES ====================

linkSchema.index({ snippet: 1, owner: 1 });
linkSchema.index({ shareId: 1, status: 1 });
linkSchema.index({ owner: 1, status: 1, createdAt: -1 });
linkSchema.index({ expiresAt: 1, status: 1 });
linkSchema.index({ customSlug: 1 }, { unique: true, sparse: true });
linkSchema.index({ 'stats.views': -1, createdAt: -1 });

// ==================== VIRTUALS ====================

linkSchema.virtual('isExpired').get(function() {
  if (!this.settings.expiresAt && !this.expiresAt) return false;
  const expiryDate = this.settings.expiresAt || this.expiresAt;
  return new Date() > new Date(expiryDate);
});

linkSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired && !this.isViewLimitReached;
});

linkSchema.virtual('isViewLimitReached').get(function() {
  if (!this.settings.maxViews) return false;
  return this.stats.views >= this.settings.maxViews;
});

linkSchema.virtual('engagementRate').get(function() {
  if (!this.stats.views || this.stats.views === 0) return 0;
  const interactions = this.stats.copies + this.stats.downloads;
  return parseFloat(((interactions / this.stats.views) * 100).toFixed(2));
});

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

linkSchema.statics.generateShareId = function() {
  return crypto.randomBytes(6).toString('hex');
};

/**
 * ✅ UPDATED: Create a new share link (allows private snippets)
 */
linkSchema.statics.createShareLink = async function(data) {
  const { snippet, owner, settings = {}, title, description, customSlug, notes } = data;

  console.log('🔗 Link.createShareLink called with:', { snippet, owner, customSlug });

  const Snippet = mongoose.model('Snippet');
  const snippetDoc = await Snippet.findById(snippet);
  
  if (!snippetDoc) {
    console.error('❌ Snippet not found:', snippet);
    throw new Error('Snippet not found');
  }

  console.log('✅ Snippet found:', snippetDoc.title, 'Visibility:', snippetDoc.visibility);

  if (snippetDoc.owner.toString() !== owner.toString()) {
    console.error('❌ Ownership mismatch');
    throw new Error('You can only share your own snippets');
  }
  
  console.log('✅ Ownership verified');
  
  if (snippetDoc.isE2EE) {
    console.error('❌ Snippet is E2EE encrypted');
    throw new Error('Encrypted snippets cannot be shared');
  }
  
  // ✅ KEY CHANGE: Allow private, public, AND unlisted
  if (!['private', 'public', 'unlisted'].includes(snippetDoc.visibility)) {
    console.error('❌ Invalid visibility:', snippetDoc.visibility);
    throw new Error('Only private, public or unlisted snippets can be shared');
  }

  console.log('✅ Visibility check passed:', snippetDoc.visibility);

  if (snippetDoc.status !== 'published') {
    console.error('❌ Snippet status:', snippetDoc.status);
    throw new Error('Only published snippets can be shared');
  }

  console.log('✅ Status check passed');

  const shareId = this.generateShareId();
  console.log('🆔 Generated Share ID:', shareId);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const shareableLink = customSlug 
    ? `${frontendUrl}/s/${customSlug}` 
    : `${frontendUrl}/share/${shareId}`;

  console.log('🔗 Shareable link:', shareableLink);

  let expiresAt = null;
  if (settings.expiresIn) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(settings.expiresIn));
    console.log('⏰ Link expires at:', expiresAt);
  }

  let hashedPassword = null;
  if (settings.password) {
    const bcrypt = require('bcryptjs');
    hashedPassword = await bcrypt.hash(settings.password, 10);
    console.log('🔐 Password hashed');
  }

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

  console.log('✅ Share link created successfully:', link.shareId);
  return link;
};

linkSchema.statics.findByShareId = async function(shareId) {
  return this.findOne({ shareId, status: 'active' })
    .populate('snippet')
    .populate('owner', 'name email');
};

linkSchema.statics.findBySlug = async function(slug) {
  return this.findOne({ customSlug: slug.toLowerCase(), status: 'active' })
    .populate('snippet')
    .populate('owner', 'name email');
};

linkSchema.statics.getUserAnalytics = async function(userId) {
  const result = await this.aggregate([
    { $match: { owner: userId } },
    {
      $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        activeLinks: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
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

linkSchema.statics.getPopularLinks = async function(userId, limit = 5) {
  return this.find({ owner: userId, status: 'active' })
    .populate('snippet', 'title programmingLanguage')
    .sort({ 'stats.views': -1, 'stats.copies': -1 })
    .limit(limit)
    .lean();
};

linkSchema.statics.expireOldLinks = async function() {
  const result = await this.updateMany(
    { status: 'active', expiresAt: { $lte: new Date() } },
    { $set: { status: 'expired' } }
  );
  return result.modifiedCount;
};

linkSchema.statics.cleanupAccessLogs = async function() {
  const links = await this.find({ 'accessLog.100': { $exists: true } });
  let cleanedCount = 0;
  for (const link of links) {
    link.accessLog = link.accessLog.slice(-100);
    await link.save();
    cleanedCount++;
  }
  return cleanedCount;
};

// ==================== INSTANCE METHODS ====================

linkSchema.methods.validateAccess = async function(options = {}) {
  const { userId, password, ip, country } = options;

  if (this.isE2EEProtected) {
    return { allowed: false, reason: 'This snippet is encrypted and cannot be shared' };
  }

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

  if (this.isExpired) {
    this.status = 'expired';
    await this.save();
    return { allowed: false, reason: 'This link has expired' };
  }

  if (this.isViewLimitReached) {
    this.status = 'expired';
    await this.save();
    return { allowed: false, reason: 'View limit has been reached' };
  }

  if (this.settings.requireAuth && !userId) {
    return { allowed: false, reason: 'You must be logged in to view this snippet' };
  }

  if (this.settings.password) {
    if (!password) {
      return { allowed: false, reason: 'This link is password protected', requiresPassword: true };
    }
    
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, this.settings.password);
    if (!isValidPassword) {
      return { allowed: false, reason: 'Invalid password' };
    }
  }

  if (ip) {
    if (this.blockedIPs.includes(ip)) {
      return { allowed: false, reason: 'Access denied from your location' };
    }
    if (this.allowedIPs.length > 0 && !this.allowedIPs.includes(ip)) {
      return { allowed: false, reason: 'Access denied from your location' };
    }
  }

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

linkSchema.methods.recordAccess = async function(accessData) {
  const { action, ip, userAgent, userId, country, city } = accessData;

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

  if (ip && action === 'view') {
    const existingVisitor = this.accessLog.find(log => log.ip === ip);
    if (!existingVisitor) {
      this.stats.uniqueVisitors += 1;
    }
  }

  this.stats.lastViewedAt = new Date();
  this.lastAccessedAt = new Date();

  this.accessLog.push({
    timestamp: new Date(),
    ip,
    userAgent,
    action,
    userId,
    country,
    city
  });

  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }

  if (this.isViewLimitReached || this.isExpired) {
    this.status = 'expired';
  }

  return this.save();
};

linkSchema.methods.revoke = async function() {
  this.status = 'revoked';
  this.revokedAt = new Date();
  return this.save();
};

linkSchema.methods.pause = async function() {
  this.status = 'paused';
  this.pausedAt = new Date();
  return this.save();
};

linkSchema.methods.resume = async function() {
  if (this.status === 'paused') {
    this.status = 'active';
    this.pausedAt = undefined;
  }
  return this.save();
};

linkSchema.methods.updateSettings = async function(newSettings) {
  if (newSettings.allowCopy !== undefined) this.settings.allowCopy = newSettings.allowCopy;
  if (newSettings.allowDownload !== undefined) this.settings.allowDownload = newSettings.allowDownload;
  if (newSettings.allowComments !== undefined) this.settings.allowComments = newSettings.allowComments;
  if (newSettings.requireAuth !== undefined) this.settings.requireAuth = newSettings.requireAuth;
  
  if (newSettings.password !== undefined) {
    if (newSettings.password) {
      const bcrypt = require('bcryptjs');
      this.settings.password = await bcrypt.hash(newSettings.password, 10);
    } else {
      this.settings.password = undefined;
    }
  }
  
  if (newSettings.maxViews !== undefined) this.settings.maxViews = newSettings.maxViews;
  
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

linkSchema.pre('save', function(next) {
  if (!this.shareableLink && this.shareId) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.shareableLink = `${frontendUrl}/share/${this.shareId}`;
  }
  next();
});

// ==================== EXPORT ====================

module.exports = mongoose.model('Link', linkSchema);
