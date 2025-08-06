// routes/authRoutes.js  (CommonJS version)
const express = require('express');
const {
  register,
  verifyEmail,
  login,
  googleAuth
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup',  register);
router.get ('/verify',  verifyEmail);
router.post('/login',   login);
router.post('/google',  googleAuth);

module.exports = router;
