// models/devs.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  username:  String, 
  eventname: String,
  eventdesc: String, 
  startdate: Date,   
  enddate:   Date,
  calendarId: String,
  });

  const Reminder = mongoose.model('Reminder', reminderSchema);
  module.exports = Reminder;
