const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    index: true
  },
  calendarEmail: { 
    type: String, 
    required: [true, 'Calendar email is required'],
    index: true
  },
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
  },
  startMonth: {
    type: String,
    required: true
  },
  endMonth: {
    type: String, 
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
});

module.exports = mongoose.model('Timetable', timetableSchema);
