const mongoose = require('mongoose');

const devSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  security_question: { type: String, required: false },
  security_answer: { type: String, required: false },
});

// Ensure that the model is created from the schema
const devs = mongoose.model('devs', devSchema);

module.exports = devs;
