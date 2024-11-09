// routes/scheduleRoutes.js
const express = require('express');
const { scheduleTimetable } = require('../controllers/ScheduleController');

const router = express.Router();

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized access. Please log in with Google.' });
}

// Route to handle timetable scheduling
router.post('/schedule-timetable', ensureAuthenticated, scheduleTimetable);

module.exports = router;
