// routes/calendarShowRoutes.js
const express = require('express');
const router = express.Router();
const { showUserCalendar } = require('../controllers/calendarShowController');
const googleAuthenticate = require('../middlewares/googleAuthenticate');

router.get('/show', googleAuthenticate, showUserCalendar);

module.exports = router;
