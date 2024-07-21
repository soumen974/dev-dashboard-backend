const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const executeQuery = require('../utils/executeQuery');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateVerificationCode = async (email) => {
  if (!email) {
    throw new Error("Email cannot be null or undefined");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
  const expiresAt = new Date(Date.now() + 6 * 60000); // Set expiration time to 6 minutes from now

  const query = `
    INSERT INTO email_verifications (email, code, created_at, expires_at)
    VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    ON DUPLICATE KEY UPDATE code = VALUES(code), created_at = CURRENT_TIMESTAMP, expires_at = VALUES(expires_at)
  `;
  await executeQuery(query, [email, code, expiresAt]);

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
      <p style="color: #777; font-size: 14px;">The Team Soumen Bhunia</p>
    </div>
  `
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

    const checkQuery = 'SELECT COUNT(*) AS count FROM devs WHERE email = ?';
    try {
      const checkResult = await executeQuery(checkQuery, [email]);
      if (checkResult[0].count > 0) {
        return res.status(400).json({ error: 'Developer already exists' });
      }
    } catch (err) {
      return res.status(500).send(`Error checking email: ${err.toString()}`);
    }

    try {
      const verificationCode = await generateVerificationCode(email);
      await sendVerificationEmail(email, verificationCode);
      res.status(201).json({ message: `Verification code sent to ${email} ` });
    } catch (err) {
      res.status(500).send(`Error creating verification entry: ${err.toString()}`);
    }
  }
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

    const checkVerificationQuery = 'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP';
    try {
      const checkResult = await executeQuery(checkVerificationQuery, [email, code]);
      if (checkResult.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
      }

      const deleteVerificationQuery = 'DELETE FROM email_verifications WHERE email = ?';
      await executeQuery(deleteVerificationQuery, [email]);

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
      res.status(500).send(`Error verifying email: ${err.toString()}`);
    }
  }
];

const addpassword = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('name').notEmpty().withMessage('Enter your name'),  
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email, password, username, name,
        security_question, security_answer
    } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = `INSERT INTO devs (email, password, username, name,security_question, security_answer)
                               VALUES (?, ?, ?, ?, ?, ?)`;

      await executeQuery(insertUserQuery, [
        email,
        hashedPassword,
        username || '',
        name || '',
        security_question || '',
        security_answer || '',
      ]);

      res.status(201).json({ message: 'Developer Added successfully' });
    } catch (err) {
      res.status(500).json({ error: `Error Adding Developer: ${err.message}` });
    }
  }
];



const login = [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM devs WHERE email = ?';

    try {
      const rows = await executeQuery(query, [email]);
      if (rows.length > 0) {
        const user = rows[0];
        try {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.SECRET_KEY, { expiresIn: '5d' });
            res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Strict' }); 
            return res.status(200).json({ message: 'Developer Login successfully' });
          } else {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        } catch (err) {
          return res.status(500).json({ error: 'Error comparing passwords' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Error logging in: ${err.toString()}` });
    }
  }
];

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).send('Logout successful');
};

const protectedRoute = (req, res) => {
  res.status(200).json({ 
    message: 'This is a protected route', 
    developer_data: req.devs 
  });};

module.exports = { register, verifyEmail, login, logout, protectedRoute,addpassword };
