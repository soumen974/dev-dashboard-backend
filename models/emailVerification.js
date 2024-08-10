// models/email_verification.js
const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  created_at: { type: Date, default: Date.now, expires: 3600 }, // expires in 1 hour
  expires_at: { type: Date, required: true },
});

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);
module.exports = EmailVerification;
