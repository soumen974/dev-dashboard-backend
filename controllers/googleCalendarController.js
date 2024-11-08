const { google } = require('googleapis');
const Dev = require('../models/devs');
const Reminder = require('../models/reminderSchema');
const jwt = require('jsonwebtoken');

// Helper function to validate date strings
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// Helper function to setup OAuth client
const setupOAuthClient = (accessToken, refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_API}/auth/google/callback`
    );
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    return oauth2Client;
};

// Helper function to insert event into Google Calendar
const insertEvent = async (calendar, event) => {
    return await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    });
};

const addEventToGoogleCalendar = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { eventname, eventdesc, startdate, enddate } = req.body;

        // Enhanced input validation
        if (!eventname || !eventdesc || !startdate || !enddate) {
            console.log('Missing required fields:', { eventname, eventdesc, startdate, enddate });
            return res.status(400).json({
                error: true,
                message: 'All fields are required',
                missing: Object.entries({ eventname, eventdesc, startdate, enddate })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key),
            });
        }

        // Validate date formats
        if (!isValidDate(startdate) || !isValidDate(enddate)) {
            console.log('Invalid date format:', { startdate, enddate });
            return res.status(400).json({
                error: true,
                message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
            });
        }

        // Check if end date is after start date
        if (new Date(enddate) <= new Date(startdate)) {
            return res.status(400).json({ error: true, message: 'End date must be after start date' });
        }

        // Verify user exists and has necessary tokens
        const user = await Dev.findById(req.devs.id); // Updated req.user.id to req.devs.id
        if (!user) {
            console.log('User not found:', req.devs.id);
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // Check for required tokens
        let accessToken = req.cookies.google_access_token;
        const refreshToken = req.cookies.google_refresh_token;

        if (!accessToken || !refreshToken) {
            console.log('Missing tokens:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
            return res.status(401).json({
                error: true,
                message: 'Google Calendar authentication tokens missing',
            });
        }

        const oauth2Client = setupOAuthClient(accessToken, refreshToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Prepare event data
        const event = {
            summary: eventname,
            description: eventdesc,
            start: { dateTime: new Date(startdate).toISOString(), timeZone: 'Asia/Kolkata' },
            end: { dateTime: new Date(enddate).toISOString(), timeZone: 'Asia/Kolkata' },
            reminders: { useDefault: true },
        };

        try {
            console.log('Attempting to insert event:', event);
            const response = await insertEvent(calendar, event);
            const eventId = response.data.id;

            console.log('Event created successfully:', eventId);

            // Save to MongoDB
            const reminder = new Reminder({
                username: user.username,
                eventname,
                eventdesc,
                startdate,
                enddate,
                calendarId: eventId,
            });
            await reminder.save();
            console.log('Reminder saved to database:', reminder._id);

            return res.status(200).json({
                message: 'Event added successfully',
                eventId: eventId,
                reminderDbId: reminder._id,
            });
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('Token expired, attempting refresh');
                try {
                    const tokenResponse = await oauth2Client.refreshAccessToken();
                    accessToken = tokenResponse.credentials.access_token;

                    // Update cookie
                    res.cookie('google_access_token', accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'None',
                        maxAge: 5 * 24 * 60 * 60 * 1000,
                    });

                    // Retry with new token
                    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
                    const response = await insertEvent(calendar, event);

                    const eventId = response.data.id;

                    // Save to MongoDB
                    const reminder = new Reminder({
                        username: user.username,
                        eventname,
                        eventdesc,
                        startdate,
                        enddate,
                        calendarId: eventId,
                    });
                    await reminder.save();

                    return res.status(200).json({
                        message: 'Event added successfully after token refresh',
                        eventId: eventId,
                        reminderDbId: reminder._id,
                    });
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    return res.status(401).json({
                        error: true,
                        message: 'Failed to refresh authentication. Please re-authenticate.',
                        details: refreshError.message,
                    });
                }
            }

            console.error('Calendar API error:', error);
            return res.status(500).json({
                error: true,
                message: 'Failed to add event to calendar',
                details: error.message,
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error',
            details: error.message,
        });
    }
};

module.exports = { addEventToGoogleCalendar };
