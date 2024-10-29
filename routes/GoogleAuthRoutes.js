const express = require('express');
const router = express.Router();
const GoogleAuthController = require('../controllers/GoogleAuthController');

// Google OAuth routes
router.get('/google', GoogleAuthController.initiateGoogleAuth);
router.get('/google/callback', GoogleAuthController.handleGoogleCallback, GoogleAuthController.handleAuthError);

// Additional auth routes
router.post('/logout', GoogleAuthController.logout);
router.get('/current-user', GoogleAuthController.getCurrentUser);

module.exports = router;