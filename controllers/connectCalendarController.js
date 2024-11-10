const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_API}/google/calendar/callback` 
);

const log = {
  error: (message, error) => {
    console.error(`❌ ${message}`, error?.message || error);
  },
  success: (message) => {
    console.log(`✓ ${message}`);
  }
};

const connectToGoogleCalendar = (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
    });
    res.redirect(authUrl);
  } catch (error) {
    log.error('Google Calendar connection failed', error);
    res.status(500).json({ error: 'Failed to initiate Google Calendar connection' });
  }
};

const handleGoogleCalendarCallback = async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    log.error('Authorization failed', 'No auth code received');
    return res.redirect(`${process.env.FRONTEND}/dashboard/reminder?error=no_auth_code`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const calendarEmail = data.email;

    const cookieOptions = {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('calendar_access_token', tokens.access_token, {
      ...cookieOptions,
      httpOnly: true
    });
    
    res.cookie('calendar_refresh_token', tokens.refresh_token, {
      ...cookieOptions,
      httpOnly: true
    });
    
    res.cookie('calendar_email', calendarEmail, {
      ...cookieOptions
    });
    
    res.cookie('calendar_connected', 'true', {
      ...cookieOptions
    });

    log.success(`Calendar connected for ${calendarEmail}`);
    res.redirect(`${process.env.FRONTEND}/dashboard/reminder`);
  } catch (error) {
    log.error('Calendar callback failed', error);
    res.redirect(`${process.env.FRONTEND}/dashboard/reminder?error=${encodeURIComponent(error.message)}`);
  }
};

const getCalendarStatus = async (req, res) => {
  try {
    const email = req.cookies.calendar_email;
    const connected = req.cookies.calendar_connected;
    const accessToken = req.cookies.calendar_access_token;
    
    if (!email || !connected || !accessToken) {
      log.error('Incomplete calendar connection', {
        hasEmail: !!email,
        isConnected: !!connected,
        hasToken: !!accessToken
      });
    }
    
    res.json({
      connected: !!connected,
      email: email || null,
      hasToken: !!accessToken,
      cookiesPresent: Object.keys(req.cookies).length > 0
    });
  } catch (error) {
    log.error('Status check failed', error);
    res.status(500).json({ 
      error: 'Failed to check calendar status',
      details: error.message,
      cookiesPresent: Object.keys(req.cookies).length > 0
    });
  }
};

module.exports = {
  connectToGoogleCalendar,
  handleGoogleCalendarCallback,
  getCalendarStatus
};