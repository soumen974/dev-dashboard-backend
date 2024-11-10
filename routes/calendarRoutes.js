const express = require('express');
const router = express.Router();
const { fetchCalendarEvents } = require('../controllers/fetchEventController');
const { addEventToCalendarAndDb } = require('../controllers/addEventController');

router.get('/events', fetchCalendarEvents);
router.post('/add-event', addEventToCalendarAndDb);

module.exports = router;
