const { google } = require('googleapis');
const Dev = require('../models/devs');
const showUserCalendar = async (req, res) => {
    try {
        const accessToken = req.cookies.googleAccessToken;
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.BACKEND_API}/auth/google/callback`
        );

        // Check and refresh tokens
        oAuth2Client.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items;
        res.status(200).json({ events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Error fetching calendar events' });
    }
};

module.exports = { showUserCalendar };
