const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  code: {
    type: String,
    required: true,
    maxlength: 6
  },
  expires_at: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 6 * 60 * 1000); 
    },
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }  // Automatically manage created_at
});

const email_verifications = mongoose.model('email_verifications', emailVerificationSchema);

module.exports = email_verifications;
