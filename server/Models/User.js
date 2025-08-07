const mongoose = require('mongoose');

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

const userSchema = new mongoose.Schema(
  {
    /* core identity */
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },

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
module.exports =  User;       // ES-module default export
