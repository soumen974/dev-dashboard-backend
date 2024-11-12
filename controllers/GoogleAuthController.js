const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const Dev = require('../models/devs');

// Utility function to validate environment variables
const validateConfig = () => {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'BACKEND_API',
    'FRONTEND',
    'SECRET_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Configure secure cookie options based on environment
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
  };
};

exports.configurePassport = () => {
  // Validate configuration before setting up passport
  validateConfig();

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Dev.findById(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      console.error('Deserialize Error:', err);
      done(err);
    }
  });

  const callbackURL = `${process.env.BACKEND_API}/auth/google/callback`;
  console.log('Configuring Google Strategy with callback URL:', callbackURL);

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    passReqToCallback: true,
    proxy: process.env.NODE_ENV === 'production' // Enable proxy for production
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google callback received for profile:', profile.id);

      if (!profile.emails?.[0]?.value) {
        console.error('No email provided from Google');
        return done(null, false, { message: 'No email provided from Google' });
      }

      const email = profile.emails[0].value;
      let dev = await Dev.findOne({ email });

      if (dev) {
        console.log('Existing user found:', dev.email);
        // Update last login timestamp if needed
        dev.lastLogin = new Date();
        await dev.save();
        return done(null, dev);
      } else {
        console.log('Creating new user for:', email);
        const newDev = new Dev({
          email: email,
          name: profile.displayName,
          username: `${email.split('@')[0]}${Math.random().toString(36).substring(2, 5)}`,
          googleId: profile.id,
          lastLogin: new Date()
        });

        await newDev.save();
        return done(null, newDev);
      }
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err);
    }
  }));
};

exports.handleGoogleCallback = async (req, res) => {
  try {
    if (!req.user) {
      console.error('No user data in request');
      throw new Error('Authentication failed');
    }

    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        username: req.user.username
      }, 
      process.env.SECRET_KEY,
      { 
        expiresIn: '5d',
        algorithm: 'HS256'
      }
    );

    // Set session data
    req.session.username = req.user.username;
    req.session.userId = req.user._id;

    // Save session with proper error handling
    try {
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('Session saved successfully:', {
        username: req.session.username,
        sessionID: req.sessionID
      });
    } catch (sessionError) {
      console.error('Session save error:', sessionError);
      // Continue execution even if session save fails
    }

    // Set cookie with environment-specific options
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    console.log('Cookie set with options:', cookieOptions);

    // Determine if new user and redirect
    const isNewUser = req.user.username.includes(req.user.email.split('@')[0]);
    const redirectUrl = `${process.env.FRONTEND}/dashboard`;
    
    if (isNewUser) {
      const queryParams = new URLSearchParams({
        email: req.user.email,
        name: req.user.name || '',
        userId: req.user._id.toString()
      });
      console.log('Redirecting new user to:', redirectUrl);
      res.redirect(redirectUrl);
    } else {
      console.log('Redirecting existing user to:', redirectUrl);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Authentication callback error:', error);
    res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
};

exports.handleGoogleError = (err, req, res, next) => {
  console.error('Google Auth Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
  
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Authentication failed' 
    : err.message;
    
  res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(errorMessage)}`);
};