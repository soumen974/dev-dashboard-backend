const mongoose = require('mongoose');

const devSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  security_question: { type: String, required: true },
  security_answer: { type: String, required: true },
});

const Dev = mongoose.model('Dev', devSchema);

module.exports = Dev;
