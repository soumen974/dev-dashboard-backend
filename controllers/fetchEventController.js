const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_API}/google/calendar/callback`
);

const fetchCalendarEvents = async (req, res) => {
  try {
    // Check if calendar credentials exist in cookies
    const { calendar_access_token, calendar_refresh_token } = req.cookies;

    if (!calendar_access_token || !calendar_refresh_token) {
      return res.status(401).json({
        message: 'Calendar credentials not found',
        error: 'CREDENTIALS_MISSING'
      });
    }

    // Set credentials and handle token refresh
    oauth2Client.setCredentials({
      access_token: calendar_access_token,
      refresh_token: calendar_refresh_token,
    });

    // Add token refresh handler
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Store the new refresh token
        res.cookie('calendar_refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None',
        });
      }
      // Store the new access token
      res.cookie('calendar_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      });
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get current date at start of day
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];

    // Transform events to include only necessary data
    const transformedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description || '',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      status: event.status,
      creator: event.creator.email,
    }));

    res.json({
      message: 'Events fetched successfully',
      events: transformedEvents
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);

    // Handle specific error types
    if (error.code === 401) {
      return res.status(401).json({
        message: 'Calendar authorization expired',
        error: 'AUTH_EXPIRED',
        details: 'Please reconnect your Google Calendar'
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        message: 'Calendar access denied',
        error: 'ACCESS_DENIED',
        details: 'Permission to access calendar was denied'
      });
    }

    // Default error response
    res.status(500).json({
      message: 'Error fetching events from Google Calendar',
      error: 'FETCH_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { fetchCalendarEvents };