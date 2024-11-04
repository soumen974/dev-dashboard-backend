const express = require('express');
const { addEventToGoogleCalendar } = require('../controllers/googleCalendarController'); 
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/events',authenticateToken, addEventToGoogleCalendar); 
module.exports = router;
