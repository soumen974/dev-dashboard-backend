const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const scheduleTimetable = async (req, res) => {
  const { timetable, duration } = req.body;
  const oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oAuth2Client.setCredentials({ access_token: req.user.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  try {
    for (let i = 0; i < timetable.length; i++) {
      const classEvent = timetable[i];
      for (let j = 0; j < duration * 4; j++) { // repeat weekly for given months
        const event = {
          summary: classEvent.subject,
          start: { dateTime: new Date(classEvent.dateTimeStart), timeZone: 'Asia/Kolkata' },
          end: { dateTime: new Date(classEvent.dateTimeEnd), timeZone: 'Asia/Kolkata' },
          recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${duration * 4}`], // adjust as per need
        };
        await calendar.events.insert({ calendarId: 'primary', resource: event });
      }
    }
    res.status(200).send({ message: 'Reminders set successfully!' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = { scheduleTimetable };
