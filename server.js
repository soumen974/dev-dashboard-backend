const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const devRoutes = require('./routes/devRoutes');
const chatRoutes = require('./routes/chatRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const workRoutes=require('./routes/WorkListingRoutes');
const Track=require('./routes/TrackRoutes');
const PersonalData=require('./routes/PersonalDataRoutes');
const educationData=require('./routes/educationDataRoutes');
const recentExperience = require('./routes/recentExperienceRoutes');
const project=require('./routes/projectRoutes');
const socials=require('./routes/socialRoutes');
const service=require('./routes/serviceRoutes');
const licenceCerification =require('./routes/licenceCertificationRoutes');

const resumeMaker=require('./routes/resumePdfMakeRoutes');

const { google } = require('googleapis');
const connectDB = require('./models/db');
const calendarShowRoutes = require('./routes/calendarShowRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const googleRoutes = require('./routes/googleRoutes');
// const excelRoutes = require('./routes/timeTableRoutes');

connectDB();
require('dotenv').config();

const executeQuery = require('./utils/executeQuery');
const authRoutes = require('./routes/authRoutes');

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

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none', 
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
app.get('/', (req, res) => {
  res.send(`Welcome to Developer dashboard : Backend `);
});

// all routes related to authentication
app.use('/auth', authRoutes,googleRoutes);
app.use('/devs', devRoutes);
app.use('/api', chatRoutes);
// app.use('/portfolio', portfolioRoutes);
app.use('/work',workRoutes);
app.use('/dev',Track);
app.use('/dev/data',PersonalData);
app.use('/dev',educationData);
app.use('/dev',recentExperience);
app.use('/devs',project);
app.use('/build',resumeMaker);
app.use('/devs',socials);
app.use('/devs',service);
app.use('/devs',licenceCerification);
app.use('/calendar',calendarShowRoutes);
app.use('/google-calendar',calendarRoutes);
// app.use('/excel', excelRoutes);


app.use(cookieParser());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dashboard backend listening at http://localhost:${PORT}`);
});






const Dev = require('./models/devs'); 
const  Reminder= require('./models/reminderSchema');



// Configure session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET, 
//   resave: false, 
//   saveUninitialized: false, 
//   cookie: {
//     httpOnly: true, 
//     secure: process.env.NODE_ENV === 'production', 
//     sameSite: 'none', 
//   }
// }));

// Configure Passport for Google OAuth
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: `${process.env.BACKEND_API}/auth/google/callback`,
//   passReqToCallback: true // Allow access to req and res
// },
// async (req, accessToken, refreshToken, profile, done) => {
//   const email = profile.emails[0].value;

//   try {
//     let dev = await Dev.findOne({ email });

//     if (dev) {
//       // If the user exists, proceed with authentication
//       return done(null, dev);
//     } else {
//       // If the user doesn't exist, redirect to registration
//       // Pass the email to the frontend for registration
//       return done(null, false, { email }); 
//     }
//   } catch (err) {
//     return done(err);
//   }
// }));

// // Google OAuth login route (Redirect to Google login)
// const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });


// // Google OAuth callback route
// const googleCallback = [
//   passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND}/auth/register` }),
//   (req, res) => {
//     if (!req.user) {
//       // If the user was not found, redirect to the registration page with email query
//       const email = req.authInfo?.email;  // Retrieve the email passed from the Google strategy
//       return res.redirect(`${process.env.FRONTEND}/auth/register?email=${email}`);
//     }

//     // Issue JWT token if user exists
//     const token = jwt.sign({ id: req.user._id, email: req.user.email, username: req.user.username }, process.env.SECRET_KEY, { expiresIn: '5d' });
    
//     res.cookie('token', token, { httpOnly: true,secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
//     res.redirect(`${process.env.FRONTEND}/dashboard`);
//   }
// ];

// // Routes for Google OAuth
// app.get('/auth/google', googleLogin);
// app.get('/auth/google/callback', googleCallback);

// separate google code to separate file