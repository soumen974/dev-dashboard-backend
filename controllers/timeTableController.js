const XLSX = require('xlsx');
const { google } = require('googleapis');
const Timetable = require('../models/Timetable');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_API}/google/calendar/callback`;

const createCalendarEvents = async (timetableData, cookies) => {
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
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7);

  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const events = [];

  for (const entry of timetableData) {
    for (const day of weekDays) {
      if (entry[day] && entry[day].length > 0 && entry[day] !== 'LUNCH') {
        const [hours, minutes] = entry.TIME.split(':');
        const startDate = new Date(nextMonday);
        startDate.setDate(nextMonday.getDate() + weekDays.indexOf(day));
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        events.push({
          summary: entry[day],
          description: `Class Schedule - ${entry[day]}`,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          recurrence: ['RRULE:FREQ=WEEKLY;COUNT=16'],
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 10 }]
          }
        });
      }
    }
  }

  return Promise.all(
    events.map(event =>
      calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })
    )
  );
};

const timetableController = {
  uploadTimetable: async (req, res) => {
    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = ['TIME', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dataRows = rawData.slice(1);

      const formattedData = dataRows
        .map(row => {
          const rowData = {};
          headers.forEach((header, index) => {
            const cellValue = row[index];
            rowData[header] = cellValue && typeof cellValue === 'string' ? cellValue.trim() : '';
          });
          return rowData;
        })
        .filter(row => Object.entries(row).some(([key, value]) => 
          key !== 'TIME' && value && value.length > 0 && value !== 'LUNCH'
        ));

      const newTimetable = new Timetable({
        filePath: req.file.path,
        data: formattedData,
        headers: headers,
        userId: req.devs.id
      });

      await newTimetable.save();

      if (req.cookies.calendar_access_token) {
        await createCalendarEvents(formattedData, req.cookies);
      }

      res.status(200).json({
        success: true,
        message: 'Timetable uploaded successfully and synced with Google Calendar',
        data: { headers, rows: formattedData }
      });
    } catch (error) {
      console.log('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading timetable',
        error: error.message
      });
    }
  },

  syncWithGoogleCalendar: async (req, res) => {
    try {
      const timetable = await Timetable.findOne({ userId: req.devs.id })
        .sort({ createdAt: -1 });

      if (!timetable || !timetable.data) {
        return res.status(404).json({
          success: false,
          message: 'No timetable data found'
        });
      }

      const results = await createCalendarEvents(timetable.data, req.cookies);

      res.status(200).json({
        success: true,
        message: 'Timetable synced with Google Calendar',
        events: results.map(r => r.data)
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync with Google Calendar',
        error: error.message
      });
    }
  },

  getTimetableData: async (req, res) => {
    try {
      const timetable = await Timetable.findOne({ userId: req.devs.id })
        .sort({ createdAt: -1 });

      if (!timetable) {
        return res.status(200).json({
          success: true,
          headers: [],
          timetableData: []
        });
      }

      res.status(200).json({
        success: true,
        headers: timetable.headers,
        timetableData: timetable.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching timetable data',
        error: error.message
      });
    }
  }
};

module.exports = timetableController;
