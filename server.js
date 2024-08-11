const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const devRoutes = require('./routes/devRoutes');
const connectDB = require('./models/db');
connectDB();

require('dotenv').config();

const executeQuery = require('./utils/executeQuery');
const authRoutes = require('./routes/authRoutes');


app.use(cors({
  origin: ['http://localhost:3000', 'https://developerdashboard.vercel.app'],
  credentials: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  optionsSuccessStatus: 200
}));


  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Welcome to Developer dashboard : Backend');
});

// all routes related to authentication

app.use('/auth', authRoutes);
app.use('/devs', devRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Dashboard backend listening at http://localhost:${PORT}`);
});


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    }
  }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const query = 'SELECT * FROM devs WHERE id = ?';
    const rows = await executeQuery(query, [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(new Error('User not found'));
    }
  } catch (err) {
    done(err);
  }
});

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  try {
    const query = 'SELECT * FROM devs WHERE email = ?';
    const rows = await executeQuery(query, [email]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      const insertUserQuery = 'INSERT INTO devs (username, email, name) VALUES (?, ?, ?)';
      const result = await executeQuery(insertUserQuery, [profile.displayName, email, profile.name.givenName]);
      const newUserQuery = 'SELECT * FROM devs WHERE id = ?';
      const newUser = await executeQuery(newUserQuery, [result.insertId]);
      done(null, newUser[0]);
    }
  } catch (err) {
    done(err);
  }
}));

// Google OAuth Routes
app.get('   ', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email, name: req.user.name }, process.env.SECRET_KEY, { expiresIn: '5d' });
    res.cookie('UserToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    res.cookie('userId', req.user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    res.redirect('http://localhost:3000/');
  }
);

// Response middleware for handling bigint in JSON
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    return originalJson.call(this, JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )));
  };
  next();
});
