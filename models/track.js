const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true 
  },
  github_id: { type: String },
  github_token: { type: String },
  codeforces_id: { type: String },
  codeforces_token: { type: String },
  codechef_id: { type: String },
  codechef_token: { type: String },
  hackerrank_id: { type: String },
  hackerrank_token: { type: String },
  leetcode_id: { type: String },
  leetcode_token: { type: String }
}, { timestamps: true });

const Track = mongoose.model('Track', trackSchema);
module.exports = Track;
