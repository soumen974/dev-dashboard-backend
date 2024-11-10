const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  eventname: {
    type: String, 
    required: [true, 'Event name is required']
  },
  eventdesc: { 
    type: String,
    default: ''
  },
  startdate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  enddate: {
    type: Date,
    required: [true, 'End date is required']
  },
  calendarId: {
    type: String,
    required: [true, 'Calendar ID is required'],
    unique: true
  }
});

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;