// routes/authRoutes.js  (CommonJS version)
const express = require('express');
const {
  register,
  verifyEmail,
  login,
  googleAuth,
  getUserInfo,
  verifyVaultPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup',  register);
router.get ('/verify',  verifyEmail);
router.post('/login',   login);
router.post('/google',  googleAuth);
router.get('/user-info',authMiddleware, getUserInfo);
router.post('/verify-vault-password', authMiddleware, verifyVaultPassword); // ✅ NEW

module.exports = router;
