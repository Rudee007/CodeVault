const Snippet = require('../Models/Snippet');

/* ==================== CREATE SNIPPET ==================== */
// POST /api/snippets
module.exports.createSnippet = async (req, res) => {
  try {
    const {
      title,
      content,
      programmingLanguage,  // ✅ FIXED
      summary,
      tags = [],
      frameworks = [],
      topics = [],
      visibility = 'private',
      attributes = {}
    } = req.body;

    // Validate required fields
    if (!title || !content || !programmingLanguage) {  // ✅ FIXED
      return res.status(400).json({
        message: 'Title, content, and programming language are required',  // ✅ FIXED
        missing: {
          title: !title,
          content: !content,
          programmingLanguage: !programmingLanguage  // ✅ FIXED
        }
      });
    }

    // Create snippet with authenticated user as owner
    const snippet = new Snippet({
      owner: req.user._id, // From authMiddleware
      title: title.trim(),
      content,
      programmingLanguage,  // ✅ FIXED
      summary: summary?.trim(),
      tags: Array.isArray(tags) ? tags : [],
      frameworks: Array.isArray(frameworks) ? frameworks : [],
      topics: Array.isArray(topics) ? topics : [],
      visibility,
      attributes
    });

    const savedSnippet = await snippet.save();
    
    // Populate owner info for response
    await savedSnippet.populate('owner', 'name email');

    res.status(201).json({
      message: 'Snippet created successfully',
      snippet: savedSnippet
    });

  } catch (error) {
    console.error('Create snippet error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Failed to create snippet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== GET ALL SNIPPETS (WITH FILTERS) ==================== */
// GET /api/snippets
module.exports.getSnippets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      programmingLanguage,  // ✅ FIXED
      tags,
      frameworks,
      topics,
      visibility,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      owner
    } = req.query;

    // Build query object
    const query = {};
    
    // If owner filter is provided, check if user can view
    if (owner) {
      if (owner === req.user._id.toString()) {
        query.owner = req.user._id; // User viewing their own snippets
      } else {
        query.visibility = 'public'; // Can only see public snippets of others
        query.owner = owner;
      }
    } else {
      // Default: show public snippets or user's own snippets
      query.$or = [
        { visibility: 'public' },
        { visibility: 'unlisted' },
        { owner: req.user._id }
      ];
    }

    // Add filters
    if (programmingLanguage) query.programmingLanguage = programmingLanguage;  // ✅ FIXED
    if (visibility) query.visibility = visibility;
    
    // Array filters (AND operation for tags, OR for others)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $all: tagArray.map(tag => tag.toLowerCase().trim()) };
    }
    
    if (frameworks) {
      const frameworkArray = Array.isArray(frameworks) ? frameworks : frameworks.split(',');
      query.frameworks = { $in: frameworkArray.map(f => f.toLowerCase().trim()) };
    }
    
    if (topics) {
      const topicArray = Array.isArray(topics) ? topics : topics.split(',');
      query.topics = { $in: topicArray.map(t => t.toLowerCase().trim()) };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Don't show archived snippets unless explicitly requested
    if (req.query.archived !== 'true') {
      query.isArchived = false;
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === 'popularity') {
      sortObj.stars = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'views') {
      sortObj['stats.views'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Add pinned to sort (pinned items first)
    const finalSort = { pinned: -1, ...sortObj };

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .populate('owner', 'name email')
        .sort(finalSort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      
      Snippet.countDocuments(query)
    ]);

    res.json({
      snippets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + snippets.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({
      message: 'Failed to fetch snippets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== GET SINGLE SNIPPET ==================== */
// GET /api/snippets/:id
module.exports.getSnippetById = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('owner', 'name email');

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if user can view this snippet
    if (!snippet.canUserView(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count if not the owner viewing
    if (snippet.owner._id.toString() !== req.user._id.toString()) {
      await snippet.incrementViews();
    }

    res.json({ snippet });

  } catch (error) {
    console.error('Get snippet by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    res.status(500).json({
      message: 'Failed to fetch snippet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== UPDATE SNIPPET ==================== */
// PUT /api/snippets/:id
module.exports.updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check ownership
    if (snippet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own snippets' });
    }

    // Update allowed fields
    const updateFields = [
      'title',
      'content', 
      'programmingLanguage',  // ✅ FIXED
      'summary',
      'tags',
      'frameworks',
      'topics',
      'visibility',
      'attributes',
      'pinned'
    ];

    updateFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        snippet[field] = req.body[field];
      }
    });

    const updatedSnippet = await snippet.save();
    await updatedSnippet.populate('owner', 'name email');

    res.json({
      message: 'Snippet updated successfully',
      snippet: updatedSnippet
    });

  } catch (error) {
    console.error('Update snippet error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Failed to update snippet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== DELETE SNIPPET ==================== */
// DELETE /api/snippets/:id
module.exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check ownership
    if (snippet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own snippets' });
    }

    await Snippet.findByIdAndDelete(req.params.id);

    res.json({ message: 'Snippet deleted successfully' });

  } catch (error) {
    console.error('Delete snippet error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    res.status(500).json({
      message: 'Failed to delete snippet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== COPY SNIPPET (INCREMENT COUNTER) ==================== */
// POST /api/snippets/:id/copy
module.exports.copySnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if user can view this snippet
    if (!snippet.canUserView(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment copy count
    await snippet.incrementCopied();

    res.json({ 
      message: 'Copy count updated',
      copyCount: snippet.stats.copied + 1
    });

  } catch (error) {
    console.error('Copy snippet error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    res.status(500).json({
      message: 'Failed to update copy count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== GET USER'S SNIPPETS ==================== */
// GET /api/snippets/user/me
module.exports.getMySnippets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      archived = 'false',
      pinned,
      programmingLanguage,  // ✅ FIXED
      tags
    } = req.query;

    const query = { owner: req.user._id };
    
    // Add filters
    query.isArchived = archived === 'true';
    if (pinned !== undefined) query.pinned = pinned === 'true';
    if (programmingLanguage) query.programmingLanguage = programmingLanguage;  // ✅ FIXED
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.toLowerCase().trim()) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      
      Snippet.countDocuments(query)
    ]);

    res.json({
      snippets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + snippets.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get my snippets error:', error);
    res.status(500).json({
      message: 'Failed to fetch your snippets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
