const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleController = require('../controllers/GoogleAuthController');

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email','https://www.googleapis.com/auth/calendar'],
    accessType: 'offline',
    prompt: 'consent',
    // prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failWithError: true }),
  googleController.handleGoogleCallback,
  googleController.handleGoogleError
);

module.exports = router;