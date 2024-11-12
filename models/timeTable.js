const mongoose = require('mongoose');

const timeTableSchema = new mongoose.Schema({
    username:  String, 
    eventname: String,
    startdate: Date,   
    enddate:   Date,
});

const TimeTable = mongoose.model('TimeTable', timeTableSchema);
module.exports = TimeTable;
