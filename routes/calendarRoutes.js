const express = require('express');
const { addEventToGoogleCalendar } = require('../controllers/googleCalendarController'); // Adjust the path as necessary

const router = express.Router();

router.post('/events', addEventToGoogleCalendar); // Ensure this function is correctly defined in your controller

module.exports = router;
