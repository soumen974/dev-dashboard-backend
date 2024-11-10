const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_API}/google/calendar/callback` 
);

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
    console.log('Redirecting to Google OAuth:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to initiate Google Calendar connection' });
  }
};

const handleGoogleCalendarCallback = async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    console.error('No authorization code received');
    return res.redirect(`${process.env.FRONTEND}/dashboard/reminder?error=no_auth_code`);
  }

  try {
    console.log('Receiving callback with code:', code);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const calendarEmail = data.email;

    console.log('Successfully retrieved user email:', calendarEmail);
   
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    };

    
    res.cookie('calendar_access_token', tokens.access_token, cookieOptions);
    res.cookie('calendar_refresh_token', tokens.refresh_token, cookieOptions);
    res.cookie('calendar_email', calendarEmail, {
      ...cookieOptions,
      httpOnly: false
    });
    res.cookie('calendar_connected', 'true', {
      ...cookieOptions,
      httpOnly: false
    });
    
    console.log('Cookies set successfully, redirecting to frontend');
    res.redirect(`${process.env.FRONTEND}/dashboard/reminder`);
  } catch (error) {
    console.error('Error in Google Calendar callback:', error);
    res.redirect(`${process.env.FRONTEND}/dashboard/reminder?error=${encodeURIComponent(error.message)}`);
  }
};

const getCalendarStatus = async (req, res) => {
  try {
    const email = req.cookies.calendar_email;
    const connected = req.cookies.calendar_connected;
    
    console.log('Calendar status check - Email:', email, 'Connected:', connected);
    
    res.json({
      connected: !!connected,
      email: email || null
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    res.status(500).json({ error: 'Failed to check calendar status' });
  }
};

module.exports = {
  connectToGoogleCalendar,
  handleGoogleCalendarCallback,
  getCalendarStatus
};