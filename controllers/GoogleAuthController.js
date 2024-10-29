const Dev = require('../models/devs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

class GoogleAuthController {
  // Initiate Google OAuth
  static initiateGoogleAuth(req, res, next) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }

  // Handle Google OAuth callback
  static async handleGoogleCallback(req, res, next) {
    passport.authenticate('google', { failWithError: true }, async (err, user, info) => {
      try {
        if (err) {
          console.error('Google authentication error:', err);
          return res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(err.message)}`);
        }

        if (!user) {
          return res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(info?.message || 'Authentication failed')}`);
        }

        // Log in the user
        req.logIn(user, async (loginErr) => {
          if (loginErr) {
            console.error('Login error:', loginErr);
            return res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent('Login failed')}`);
          }

          try {
            // Generate JWT token
            const token = jwt.sign(
              {
                id: user._id,
                email: user.email,
                username: user.username
              },
              process.env.SECRET_KEY,
              { expiresIn: '5d' }
            );

            // Set JWT cookie
            res.cookie('token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
              maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
            });

            // Check if this is a new user
            const isNewUser = user.username.includes(user.email.split('@')[0]);

            if (isNewUser) {
              // Redirect new users to complete their profile
              const queryParams = new URLSearchParams({
                email: user.email,
                name: user.name || '',
                userId: user._id
              });
              return res.redirect(`${process.env.FRONTEND}/auth/complete-profile?${queryParams}`);
            }

            // Redirect existing users to dashboard
            return res.redirect(`${process.env.FRONTEND}/dashboard`);
          } catch (tokenErr) {
            console.error('Token generation error:', tokenErr);
            return res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
          }
        });
      } catch (error) {
        console.error('Callback handling error:', error);
        return next(error);
      }
    })(req, res, next);
  }

  // Handle Google OAuth error
  static handleAuthError(err, req, res, next) {
    console.error('Google Auth Error:', err);
    res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(err.message)}`);
  }

  // Logout user
  static async logout(req, res) {
    try {
      // Clear session
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }

        // Clear cookie
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        // Redirect to home or send success response
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await Dev.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }
}

module.exports = GoogleAuthController;