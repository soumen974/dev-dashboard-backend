const express = require('express');
const router = express.Router();
const { connectToGoogleCalendar, handleGoogleCalendarCallback, getCalendarStatus} = require('../controllers/connectCalendarController');


router.get('/connect', connectToGoogleCalendar);


router.get('/calendar/callback', handleGoogleCalendarCallback);

router.get('/status', getCalendarStatus);

module.exports = router;
