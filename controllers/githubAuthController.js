const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const Dev = require('../models/devs');

// Serialize and deserialize user
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

passport.use(new GitHubStrategy({ 
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_API}/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Validate required environment variables
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      throw new Error('Missing required GitHub OAuth credentials');
    }

    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
    
    // Find or create user with additional error handling
    let dev = await Dev.findOne({ 
      $or: [
        { email },
        { githubId: profile.id }
      ]
    });

    if (!dev) {
      dev = new Dev({
        email,
        name: profile.displayName || profile.username,
        username: profile.username,
        picture: profile.photos?.[0]?.value,
        githubId: profile.id,
        githubAccessToken: accessToken, // Store for potential GitHub API calls
        lastLogin: new Date()
      });
    } else {
      // Update existing user's information
      dev.name = profile.displayName || profile.username;
      dev.picture = profile.photos?.[0]?.value;
      dev.githubAccessToken = accessToken;
      dev.lastLogin = new Date();
    }

    await dev.save();
    return done(null, dev);
  } catch (err) {
    console.error('GitHub Strategy Error:', err);
    return done(err);
  }
}));

// Authentication middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

exports.githubAuth = passport.authenticate('github', { 
  scope: ['user:email'],
  session: false
});

exports.githubCallback = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('Authentication failed');
    }


    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        username: req.user.username
      }, 
      process.env.SECRET_KEY,
      { expiresIn: '5d' }
    );


    // Enhanced cookie security
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None'
    });

    res.redirect(`${process.env.FRONTEND}/dashboard`);
  } catch (error) {
    console.error('GitHub Callback Error:', error);
    res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });
  res.redirect(`${process.env.FRONTEND}/login`);
};

exports.authenticateToken = authenticateToken;