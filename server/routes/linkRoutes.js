// routes/linkRoutes.js
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const authMiddleware = require('../middleware/authMiddleware');

// PUBLIC ROUTES (no auth needed)
router.get('/share/:shareId', linkController.resolveShareLink);
router.get('/s/:customSlug', linkController.resolveBySlug);
router.post('/share/:shareId/copy', linkController.trackCopy);
router.post('/share/:shareId/download', linkController.trackDownload);

// PROTECTED ROUTES (auth required)
router.post('/snippets/:id/share', authMiddleware, linkController.createShareLink);
router.get('/user/links', authMiddleware, linkController.getUserLinks);
router.get('/links/:shareId/analytics', authMiddleware, linkController.getLinkAnalytics);
router.patch('/links/:shareId', linkController.updateLinkSettings);
router.delete('/links/:shareId', authMiddleware, linkController.deleteLink);
router.post('/links/:shareId/revoke', authMiddleware, linkController.revokeLink);
router.post('/links/:shareId/pause', authMiddleware, linkController.pauseLink);
router.post('/links/:shareId/resume', authMiddleware, linkController.resumeLink);

module.exports = router;
