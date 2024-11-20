const XLSX = require('xlsx');
const { google } = require('googleapis');
const Timetable = require('../models/timeTable');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_API}/google/calendar/callback`;

const convertTimeFormat = (timeRange) => {
  const startTime = timeRange.split('-')[0];
  const [time, period] = startTime.match(/(\d+:\d+)([ap]m)/i).slice(1);
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  if (period.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  }
  if (period.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const createCalendarEvents = async (timetableData, cookies, startDate, endDate) => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: cookies.calendar_access_token,
    refresh_token: cookies.calendar_refresh_token
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const untilDate = end.toISOString().split('T')[0].replace(/-/g, '');
  
  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const weekDayMap = {
    'MONDAY': 'MO',
    'TUESDAY': 'TU', 
    'WEDNESDAY': 'WE',
    'THURSDAY': 'TH',
    'FRIDAY': 'FR',
    'SATURDAY': 'SA'
  };

  const events = [];
  console.log('Processing timetable data:', timetableData);

  for (const entry of timetableData) {
    try {
      const standardTime = convertTimeFormat(entry.TIME);
      const [hours, minutes] = standardTime.split(':').map(Number);
      
      for (const day of weekDays) {
        if (entry[day] && entry[day].trim() && entry[day] !== 'LUNCH') {
          console.log(`Creating event for ${day} at ${standardTime}: ${entry[day]}`);
          
          const eventStart = new Date(start);
          eventStart.setHours(hours, minutes, 0);
          
          const targetDay = weekDays.indexOf(day);
          const currentDay = eventStart.getDay();
          const daysToAdd = (targetDay + 7 - currentDay) % 7;
          eventStart.setDate(eventStart.getDate() + daysToAdd);

          const eventEnd = new Date(eventStart);
          eventEnd.setHours(eventStart.getHours() + 1);

          const event = {
            summary: entry[day],
            location: 'Classroom',
            description: `${entry[day]} - ${day}`,
            start: {
              dateTime: eventStart.toISOString(),
              timeZone: 'Asia/Kolkata'
            },
            end: {
              dateTime: eventEnd.toISOString(),
              timeZone: 'Asia/Kolkata'
            },
            recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${untilDate};BYDAY=${weekDayMap[day]}`],
            reminders: {
              useDefault: false,
              overrides: [{ method: 'popup', minutes: 10 }]
            }
          };
          
          events.push(event);
        }
      }
    } catch (error) {
      console.log(`Skipping entry due to time conversion error: ${entry.TIME}`);
    }
  }

  const results = [];
  for (const event of events) {
    try {
      const result = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to create calendar event:', error.message);
    }
  }

  return results;
};

const timetableController = {
  uploadTimetable: async (req, res) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token missing'
        });
      }

      const userData = jwt.verify(token, process.env.SECRET_KEY);
      const username = userData.username;
      const { calendar_email } = req.cookies;
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);

      const existingTimetable = await Timetable.findOne({ 
        username, 
        calendarEmail: calendar_email 
      });

      if (existingTimetable) {
        return res.status(200).json({
          success: true,
          message: 'Timetable already exists for this user',
          data: {
            headers: existingTimetable.headers,
            rows: existingTimetable.data
          }
        });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = ['TIME', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const formattedData = rawData.slice(1)
        .map(row => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] ? row[index].toString().trim() : '';
          });
          return rowData;
        })
        .filter(row => row.TIME && Object.values(row).some(val => val && val !== 'LUNCH'));

      const newTimetable = new Timetable({
        filePath: req.file.path,
        data: formattedData,
        headers,
        userId: req.devs.id,
        username,
        calendarEmail: calendar_email,
        startDate,
        endDate,
        startMonth: startDate.getMonth().toString(),
        endMonth: endDate.getMonth().toString()
      });

      await newTimetable.save();

      let calendarResults = [];
      if (req.cookies.calendar_access_token) {
        calendarResults = await createCalendarEvents(
          formattedData, 
          req.cookies,
          startDate,
          endDate
        );
      }

      res.status(201).json({
        success: true,
        message: `Timetable uploaded successfully with ${calendarResults.length} calendar events created`,
        data: {
          headers,
          rows: formattedData,
          calendarEvents: calendarResults.length
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading timetable',
        error: error.message
      });
    }
  },

  getTimetableData: async (req, res) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      const userData = jwt.verify(token, process.env.SECRET_KEY);
      const username = userData.username;
      const { calendar_email } = req.cookies;
  
      // Get the latest timetable entry for this user
      const timetable = await Timetable.findOne({ 
        username,
        calendarEmail: calendar_email 
      }).sort({ createdAt: -1 });
  
      if (!timetable) {
        return res.status(200).json({
          success: true,
          headers: [],
          timetableData: []
        });
      }
  
      const processedData = timetable.data.map(entry => ({
        ...entry,
        TIME: entry.TIME
      }));
  
      res.status(200).json({
        success: true,
        headers: timetable.headers,
        timetableData: processedData,
        startDate: timetable.startDate,
        endDate: timetable.endDate
      });
    } catch (error) {
      console.log('Detailed error:', error);
      res.status(200).json({
        success: true,
        headers: [],
        timetableData: [],
        error: error.message
      });
    }
  }
  };

module.exports = timetableController;
