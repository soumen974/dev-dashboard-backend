const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const Dev = require('./models/devs');

// Import routes
const devRoutes = require('./routes/devRoutes');
const chatRoutes = require('./routes/chatRoutes');
const workRoutes = require('./routes/WorkListingRoutes');
const Track = require('./routes/TrackRoutes');
const PersonalData = require('./routes/PersonalDataRoutes');
const educationData = require('./routes/educationDataRoutes');
const recentExperience = require('./routes/recentExperienceRoutes');
const project = require('./routes/projectRoutes');
const socials = require('./routes/socialRoutes');
const service = require('./routes/serviceRoutes');
const licenceCerification = require('./routes/licenceCertificationRoutes');
const resumeMaker = require('./routes/resumePdfMakeRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to database
const connectDB = require('./models/db');
connectDB();

// Middleware setup - Order is important
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://foxdash.vercel.app',
    'https://foxdash.onrender.com'
  ],
  credentials: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration - Must be before passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
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
    // Check if we have an email
    if (!profile.emails?.[0]?.value) {
      return done(null, false, { message: 'No email provided from Google' });
    }

    const email = profile.emails[0].value;
    let dev = await Dev.findOne({ email });

    if (dev) {
      // Existing user
      return done(null, dev);
    } else {
      // New user - we'll handle this differently
      const userData = {
        email,
        name: profile.displayName,
        picture: profile.photos?.[0]?.value,
        googleId: profile.id
      };
      
      // Create a new user with minimum required fields
      const newDev = new Dev({
        email: userData.email,
        name: userData.name,
        // Generate a temporary username from email
        username: email.split('@')[0] + Math.random().toString(36).substring(2, 5)
      });

      await newDev.save();
      return done(null, newDev);
    }
  } catch (err) {
    return done(err);
  }
}
));

// Auth routes
app.get('/auth/google', 
passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
})
);

app.get('/auth/google/callback',
passport.authenticate('google', { failWithError: true }),
async (req, res) => {
  try {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        username: req.user.username
      }, 
      process.env.SECRET_KEY,
      { expiresIn: '5d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 5 * 24 * 60 * 60 * 1000  // 5 days
    });

    // Check if this is a new user (by checking if username is the auto-generated one)
    const isNewUser = req.user.username.includes(req.user.email.split('@')[0]);
    
    if (isNewUser) {
      // Redirect new users to complete their profile
      const queryParams = new URLSearchParams({
        email: req.user.email,
        name: req.user.name || '',
        userId: req.user._id
      });
      res.redirect(`${process.env.FRONTEND}/dashboard`);
    } else {
      // Redirect existing users to dashboard
      res.redirect(`${process.env.FRONTEND}/dashboard`);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect(`${process.env.FRONTEND}/auth/error`);
  }
},
// Error handler
(err, req, res, next) => {
  console.error('Google Auth Error:', err);
  res.redirect(`${process.env.FRONTEND}/auth/error?message=${encodeURIComponent(err.message)}`);
}
);
// API Routes
app.get('/', (req, res) => {
  res.send('Welcome to Developer dashboard : Backend');
});

// Mount route handlers
app.use('/auth', authRoutes);
app.use('/devs', devRoutes);
app.use('/api', chatRoutes);
app.use('/work', workRoutes);
app.use('/dev', Track);
app.use('/dev/data', PersonalData);
app.use('/dev', educationData);
app.use('/dev', recentExperience);
app.use('/devs', project);
app.use('/build', resumeMaker);
app.use('/devs', socials);
app.use('/devs', service);
app.use('/devs', licenceCerification);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Determine error status
  const status = err.status || 500;
  
  // Send appropriate error response
  res.status(status).json({ 
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dashboard backend listening at http://localhost:${PORT}`);
});