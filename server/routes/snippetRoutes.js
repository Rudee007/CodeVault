const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const snippetController = require('../controllers/snippetController');

// Apply auth middleware to all routes
router.use(authMiddleware);

/* ==================== SNIPPET ROUTES ==================== */

// GET /api/snippets - Get all snippets with filters and pagination
router.get('/', snippetController.getSnippets);

// GET /api/snippets/user/me - Get current user's snippets
router.get('/user/me', snippetController.getMySnippets);

// POST /api/snippets - Create a new snippet
router.post('/', snippetController.createSnippet);

// GET /api/snippets/:id - Get single snippet by ID
router.get('/:id', snippetController.getSnippetById);

// PUT /api/snippets/:id - Update snippet by ID
router.put('/:id', snippetController.updateSnippet);

// DELETE /api/snippets/:id - Delete snippet by ID
router.delete('/:id', snippetController.deleteSnippet);

// POST /api/snippets/:id/copy - Increment copy counter
router.post('/:id/copy', snippetController.copySnippet);

module.exports = router;
