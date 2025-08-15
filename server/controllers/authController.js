// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../Models/User.js");
const sendEmail = require("../services/mailer");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: sign JWT
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

/* --------------------------- REGISTER USER --------------------------- */
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !password || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const emailLower = email.toLowerCase();
    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const user = await User.create({
      name,
      email: emailLower,
      passwordHash: hash,
      verification: {
        verified: false,
        token,
        sentAt: new Date(),
        expiresAt,
      },
    });

    const verifyURL = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Confirm your account",
      html: `<p>Hello ${user.name}, click <a href="${verifyURL}">here</a> to verify.</p>`,
    });

    console.log("Verification token:", token);

    res
      .status(201)
      .json({ message: "Account created. Check your inbox to verify." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------- VERIFY EMAIL --------------------------- */
module.exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({ "verification.token": token });

    if (!user || user.verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.verification.verified = true;
    user.verification.token = undefined;
    user.verification.expiresAt = undefined;
    await user.save();

    const jwtToken = signToken(user); // Pass user, not user._id
    res.status(200).json({
      message: "Verified & logged in",
      token: jwtToken,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------- LOGIN --------------------------- */
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailLower = email.toLowerCase();
    console.log(`email: ${emailLower}`);
    console.log(`password: ${password}`);

    const user = await User.findOne({ email: emailLower });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // if (!user.verification?.verified) {
    //   return res.status(403).json({ message: "Please verify your email first" });
    // }

    const token = signToken(user);
    res.json({ token });
    console.log("JWT:", token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------- GOOGLE AUTH --------------------------- */
module.exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    const emailLower = email.toLowerCase();

    const user = await User.findOneAndUpdate(
      {
        $or: [
          { email: emailLower },
          {
            providers: {
              $elemMatch: { provider: "google", providerId: sub },
            },
          },
        ],
      },
      {
        name,
        email: emailLower,
        $addToSet: {
          providers: { provider: "google", providerId: sub, picture },
        },
        $set: { "verification.verified": true },
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

/* --------------------------- GET USER INFO --------------------------- */
module.exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --------------------------- SAVE PUBLIC KEY --------------------------- */
module.exports.savePublicKey = async (req, res) => {
  const { userId, publicKey } = req.body;

  if (!userId || !publicKey) {
    return res
      .status(400)
      .json({ message: "User ID and publicKey are required" });
  }

  try {
    const result = await User.updateOne(
      { _id: userId },
      { $set: { publicKey } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Public key saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
