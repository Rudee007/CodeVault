// controllers/linkController.js
const Link = require('../models/Link');
const Snippet = require('../models/Snippet');

const API_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ==================== CREATE SHARE LINK ====================
// controllers/linkController.js - Update the createShareLink function

exports.createShareLink = async (req, res) => {
    try {
      console.log('🔗 Creating share link...');
      console.log('📦 Request body:', req.body);
      console.log('👤 User ID:', req.user.id);
  
      const { id: snippetId } = req.params;
      const userId = req.user.id || req.user._id;
      const { title, description, customSlug, settings = {}, notes } = req.body;
  
      console.log('🔍 Snippet ID:', snippetId);
  
      // Verify snippet exists
      const snippet = await Snippet.findById(snippetId);
  
      if (!snippet) {
        console.error('❌ Snippet not found:', snippetId);
        return res.status(404).json({
          success: false,
          error: 'Snippet not found'
        });
      }
  
      console.log('✅ Snippet found:', snippet.title);
  
      // Verify ownership
      if (snippet.owner.toString() !== userId.toString()) {
        console.error('❌ Ownership check failed');
        return res.status(403).json({
          success: false,
          error: 'You can only share your own snippets'
        });
      }
  
      // Check if snippet is encrypted (E2EE)
      if (snippet.isE2EE) {
        return res.status(400).json({
          success: false,
          error: 'Encrypted snippets cannot be shared'
        });
      }
  
      // ✅ UPDATED: Allow private, public, and unlisted snippets
      if (!['private', 'public', 'unlisted'].includes(snippet.visibility)) {
        return res.status(400).json({
          success: false,
          error: 'Only private, public or unlisted snippets can be shared'
        });
      }
  
      // Check status
      if (snippet.status !== 'published') {
        return res.status(400).json({
          success: false,
          error: 'Only published snippets can be shared'
        });
      }
  
      // Generate unique share ID
      const shareId = Link.schema.statics.generateShareId();
      console.log('🆔 Generated Share ID:', shareId);
  
      // Build shareable link
      const shareableLink = customSlug
        ? `${API_BASE_URL}/s/${customSlug}`
        : `${API_BASE_URL}/share/${shareId}`;
  
      console.log('🔗 Shareable link:', shareableLink);
  
      // Set expiry if provided
      let expiresAt = null;
      if (settings.expiresIn) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(settings.expiresIn));
        console.log('⏰ Link expires at:', expiresAt);
      }
  
      // Hash password if provided
      let hashedPassword = null;
      if (settings.password) {
        const bcrypt = require('bcryptjs');
        hashedPassword = await bcrypt.hash(settings.password, 10);
      }
  
      // Create link
      const link = await Link.create({
        snippet: snippetId,
        owner: userId,
        shareId,
        shareableLink,
        customSlug,
        title: title || snippet.title,
        description: description || snippet.aiMetadata?.summary || '',
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
        isE2EEProtected: snippet.isE2EE,
        allowedIPs: settings.allowedIPs || [],
        blockedIPs: settings.blockedIPs || [],
        allowedCountries: settings.allowedCountries || [],
        blockedCountries: settings.blockedCountries || []
      });
  
      console.log('✅ Share link created:', link.shareId);
  
      res.status(201).json({
        success: true,
        data: {
          shareId: link.shareId,
          shareableLink: link.shareableLink,
          customSlug: link.customSlug,
          settings: link.settings,
          stats: link.stats
        }
      });
    } catch (error) {
      console.error('❌ Create share link error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
// ==================== RESOLVE SHARE LINK ====================
exports.resolveShareLink = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const userId = req.user?.id;

    // Find link
    const link = await Link.findOne({ shareId, status: 'active' })
      .populate('snippet')
      .populate('owner', 'name email');

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found or has expired'
      });
    }

    // Validate access
    const accessResult = await link.validateAccess({
      userId,
      password,
      ip
    });

    if (!accessResult.allowed) {
      // Log denied access
      await link.recordAccess({
        action: 'denied',
        ip,
        userAgent,
        userId
      });

      return res.status(403).json({
        success: false,
        error: accessResult.reason,
        requiresPassword: accessResult.requiresPassword
      });
    }

    // Record view
    await link.recordAccess({
      action: 'view',
      ip,
      userAgent,
      userId
    });

    // Return snippet + link data
    res.json({
      success: true,
      data: {
        snippet: link.snippet,
        link: {
          shareId: link.shareId,
          title: link.title,
          description: link.description,
          stats: link.stats,
          settings: {
            allowCopy: link.settings.allowCopy,
            allowDownload: link.settings.allowDownload,
            expiresAt: link.settings.expiresAt
          }
        },
        owner: link.owner
      }
    });
  } catch (error) {
    console.error('Resolve share error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load snippet'
    });
  }
};

