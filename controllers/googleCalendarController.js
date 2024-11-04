// controllers/calendarController.js
const { google } = require('googleapis');
const Dev = require('../models/devs');
const Reminder = require('../models/reminderSchema'); // Import the Reminder model
const jwt = require('jsonwebtoken');

const addEventToGoogleCalendar = async (req, res) => {
    try {
        const { eventname, eventdesc, startdate, enddate } = req.body;

        // Check if all required fields are provided
        if (!eventname || !eventdesc || !startdate || !enddate) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }

        // Find the user
        const user = await Dev.findById(req.devs.id);
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // OAuth client setup
        let accessToken = req.cookies.googleAccessToken;
        const refreshToken = req.cookies.googleRefreshToken;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.BACKEND_API}/auth/google/callback`
        );

        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        // Event data for Google Calendar
        const event = {
            summary: eventname,
            description: eventdesc,
            start: {
                dateTime: new Date(startdate).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: new Date(enddate).toISOString(),
                timeZone: 'Asia/Kolkata',
            },
        };

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Try inserting the event, refresh the token if access token expired
        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            const eventId = response.data.id;

            // Save event details in MongoDB
            const reminder = new Reminder({
                username: user.username,
                eventname,
                eventdesc,
                startdate,
                enddate,
                calendarId: eventId, // Store the Google Calendar event ID
            });

            await reminder.save();

            return res.status(200).json({
                message: 'Event added to Google Calendar and saved in database successfully!',
                eventId: eventId,
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Refresh access token if expired
                const tokenResponse = await oauth2Client.refreshAccessToken();
                accessToken = tokenResponse.credentials.access_token;

                // Set the new access token in cookies
                res.cookie('googleAccessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None',
                    maxAge: 5 * 24 * 60 * 60 * 1000,
                });

                oauth2Client.setCredentials({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                // Retry inserting the event with the refreshed token
                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });

                const eventId = response.data.id;

                // Save event details in MongoDB
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
                    message: 'Event added to Google Calendar and saved in database successfully!',
                    eventId: eventId,
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error adding event to Google Calendar:', error);
        res.status(500).json({ error: true, message: 'Failed to add event' });
    }
};

module.exports = { addEventToGoogleCalendar };
