// models/devs.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId: String,
    title: String,
    description: String,
    time: Date,
    googleEventId: String,
  });

  const Reminder = mongoose.model('Reminder', reminderSchema);
  module.exports = Reminder;















