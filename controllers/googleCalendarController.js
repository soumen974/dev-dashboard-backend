const { google } = require('googleapis');
const Dev = require('../models/devs'); 

const addEventToGoogleCalendar = async (req, res) => {
    try {
        const { eventname, eventdesc, startdate, enddate } = req.body;

        // Input validation
        if (!eventname || !eventdesc || !startdate || !enddate) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }

        const user = await Dev.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.BACKEND_API+'/auth/google/callback'
        );

        oauth2Client.setCredentials({
            access_token: req.cookies.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        const tokens = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(tokens.credentials);

        const calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client,
        });

        // Convert dates to ISO strings and specify time zone
        const event = {
            summary: eventname,
            description: eventdesc,
            start: {
                dateTime: new Date(startdate).toISOString(), // ISO format for accurate parsing
                timeZone: 'Asia/Kolkata', // Set this to your preferred time zone or user-specific time zone
            },
            end: {
                dateTime: new Date(enddate).toISOString(), // ISO format for accurate parsing
                timeZone: 'Asia/Kolkata', // Set this to your preferred time zone or user-specific time zone
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        return res.status(200).json({
            message: 'Event added to Google Calendar successfully!',
            eventId: response.data.id,
        });
    } catch (error) {
        console.error('Error adding event to Google Calendar:', error);
        res.status(500).json({ error: true, message: 'Failed to add event' });
    }
};



module.exports = { addEventToGoogleCalendar };