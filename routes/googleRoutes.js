const express = require('express');
const passport = require('passport');
const { success, failed, logout } = require('../controllers/googleController');

const router = express.Router();

// Route for initiating Google OAuth login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    accessType: 'offline',
    prompt: 'consent',
}));

// Callback route for Google OAuth
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/failed' }),
    success
);

// Route for failed Google login attempts
router.get('/google/failed', failed);

// Route for Google OAuth logout
router.post('/google/logout', logout);

module.exports = router;
