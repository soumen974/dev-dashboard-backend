const express = require('express');
const router = express.Router();
const passport = require('passport');
const githubAuthController = require('../controllers/githubAuthController');

// Middleware to check if user is already authenticated
const checkNotAuthenticated = (req, res, next) => {
  if (req.cookies.token) {
    return res.redirect(process.env.FRONTEND + '/dashboard');
  }
  next();
};

// Routes for GitHub authentication
router.get(
  '/github',
  githubAuthController.githubAuth
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/auth/error',
    failureMessage: true
  }),
  githubAuthController.githubCallback
);







module.exports = router;