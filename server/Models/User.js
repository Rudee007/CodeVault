// server/models/User.js
import mongoose from 'mongoose';

/* ---------- sub-schema for social-login providers ---------- */
const providerSubSchema = new mongoose.Schema(
  {
    provider:    { type: String, required: true, lowercase: true }, // e.g. "google"
    providerId:  { type: String, required: true },                  // Google "sub" claim
    picture:     String,
    accessToken: String,
    refreshToken:String
  },
  { _id: false }                                                    // no separate _id per item
);

/* ---------- main user schema ---------- */
const userSchema = new mongoose.Schema(
  {
    /* core identity */
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },

    /* e-mail verification for local sign-ups */
    verification: {
      verified:  { type: Boolean, default: false },
      token:     String,
      sentAt:    Date,
      expiresAt: Date
    },

    /* password hash for local auth */
    passwordHash: String,

    /* array of linked social accounts (Google, GitHub, etc.) */
    providers: [providerSubSchema],

    /* misc metadata */
    role:        { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLoginAt: Date
  },
  { timestamps: true }   // adds createdAt & updatedAt automatically
);

/* ---------- model export ---------- */
const User = mongoose.model('User', userSchema);
export default User;       // ES-module default export
