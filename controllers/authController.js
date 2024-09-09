const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Dev = require('../models/devs');
const EmailVerification = require('../models/emailVerification');
require('dotenv').config();

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const generateVerificationCode = async (email) => {
  if (!email) {
    throw new Error('Email cannot be null or undefined');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); 
  const expiresAt = new Date(Date.now() + 6 * 60000);

  await EmailVerification.findOneAndUpdate(
    { email },
    { code, expiresAt, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  return code;
};

// Utility function to send verification email
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification Code',
    html: `
    <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333; font-size: 24px;">Welcome to Our Service!</h2>
      <p style="color: #555; font-size: 16px;">Thank you for registering with us. To complete your registration, please use the following verification code:</p>
      <h1 style="background: #007bff; border-radius: 5px; display: inline-block; padding: 10px 20px; color: #fff; font-size: 32px;">${code}</h1>
      <p style="color: #555; font-size: 16px;">This code is valid for six minutes.</p>
      <p style="color: #777; font-size: 14px; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
      <p style="color: #777; font-size: 14px;">Best regards,</p>
      <p style="color: #777; font-size: 14px;">The Team</p>
    </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

// Register controller
const register = [
  body('email').isEmail().withMessage('Invalid email address'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const existingDev = await Dev.findOne({ email });
      if (existingDev) {
        return res.status(400).json({ error: 'Developer already exists' });
      }

      const verificationCode = await generateVerificationCode(email);
      await sendVerificationEmail(email, verificationCode);

      res.status(201).json({ message: `Verification code sent to ${email}` });
    } catch (err) {
      res.status(500).send(`Error processing request: ${err.message}`);
    }
  }
];

// Email verification controller
const verifyEmail = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code } = req.body;

    try {
      const verification = await EmailVerification.findOne({ email, code });
      if (!verification || verification.expiresAt < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      await EmailVerification.deleteOne({ email });
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
      res.status(500).send(`Error verifying email: ${err.message}`);
    }
  }
];

// Add password controller
const addPassword = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('username').notEmpty().withMessage('Enter your username'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, username, security_question, security_answer } = req.body;

    try {
      const existingUsername = await Dev.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const dev = new Dev({
        name: name || '',
        email,
        password: hashedPassword,
        username,
        security_question: security_question || '',
        security_answer: security_answer || ''
      });

      await dev.save();

      const token = jwt.sign(
        { id: dev._id, email: dev.email, username: dev.username },
        process.env.SECRET_KEY,
        { expiresIn: '5d' }
      );

      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' });

      return res.status(201).json({ message: 'Developer added successfully', token });
    } catch (err) {
      res.status(500).json({ error: `Error adding developer: ${err.message}` });
    }
  }
];


// Check username availability controller
const checkUsername = [
  body('username').notEmpty().withMessage('Enter your username'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    try {
      const user = await Dev.findOne({ username });
      if (user) {
        return res.status(200).json({ exists: true, message: 'Username already exists' });
      } else {
        return res.status(200).json({ exists: false, message: 'Username is available' });
      }
    } catch (err) {
      res.status(500).json({ error: `Error checking username: ${err.message}` });
    }
  }
];

const login = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const dev = await Dev.findOne({ email });

      // Check if the email exists
      if (!dev) {
        return res.status(404).json({ error: 'User not found' }); // Specific message for non-existent email
      }

      // Check if the password is correct
      const match = await bcrypt.compare(password, dev.password);
      if (!match) {
        return res.status(401).json({ error: 'Wrong Password !' }); // Unified error message for wrong password
      }

      // Generate the JWT token
      const token = jwt.sign(
        { id: dev._id, email: dev.email, username: dev.username },
        process.env.SECRET_KEY,
        { expiresIn: '5d' }
      );

      // Set token as an HttpOnly cookie
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' });
      return res.status(200).json({ message: 'Developer logged in successfully' });
    } catch (err) {
      res.status(500).json({ error: `Error logging in: ${err.message}` });
    }
  }
];



// Logout controller
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,  
    sameSite: 'None'
  });
  res.status(200).send('Logout successful');
};

// Protected route controller
const protectedRoute = (req, res) => {
  res.status(200).json({
    message: 'This is a protected route',
    developer_data: req.devs,
  });
};

module.exports = { register, verifyEmail, addPassword, checkUsername, login, logout, protectedRoute };
