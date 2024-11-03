const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const Dev = require('../models/devs');

// Configure passport serialization
exports.configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Dev.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_API}/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails?.[0]?.value) {
        return done(null, false, { message: 'No email provided from Google' });
      }

      const email = profile.emails[0].value;
      let dev = await Dev.findOne({ email });

      if (dev) {
        return done(null, dev);
      } else {
        const newDev = new Dev({
          email: email,
          name: profile.displayName,
          username: email.split('@')[0] + Math.random().toString(36).substring(2, 5)
        });

        await newDev.save();
        return done(null, newDev);
      }
    } catch (err) {
      return done(err);
    }
  }));
};

// Handle Google callback
exports.handleGoogleCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        username: req.user.username
      }, 
      process.env.SECRET_KEY,
      { expiresIn: '5d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    });

    const isNewUser = req.user.username.includes(req.user.email.split('@')[0]);
    
    if (isNewUser) {
      const queryParams = new URLSearchParams({
        email: req.user.email,
        name: req.user.name || '',
        userId: req.user._id
      });
      res.redirect(`${process.env.FRONTEND}/dashboard`);
    } else {
      res.redirect(`${process.env.FRONTEND}/dashboard`);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect(`${process.env.FRONTEND}/auth/error`);
  }
};

// Handle Google auth error
exports.handleGoogleError = (err, req, res, next) => {
  console.error('Google Auth Error:', err);
  res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(err.message)}`);
};