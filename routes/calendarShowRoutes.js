// routes/calendarShowRoutes.js
const express = require('express');
const router = express.Router();
const { showUserCalendar } = require('../controllers/calendarShowController');
const authenticateToken = require('../middlewares/authenticateToken');


router.get('/show', authenticateToken, showUserCalendar);

module.exports = router;
