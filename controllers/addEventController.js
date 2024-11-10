const { google } = require('googleapis');
const Reminder = require('../models/reminderSchema');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_API}/google/calendar/callback`;

const addEventToCalendarAndDb = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing',
        error: 'TOKEN_MISSING'
      });
    }

    let userData;
    try {
      userData = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
    }

    const username = userData.username;
    console.log('Authenticated user:', username);

    const { calendar_access_token, calendar_refresh_token, calendar_email } = req.cookies;
    const { eventname, eventdesc = "", startdate, enddate } = req.body;

    if (!calendar_access_token || !calendar_refresh_token || !calendar_email) {
      return res.status(400).json({
        message: 'Google Calendar not connected',
        error: 'CALENDAR_NOT_CONNECTED'
      });
    }

    if (!eventname || !startdate || !enddate) {
      return res.status(400).json({
        message: 'Missing required event fields',
        error: 'MISSING_FIELDS'
      });
    }

    const startDateTime = new Date(startdate);
    const endDateTime = new Date(enddate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format',
        error: 'INVALID_DATE'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: calendar_access_token,
      refresh_token: calendar_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventname,
      description: eventdesc,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    const reminder = new Reminder({
      username,
      calendarEmail: calendar_email,
      eventname,
      eventdesc,
      startdate: startDateTime,
      enddate: endDateTime,
      calendarId: calendarResponse.data.id,
    });

    await reminder.save();

    res.status(201).json({
      message: 'Event added successfully',
      event: {
        id: calendarResponse.data.id,
        summary: eventname,
        description: eventdesc,
        startTime: startDateTime,
        endTime: endDateTime
      }
    });

  } catch (error) {
    console.error('Error adding event:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    res.status(error.status || 500).json({
      message: error.message || 'Failed to add event',
      error: error.error || 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = { addEventToCalendarAndDb };