const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleController = require('../controllers/GoogleAuthController');

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failWithError: true }),
  googleController.handleGoogleCallback,
  googleController.handleGoogleError
);

module.exports = router;