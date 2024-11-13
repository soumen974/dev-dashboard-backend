const XLSX = require('xlsx');
const Timetable = require('../models/Timetable');

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
            if (cellValue && typeof cellValue === 'string') {
              rowData[header] = cellValue.trim();
            } else {
              rowData[header] = '';
            }
          });
          return rowData;
        })
        .filter(row => {
          return Object.entries(row).some(([key, value]) => {
            return key !== 'TIME' && value && value.length > 0 && value !== 'LUNCH';
          });
        });

      const newTimetable = new Timetable({
        filePath: req.file.path,
        data: formattedData,
        headers: headers,
        userId: req.devs.id
      });

      await newTimetable.save();

      res.status(200).json({ 
        success: true,
        message: 'Timetable uploaded successfully',
        data: {
          headers: headers,
          rows: formattedData
        }
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
  },
  uploadToGoogleCalendar: async (req, res) => {
    try {
      const timetable = await Timetable.findOne({ userId: req.devs.id })
        .sort({ createdAt: -1 });

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'No timetable found'
        });
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: req.cookies.calendar_access_token
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const events = timetable.data.map(row => {
        const [hours, minutes] = row.TIME.split(':');
        const startTime = new Date();
        startTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1); // Assuming 1-hour classes

        return {
          summary: row[req.body.day], // e.g., "DWDM"
          description: 'Class Schedule',
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          recurrence: ['RRULE:FREQ=WEEKLY']
        };
      });

      const results = await Promise.all(
        events.map(event => calendar.events.insert({
          calendarId: 'primary',
          resource: event
        }))
      );

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
  }
};

module.exports = timetableController;
