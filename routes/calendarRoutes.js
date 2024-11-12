const express = require('express');
const router = express.Router();
const { fetchCalendarEvents } = require('../controllers/fetchEventController');
const { 
    addEventToCalendarAndDb, 
    updateEventInCalendarAndDb,
    deleteEventFromCalendarAndDb
} = require('../controllers/addEventController');

router.get('/events', fetchCalendarEvents);
router.post('/add-event', addEventToCalendarAndDb);
router.put('/update/:eventId', updateEventInCalendarAndDb);
router.delete('/delete/:eventId', deleteEventFromCalendarAndDb);

module.exports = router;