// ==================== RESOLVE BY CUSTOM SLUG ====================
exports.resolveBySlug = async (req, res) => {
  try {
    const { customSlug } = req.params;
    const { password } = req.query;

    const link = await Link.findOne({ customSlug: customSlug.toLowerCase(), status: 'active' })
      .populate('snippet')
      .populate('owner', 'name email');

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found'
      });
    }

    // Validate access
    const accessResult = await link.validateAccess({ password });
    if (!accessResult.allowed) {
      return res.status(403).json({
        success: false,
        error: accessResult.reason,
        requiresPassword: accessResult.requiresPassword
      });
    }

    // Record view
    await link.recordAccess({
      action: 'view',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        snippet: link.snippet,
        link: {
          shareId: link.shareId,
          title: link.title,
          stats: link.stats,
          settings: {
            allowCopy: link.settings.allowCopy,
            allowDownload: link.settings.allowDownload
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load snippet'
    });
  }
};

// ==================== TRACK COPY ====================
exports.trackCopy = async (req, res) => {
  try {
    const { shareId } = req.params;
    const link = await Link.findOne({ shareId });

    if (link && link.settings.allowCopy) {
      await link.recordAccess({
        action: 'copy',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ==================== TRACK DOWNLOAD ====================
exports.trackDownload = async (req, res) => {
  try {
    const { shareId } = req.params;
    const link = await Link.findOne({ shareId });

    if (link && link.settings.allowDownload) {
      await link.recordAccess({
        action: 'download',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ==================== GET USER LINKS ====================
exports.getUserLinks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { page = 1, limit = 20, status = 'all', sortBy = 'recent' } = req.query;

    const query = { owner: userId };
    if (status !== 'all') query.status = status;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'popular') sortOptions = { 'stats.views': -1 };
    if (sortBy === 'engagement') sortOptions = { engagementRate: -1 };

    const links = await Link.find(query)
      .populate('snippet', 'title language visibility')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Link.countDocuments(query);
    const analytics = await Link.getUserAnalytics(userId);

    res.json({
      success: true,
      data: {
        links,
        analytics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch links'
    });
  }
};

// ==================== GET LINK ANALYTICS ====================
exports.getLinkAnalytics = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({
      shareId,
      owner: userId
    }).populate('snippet', 'title language');

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    res.json({
      success: true,
      data: {
        link: {
          shareId: link.shareId,
          title: link.title,
          shareableLink: link.shareableLink,
          status: link.status,
          createdAt: link.createdAt
        },
        analytics: link.getAccessSummary(),
        stats: link.stats,
        accessLog: link.accessLog.slice(-50)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

// ==================== UPDATE LINK SETTINGS ====================
exports.updateLinkSettings = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({ shareId, owner: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    await link.updateSettings(req.body);

    res.json({
      success: true,
      data: link
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ==================== DELETE LINK ====================
exports.deleteLink = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({ shareId, owner: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    link.status = 'disabled';
    await link.save();

    res.json({
      success: true,
      message: 'Share link disabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete link'
    });
  }
};

// ==================== REVOKE LINK ====================
exports.revokeLink = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({ shareId, owner: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    await link.revoke();

    res.json({
      success: true,
      message: 'Share link revoked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to revoke link'
    });
  }
};

// ==================== PAUSE LINK ====================
exports.pauseLink = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({ shareId, owner: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    await link.pause();

    res.json({
      success: true,
      message: 'Share link paused'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to pause link'
    });
  }
};

// ==================== RESUME LINK ====================
exports.resumeLink = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id || req.user._id;

    const link = await Link.findOne({ shareId, owner: userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found'
      });
    }

    await link.resume();

    res.json({
      success: true,
      message: 'Share link resumed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resume link'
    });
  }
};
