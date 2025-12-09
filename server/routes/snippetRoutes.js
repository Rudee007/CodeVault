// routes/snippetRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const snippetController = require('../controllers/snippetController');
const linkController = require('../controllers/linkController');
// Apply auth middleware to all routes
router.use(authMiddleware);

/* ==================== SNIPPET CRUD ROUTES ==================== */

// GET /api/snippets - Get all snippets with filters and pagination
router.get('/', snippetController.getSnippets);

// GET /api/snippets/user/me - Get current user's snippets (MUST be before /:id)
router.get('/user/me', snippetController.getMySnippets);

// GET /api/snippets/search - Advanced search with facets (MUST be before /:id)
router.get('/search', snippetController.searchSnippets);

// GET /api/snippets/trending - Get trending snippets (MUST be before /:id)
router.get('/trending', snippetController.getTrending);

// POST /api/snippets/ai/generate - AI generate description/summary/tags
router.post('/ai/generate', snippetController.generateDescription);

// POST /api/snippets - Create a new snippet
router.post('/', snippetController.createSnippet);
router.post('/:id/share', linkController.createShareLink);

// GET /api/snippets/:id - Get single snippet by ID
router.get('/:id', snippetController.getSnippetById);

// PUT /api/snippets/:id - Update snippet by ID
router.put('/:id', snippetController.updateSnippet);

// DELETE /api/snippets/:id - Delete snippet by ID
router.delete('/:id', snippetController.deleteSnippet);

// POST /api/snippets/:id/copy - Increment copy counter
router.post('/:id/copy', snippetController.copySnippet);

module.exports = router;
