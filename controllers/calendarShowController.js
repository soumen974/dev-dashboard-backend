const { google } = require('googleapis');
const Dev = require('../models/devs');

const showUserCalendar = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.googleRefreshToken) {
            return res.status(400).json({ error: 'User not authenticated or no refresh token found' });
        }

        // Extract the access token from cookies
        const accessToken = req.cookies.googleAccessToken;

        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.BACKEND_API}/auth/google/callback`
        );

        // Set the initial credentials
        if (accessToken) {
            oAuth2Client.setCredentials({ access_token: accessToken });
        } else {
            oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
        }

        // Refresh the access token if needed
        oAuth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                // Save the new refresh token if provided (it may not always be)
                user.googleRefreshToken = tokens.refresh_token;
                await user.save();
            }
            // Save the new access token in the cookies
            res.cookie('googleAccessToken', tokens.access_token, {
                httpOnly: true,
                secure: true, // Set to true if using HTTPS
            });
        });

        // Verify the access token and refresh it if expired
        try {
            // Test the current credentials by making the API request
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
            // If the access token is invalid or expired, try to refresh the token
            if (error.response && error.response.status === 401) {
                try {
                    // Manually refresh the access token
                    const tokens = await oAuth2Client.getAccessToken();
                    oAuth2Client.setCredentials(tokens);

                    // Retry the calendar API request with the new access token
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
                } catch (refreshError) {
                    console.error('Error refreshing access token:', refreshError);
                    res.status(500).json({ error: 'Error refreshing access token' });
                }
            } else {
                throw error; // Re-throw if it's a different error
            }
        }
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Error fetching calendar events' });
    }
};

module.exports = { showUserCalendar };
