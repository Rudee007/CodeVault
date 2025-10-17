const Snippet = require('../Models/Snippet');
const aiService = require('../services/aiService');
const languageDetector = require('../services/languageDetector');

/* ==================== CREATE SNIPPET ==================== */
// POST /api/snippets
// controllers/snippetController.js


module.exports.createSnippet = async (req, res) => {
  try {
    console.log('📦 Received request body:', req.body);
    console.log('👤 User ID:', req.user._id);

    const {
      title,
      code,
      language,
      category,
      domain,
      complexity,
      tags = [],
      frameworks = [],
      libraries = [],
      topics = [],
      visibility = 'private',
      documentation,
      notes
    } = req.body;

    // ✅ Validate required fields
    if (!title || !code) {
      return res.status(400).json({
        message: 'Title and code are required',
        errors: [
          !title && 'Title is required',
          !code && 'Code content is required'
        ].filter(Boolean)
      });
    }

    // ✅ Auto-detect language if not provided
    let detectedLanguage = language;
    let languageConfidence = 0.9;
    
    if (!detectedLanguage || detectedLanguage === 'other') {
      try {
        const detectionResult = await languageDetector.detect(code);
        detectedLanguage = detectionResult.language || 'javascript';
        languageConfidence = detectionResult.confidence || 0.7;
      } catch (error) {
        console.warn('Language detection failed:', error.message);
        detectedLanguage = 'javascript'; // Default fallback
      }
    }

    // ✅ Validate category against schema enum
    const validCategories = [
      "web-development", "mobile-development", "data-science", "algorithms", 
      "devops", "api", "database", "testing", "ui-components", "utilities", "other"
    ];
    
    const validCategory = validCategories.includes(category) ? category : 'other';

    // ✅ Validate domain against schema enum
    const validDomains = [
      "frontend", "backend", "fullstack", "mobile", "desktop", "embedded", 
      "data", "ml-ai", "devops", "testing", "other"
    ];
    
    const validDomain = validDomains.includes(domain) ? domain : 'other';

    // ✅ Validate complexity
    const validComplexities = ["beginner", "intermediate", "advanced", "expert"];
    const validComplexity = validComplexities.includes(complexity) ? complexity : 'beginner';

    // ✅ Create snippet with correct field names matching YOUR Snippet schema
    const snippet = new Snippet({
      owner: req.user._id,                      // ✅ From your schema
      title: title.trim(),                      // ✅ From your schema
      code: code.trim(),                        // ✅ From your schema
      language: detectedLanguage.toLowerCase(), // ✅ From your schema
      languageConfidence,                       // ✅ From your schema
      category: validCategory,                  // ✅ From your schema
      domain: validDomain,                      // ✅ From your schema
      complexity: validComplexity,              // ✅ From your schema
      tags: Array.isArray(tags) ? tags : [],
      frameworks: Array.isArray(frameworks) ? frameworks : [],
      libraries: Array.isArray(libraries) ? libraries : [],
      topics: Array.isArray(topics) ? topics : [],
      visibility,
      documentation: documentation?.trim() || '',
      notes: notes?.trim() || '',
      needsAnalysis: true,
      status: 'published',
      // ✅ Initialize AI metadata
      aiMetadata: {
        description: documentation?.trim() || '',
        summary: documentation?.trim().substring(0, 280) || '',
        generatedAt: new Date(),
        confidence: 0.8
      },
      // ✅ Initialize code analysis
      codeAnalysis: {
        lineCount: (code.match(/\n/g) || []).length + 1,
        characterCount: code.length
      }
    });

    console.log('💾 Attempting to save snippet with:', {
      owner: snippet.owner,
      title: snippet.title,
      language: snippet.language,
      category: snippet.category,
      codeLength: snippet.code.length
    });

    // ✅ Save snippet
    const savedSnippet = await snippet.save();
    
    console.log('✅ Snippet saved successfully with ID:', savedSnippet._id);

    // ✅ Trigger AI analysis in background (optional, don't block response)
    processSnippetWithAI(savedSnippet._id).catch(err => 
      console.error('Background AI processing failed:', err)
    );
    
    // ✅ Populate owner for response
    await savedSnippet.populate('owner', 'name email');

    res.status(201).json({
      message: 'Snippet created successfully',
      snippet: savedSnippet
    });

  } catch (error) {
    console.error('❌ Create snippet error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // ✅ Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // ✅ Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate entry',
        error: 'A snippet with similar data already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create snippet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ✅ Background AI processing function (optional)
async function processSnippetWithAI(snippetId) {
  try {
    console.log(`🤖 Starting AI processing for snippet ${snippetId}...`);
    
    // TODO: Add your AI processing logic here
    // Example:
    // const snippet = await Snippet.findById(snippetId);
    // const aiAnalysis = await aiService.analyze(snippet.code);
    // snippet.aiMetadata = aiAnalysis;
    // snippet.needsAnalysis = false;
    // await snippet.save();
    
    console.log(`✅ AI processing completed for snippet ${snippetId}`);
  } catch (error) {
    console.error(`❌ AI processing failed for snippet ${snippetId}:`, error);
  }
}

/* ==================== GET ALL SNIPPETS (WITH FILTERS) ==================== */
module.exports.getSnippets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      programmingLanguage,
      tags,
      frameworks,
      topics,
      visibility,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      owner
    } = req.query;

    const query = {};
    if (owner) {
      if (owner === req.user._id.toString()) {
        query.owner = req.user._id;
      } else {
        query.visibility = 'public';
        query.owner = owner;
      }
    } else {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'unlisted' },
        { owner: req.user._id }
      ];
    }

    if (programmingLanguage) query.programmingLanguage = programmingLanguage;
    if (visibility) query.visibility = visibility;
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
    if (search) {
      query.$text = { $search: search };
    }
    if (req.query.archived !== 'true') {
      query.isArchived = false;
    }

    const sortObj = {};
    if (sortBy === 'popularity') {
      sortObj.stars = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'views') {
      sortObj['stats.views'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    const finalSort = { pinned: -1, ...sortObj };
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
// controllers/snippetController.js

/* ==================== GET SINGLE SNIPPET ==================== */
module.exports.getSnippetById = async (req, res) => {
  try {
    console.log('📦 Fetching snippet:', req.params.id);
    console.log('👤 User ID:', req.user._id);
    
    // ✅ Find snippet WITHOUT populating first
    const snippet = await Snippet.findById(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    console.log('🔍 Snippet owner:', snippet.owner);
    console.log('🔍 Snippet visibility:', snippet.visibility);

    // ✅ Check access BEFORE populating (when owner is still an ObjectId)
    const hasAccess = snippet.canUserView(req.user._id);
    console.log('🔐 Access check:', hasAccess);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ NOW populate owner after access check
    await snippet.populate('owner', 'name email');

    // ✅ Increment views if not the owner
    if (snippet.owner._id.toString() !== req.user._id.toString()) {
      await snippet.incrementViews();
    }

    res.json({ snippet });
  } catch (error) {
    console.error('❌ Get snippet by ID error:', error);
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
module.exports.updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    if (snippet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own snippets' });
    }
    const updateFields = [
      'title',
      'content',
      'programmingLanguage',
      'summary',
      'tags',
      'frameworks',
      'topics',
      'libraries',
      'category',
      'domain',
      'complexity',
      'visibility',
      'attributes',
      'pinned',
      'notes'
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
module.exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
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
module.exports.copySnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    if (!snippet.canUserView(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
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
// controllers/snippetController.js

/* ==================== GET USER'S SNIPPETS ==================== */
module.exports.getMySnippets = async (req, res) => {
  try {
    console.log('👤 Fetching snippets for user:', req.user._id);
    
    const {
      page = 1,
      limit = 20,
      archived = 'false',
      pinned,
      language,  // ✅ Changed from programmingLanguage
      tags
    } = req.query;

    // ✅ Build query with correct field names
    const query = { owner: req.user._id };
    
    // ✅ REMOVED: isArchived check (field doesn't exist in your schema)
    // query.isArchived = archived === 'true';
    
    if (pinned !== undefined) query.pinned = pinned === 'true';
    if (language) query.language = language;  // ✅ Changed from programmingLanguage
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.toLowerCase().trim()) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Query:', JSON.stringify(query, null, 2));

    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('owner', 'name email')
        .lean(),
      Snippet.countDocuments(query)
    ]);

    console.log('✅ Found snippets:', snippets.length);
    console.log('📊 Total:', total);

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
    console.error('❌ Get my snippets error:', error);
    res.status(500).json({
      message: 'Failed to fetch your snippets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== ADVANCED SEARCH ==================== */
module.exports.searchSnippets = async (req, res) => {
  try {
    const {
      q: query = '',
      page = 1,
      limit = 20,
      sort = 'relevance',
      language,
      category,
      complexity,
      frameworks,
      tags,
      domain,
      minQuality,
      maxAge // in days
    } = req.query;

    // Build filters
    const filters = {
      $or: [
        { visibility: 'public' },
        { visibility: 'unlisted' },
        { owner: req.user._id }
      ]
    };
    
    if (language) filters.programmingLanguage = language;
    if (category) filters.category = category;
    if (complexity) filters.complexity = complexity;
    if (domain) filters.domain = domain;
    if (frameworks) {
      const frameworkArray = Array.isArray(frameworks) ? frameworks : frameworks.split(',');
      filters.frameworks = { $in: frameworkArray };
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filters.tags = { $all: tagArray };
    }
    if (minQuality) {
      filters['qualityMetrics.overall'] = { $gte: parseFloat(minQuality) };
    }
    if (maxAge) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - parseInt(maxAge));
      filters.createdAt = { $gte: maxDate };
    }
    if (query) {
      filters.$text = { $search: query };
    }

    // Build sort
    let sortObj = {};
    if (sort === 'relevance' && query) {
      sortObj = { score: { $meta: 'textScore' } };
    } else if (sort === 'popular') {
      sortObj = { 'stats.views': -1 };
    } else if (sort === 'recent') {
      sortObj = { createdAt: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const [snippets, total] = await Promise.all([
      Snippet.find(filters)
        .populate('owner', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Snippet.countDocuments(filters)
    ]);

    // Get facet data for filters
    const facets = await getSearchFacets(req.user._id);

    res.json({
      snippets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: (parseInt(page) * parseInt(limit)) < total,
        hasPrev: parseInt(page) > 1
      },
      facets, // For dynamic filter UI
      query: {
        search: query,
        filters,
        sort
      }
    });

  } catch (error) {
    console.error('Search snippets error:', error);
    res.status(500).json({
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== GET TRENDING SNIPPETS ==================== */
module.exports.getTrending = async (req, res) => {
  try {
    const {
      timeframe = '7d', // 24h, 7d, 30d
      limit = 20,
      category,
      language
    } = req.query;

    // Calculate date range
    const timeframes = {
      '24h': 1,
      '7d': 7,
      '30d': 30
    };
    
    const daysAgo = timeframes[timeframe] || 7;
    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - daysAgo);

    const matchQuery = {
      visibility: 'public',
      createdAt: { $gte: dateRange }
    };

    if (category) matchQuery.category = category;
    if (language) matchQuery.programmingLanguage = language;

    // Aggregation pipeline for trending calculation
    const trendingPipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $ifNull: ['$stats.views', 0] },
              { $multiply: [{ $ifNull: ['$stats.copied', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$stars', 0] }, 5] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $project: {
          title: 1,
          programmingLanguage: 1,
          category: 1,
          summary: 1,
          tags: 1,
          frameworks: 1,
          stats: 1,
          createdAt: 1,
          trendingScore: 1,
          'owner.name': 1,
          'owner.email': 1
        }
      }
    ];

    const trending = await Snippet.aggregate(trendingPipeline);

    res.json({
      trending,
      timeframe,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({
      message: 'Failed to get trending snippets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/* ==================== AI GENERATE DESCRIPTION ==================== */
// POST /api/snippets/ai/generate
module.exports.generateDescription = async (req, res) => {
  try {
    const { code, language, type = 'description' } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    let result;
    try {
      switch (type) {
        case 'description':
          result = await aiService.generateDescription(code, language);
          break;
        case 'summary':
          result = await aiService.generateSummary(code, language);
          break;
        case 'explanation':
          result = await aiService.generateExplanation(code, language);
          break;
        case 'tags':
          result = await aiService.extractTags(code, language);
          break;
        default:
          return res.status(400).json({ message: 'Invalid generation type' });
      }
    } catch (aiError) {
      // Fallback if AI service fails
      console.error('AI service error:', aiError);
      result = `This ${language || 'code'} snippet performs a specific operation.`;
    }

    res.json({
      result,
      type,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      message: 'AI generation failed',
      error: error.message
    });
  }
};

/* ==================== HELPER FUNCTIONS ==================== */

// Background AI processing
async function processSnippetWithAI(snippetId) {
  try {
    const snippet = await Snippet.findById(snippetId);
    if (!snippet || !snippet.needsAnalysis) return;

    console.log(`Processing snippet ${snippetId} with AI...`);

    // Parallel AI processing for speed
    const [
      aiMetadata,
      frameworks,
      libraries,
      codeAnalysis,
      qualityMetrics
    ] = await Promise.all([
      aiService.generateMetadata(snippet.content, snippet.programmingLanguage).catch(() => ({})),
      aiService.detectFrameworks(snippet.content, snippet.programmingLanguage).catch(() => []),
      aiService.detectLibraries(snippet.content, snippet.programmingLanguage).catch(() => []),
      aiService.analyzeCode(snippet.content, snippet.programmingLanguage).catch(() => ({})),
      aiService.assessQuality(snippet.content, snippet.programmingLanguage).catch(() => ({}))
    ]);

    // Update snippet with AI results
    await Snippet.findByIdAndUpdate(snippetId, {
      $set: {
        aiMetadata,
        frameworks: [...new Set([...snippet.frameworks, ...frameworks])],
        libraries: [...new Set([...snippet.libraries, ...libraries])],
        codeAnalysis,
        qualityMetrics,
        needsAnalysis: false,
        lastAnalyzed: new Date()
      }
    });

    console.log(`✅ AI processing complete for snippet ${snippetId}`);

  } catch (error) {
    console.error(`❌ AI processing failed for snippet ${snippetId}:`, error);
    
    // Mark as failed but don't crash
    await Snippet.findByIdAndUpdate(snippetId, {
      $set: {
        needsAnalysis: false,
        lastAnalyzed: new Date()
      }
    }).catch(err => console.error('Failed to update snippet status:', err));
  }
}

// Get search facets for dynamic filtering
async function getSearchFacets(userId) {
  const baseQuery = {
    $or: [
      { visibility: 'public' },
      { visibility: 'unlisted' },
      { owner: userId }
    ]
  };

  try {
    const facetPipeline = [
      { $match: baseQuery },
      {
        $facet: {
          languages: [
            { $group: { _id: '$programmingLanguage', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          complexity: [
            { $group: { _id: '$complexity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          frameworks: [
            { $unwind: '$frameworks' },
            { $group: { _id: '$frameworks', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 30 }
          ],
          domains: [
            { $group: { _id: '$domain', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ];

    const [facetResults] = await Snippet.aggregate(facetPipeline);
    return facetResults || {};
  } catch (error) {
    console.error('Get search facets error:', error);
    return {};
  }
}
