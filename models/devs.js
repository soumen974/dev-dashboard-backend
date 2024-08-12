// models/devs.js
const mongoose = require('mongoose');

const devsSchema = new mongoose.Schema({
  username: { type: String, required: true,unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  security_question: { type: String},
  security_answer: { type: String },
});

const Devs = mongoose.model('Devs', devsSchema);
module.exports = Devs;















