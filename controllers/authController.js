const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Dev = require('../models/devs');
const email_verifications = require('../models/email_verifications');
const executeQuery = require('../utils/executeQuery');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 6 * 60000);

  await executeQuery(() =>
    email_verifications.updateOne(
      { email },
      { email, code, created_at: new Date(), expires_at: expiresAt },
      { upsert: true }
    )
  );

  return code;
};

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
      <img src="https://img.freepik.com/free-vector/welcome-concept-landing-page_52683-22680.jpg?w=826&t=st=1721567675~exp=1721568275~hmac=dc999ada0dd9fdd11e4b0b3b0729516dbc808929a1f1de79594b4bcca1a250c8" alt="Welcome Image" style="width: 100%; max-width: 600px; margin-top: 20px; border-radius: 10px;">
      <p style="color: #777; font-size: 14px; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
      <p style="color: #777; font-size: 14px;">Best regards,</p>
      <a href="https://soumenbhunia.vercel.app/" style="color: #777; font-style: underline; font-size: 14px;">The Team Soumen Bhunia</a>
    </div>
  `,
  };
  await transporter.sendMail(mailOptions);
};

const register = [
  body('email').isEmail().withMessage('Invalid email address'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const existingDev = await executeQuery(() => Dev.findOne({ email }));
      if (existingDev) {
        return res.status(400).json({ error: 'Developer already exists' });
      }

      const verificationCode = await generateVerificationCode(email);
      await sendVerificationEmail(email, verificationCode);
      res.status(201).json({ message: `Verification code ${verificationCode} sent to ${email}` });
    } catch (err) {
      res.status(500).json({ error: `Error during registration: ${err.message}` });
    }
  },
];

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
      const verification = await executeQuery(() =>
        email_verifications.findOne({ email, code, expires_at: { $gt: new Date() } })
      );

      if (!verification) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      await executeQuery(() => email_verifications.deleteOne({ email }));

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
      res.status(500).json({ error: `Error verifying email: ${err.message}` });
    }
  },
];

const addpassword = [
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
      const existingUsername = await executeQuery(() => Dev.findOne({ username }));
      if (existingUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newDev = new Dev({
        name: name || '',
        email,
        password: hashedPassword,
        username,
        security_question: security_question || '',
        security_answer: security_answer || '',
      });

      await executeQuery(() => newDev.save());

      res.status(201).json({ message: 'Developer added successfully' });
    } catch (err) {
      res.status(500).json({ error: `Error adding developer: ${err.message}` });
    }
  },
];

const checkUsername = [
  body('username').notEmpty().withMessage('Your username'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    const { username } = req.body;

    try {
      const userExists = await executeQuery(() => Dev.exists({ username }));

      if (userExists) {
        res.status(200).json({ exists: true, message: 'Username already exists' });
      } else {
        res.status(200).json({ exists: false, message: 'Username is available' });
      }
    } catch (err) {
      res.status(500).json({ error: `Error checking username: ${err.message}` });
    }
  },
];

const login = [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const dev = await executeQuery(() => Dev.findOne({ email }));
      if (dev) {
        const match = await bcrypt.compare(password, dev.password);
        if (match) {
          const token = jwt.sign(
            { id: dev._id, email: dev.email, username: dev.username },
            process.env.SECRET_KEY,
            { expiresIn: '5d' }
          );
          res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
          return res.status(200).json({ message: 'Developer Login successfully' });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ error: `Error logging in: ${err.message}` });
    }
  },
];

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).send('Logout successful');
};

const protectedRoute = (req, res) => {
  res.status(200).json({
    message: 'This is a protected route',
    developer_data: req.devs,
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  protectedRoute,
  addpassword,
  checkUsername,
};
