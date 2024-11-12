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
      console.log('Authentication token missing');
      return res.status(401).json({
        message: 'Authentication token missing',
        error: 'TOKEN_MISSING'
      });
    }

    let userData;
    try {
      userData = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      console.log('Token verification failed:', error);
      return res.status(401).json({
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
    }

    const username = userData.username;
    console.log('Authenticated user:', username);

    const { calendar_access_token, calendar_refresh_token, calendar_email } = req.cookies;
    const { eventname, eventdesc = "", startdate, enddate } = req.body;

    console.log('Request body:', {
      eventname,
      eventdesc,
      startdate,
      enddate
    });


    if (!calendar_access_token || !calendar_refresh_token || !calendar_email) {
      console.log('Missing calendar credentials');
      return res.status(400).json({
        message: 'Google Calendar not connected',
        error: 'CALENDAR_NOT_CONNECTED'
      });
    }


    if (!eventname || !startdate || !enddate) {
      console.log('Missing required fields');
      return res.status(400).json({
        message: 'Missing required event fields',
        error: 'MISSING_FIELDS'
      });
    }


    const startDateTime = new Date(startdate);
    const endDateTime = new Date(enddate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.log('Invalid date format received:', { startdate, enddate });
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

    console.log('Attempting to create calendar event:', event);

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Calendar event created successfully:', calendarResponse.data.id);


    try {
      const reminder = new Reminder({
        username,
        calendarEmail: calendar_email,
        eventname,
        eventdesc,
        startdate: startDateTime,
        enddate: endDateTime,
        calendarId: calendarResponse.data.id,
      });

      console.log('Attempting to save reminder to database:', reminder);

      const savedReminder = await reminder.save();
      console.log('Reminder saved successfully:', savedReminder._id);

      res.status(201).json({
        message: 'Event added successfully',
        event: {
          id: calendarResponse.data.id,
          summary: eventname,
          description: eventdesc,
          startTime: startDateTime,
          endTime: endDateTime,
          reminderId: savedReminder._id
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      

      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: calendarResponse.data.id
        });
        console.log('Rolled back calendar event due to database failure');
      } catch (rollbackError) {
        console.error('Failed to rollback calendar event:', rollbackError);
      }

      throw dbError;
    }

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

const updateEventInCalendarAndDb = async (req, res) => {
  try {
    // Verify authentication token
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing',
        error: 'TOKEN_MISSING'
      });
    }

    let userData = jwt.verify(token, process.env.SECRET_KEY);
    const username = userData.username;
    const eventId = req.params.eventId; 
    const existingReminder = await Reminder.findOne({ 
      calendarId: eventId,  
      username 
    });

    if (!existingReminder) {
      return res.status(404).json({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND'
      });
    }


    const { reminderId } = req.params;
    const { eventname, eventdesc = "", startdate, enddate } = req.body;
    const { calendar_access_token, calendar_refresh_token, calendar_email } = req.cookies;

    // Validate required fields
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

    // Validate dates
    const startDateTime = new Date(startdate);
    const endDateTime = new Date(enddate);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format',
        error: 'INVALID_DATE'
      });
    }

    // // Find existing reminder
    // const existingReminder = await Reminder.findOne({ _id: reminderId, username });
    // if (!existingReminder) {
    //   return res.status(404).json({
    //     message: 'Reminder not found',
    //     error: 'REMINDER_NOT_FOUND'
    //   });
    // }

    // Setup Google Calendar client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_API}/google/calendar/callback`
    );

    oauth2Client.setCredentials({
      access_token: calendar_access_token,
      refresh_token: calendar_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Update event in Google Calendar
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

    const calendarResponse = await calendar.events.update({
      calendarId: 'primary',
      eventId: existingReminder.calendarId,
      resource: event,
    });

    // Update reminder in database
    existingReminder.eventname = eventname;
    existingReminder.eventdesc = eventdesc;
    existingReminder.startdate = startDateTime;
    existingReminder.enddate = endDateTime;

    const updatedReminder = await existingReminder.save();

    res.status(200).json({
      message: 'Event updated successfully',
      event: {
        id: calendarResponse.data.id,
        summary: eventname,
        description: eventdesc,
        startTime: startDateTime,
        endTime: endDateTime,
        reminderId: updatedReminder._id
      }
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to update event',
      error: error.error || 'INTERNAL_SERVER_ERROR'
    });
  }
};

const deleteEventFromCalendarAndDb = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing',
        error: 'TOKEN_MISSING'
      });
    }

    let userData = jwt.verify(token, process.env.SECRET_KEY);
    const username = userData.username;
    const eventId = req.params.eventId;

    // Find the reminder using calendarId instead of _id
    const existingReminder = await Reminder.findOne({ 
      calendarId: eventId,
      username 
    });

    if (!existingReminder) {
      return res.status(404).json({
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND'
      });
    }

    // Delete from Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_API}/google/calendar/callback`
    );

    oauth2Client.setCredentials({
      access_token: req.cookies.calendar_access_token,
      refresh_token: req.cookies.calendar_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });

    // Delete from database using calendarId
    await Reminder.deleteOne({ calendarId: eventId, username });

    res.status(200).json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to delete event',
      error: error.error || 'INTERNAL_SERVER_ERROR'
    });
  }
};


module.exports = {
  addEventToCalendarAndDb,
  updateEventInCalendarAndDb,
  deleteEventFromCalendarAndDb
};