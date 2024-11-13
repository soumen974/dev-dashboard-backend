const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  headers: {
    type: Array,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dev',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);
