// server.js
const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const googleController = require('./controllers/GoogleAuthController');
// require('./controllers/googleAuthController').configurePassport();


// Import routes
const googleRoutes = require('./routes/GoogleAuthRoutes');
const githubAuthRoutes = require('./routes/githubAuthRoutes');
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
const classTimeTable = require('./routes/scheduleRoutes');
const connectCalendar = require('./routes/connectCalendarRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const timeTableRoutes = require('./routes/timeTableRoutes');

// Connect to database
const connectDB = require('./models/db');



connectDB();

// Middleware setup
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  
  // For authenticated CRUD operations
  if (req.header('Origin') === 'http://localhost:3000' || 
      req.header('Origin') === 'https://foxdash.vercel.app') {
    corsOptions = {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      optionsSuccessStatus: 200
    }
  } 
  // For public GET only
  else if (req.header('Origin') === 'https://myportfoliofoxdash.vercel.app') {
    corsOptions = {
      origin: true,
      methods: ['GET'],
      credentials: false,  // No authentication needed
      optionsSuccessStatus: 200
    }
  }
  // For any other origin, deny access
  else {
    corsOptions = {
      origin: false
    }
  }
  
  callback(null, corsOptions);
}

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure passport with Google strategy
googleController.configurePassport();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Developer dashboard : Backend');
});

// Mount route handlers
app.use('/auth', googleRoutes);
app.use('/auth', githubAuthRoutes); 
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
app.use('/api', classTimeTable);
app.use('/google',connectCalendar);
app.use('/calendar',calendarRoutes);
app.use('/google', connectCalendar);
app.use('/api', timeTableRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({ 
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dashboard backend listening at ${process.env.BACKEND_API}`);
});