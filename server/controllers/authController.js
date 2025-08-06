// controllers/authController.js  ── CommonJS
const bcrypt          = require('bcryptjs');
const jwt             = require('jsonwebtoken');
const crypto          = require('crypto');
const { OAuth2Client }= require('google-auth-library');

const User            = require('../Models/User.js');      // ← adjust path if needed
const sendEmail       = require('../services/mailer');  // nodemailer helper
const generateToken   = require('../utils/generateToken');

const JWT_SECRET       = process.env.JWT_SECRET;
const JWT_EXPIRES_IN   = '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient     = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ─────────────────── helpers ─────────────────── */
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/* ═════════════════ 1. MANUAL SIGN-UP ═════════════════ */
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  /* A. validate */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !password || !emailRegex.test(email))
    return res.status(400).json({ message: 'Invalid input' });

  try {
    /* B. dedupe */
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    /* C. create */
    const hash      = await bcrypt.hash(password, 12);
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1_000;   // 24 h

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      verification: {
        verified: false,
        token,
        sentAt: new Date(),
        expiresAt
      }
    });

    /* D. send verification mail */
    const verifyURL = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Confirm your account',
      html: `<p>Hello ${user.name}, click <a href="${verifyURL}">here</a> to verify.</p>`
    });

    res.status(201).json({ message: 'Account created. Check your inbox to verify.' });
  } catch (err) {
    
    res.status(500).json({ message: err.message });
  }
};

/* ═════════════════ 2. VERIFY LINK ═════════════════ */
module.exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ 'verification.token': token });

    if (!user || user.verification.expiresAt < Date.now())
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.verification = { verified: true };   // clears token/expiry
    await user.save();

    /* auto-login */
    const jwtToken = signToken(user);
    res.cookie('token', jwtToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1_000 });
    res.json({ message: 'Verified & logged in', token: jwtToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════════════ 3. MANUAL LOGIN ═════════════════ */
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (
      !user ||
      !user.verification.verified ||
      !(await bcrypt.compare(password, user.passwordHash))
    )
      return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════════════ 4. GOOGLE OAUTH CALLBACK ═════════════════ */
module.exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;   // Google ID-token from front-end
    const ticket   = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload  = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    /* upsert */
    const user = await User.findOneAndUpdate(
      {
        $or: [
          { email: email.toLowerCase() },
          { providers: { $elemMatch: { provider: 'google', providerId: sub } } }
        ]
      },
      {
        name,
        email: email.toLowerCase(),
        $addToSet: { providers: { provider: 'google', providerId: sub, picture } },
        verification: { verified: true }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════════════ 5. GET USER INFO ═════════════════ */
module.exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════════════ 6. SAVE PUBLIC KEY ═════════════════ */
module.exports.savePublicKey = async (req, res) => {
  const { userId, publicKey } = req.body;
  if (!userId || !publicKey)
    return res.status(400).json({ message: 'User ID and publicKey are required' });
  try {
    await User.updateOne(
      { _id: userId },
      { $set: { publicKey } },
      { upsert: true }
    );
    res.json({ message: 'Public key saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
