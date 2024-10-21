// models/devs.js
const mongoose = require('mongoose');

const devsSchema = new mongoose.Schema({
  username: { type: String, required: true,unique: true },
  name: { type: String ,sparse :true},
  email: { type: String, required: true, unique: true },
  password: { type: String},
  security_question: { type: String,sparse: true},
  security_answer: { type: String,sparse: true },
  total_storageUsage: { type: Number, default: 0 },
}, { timestamps: true });

const Devs = mongoose.model('Devs', devsSchema);
module.exports = Devs;















