const nodemailer = require('nodemailer');
const EmailVerification = require('../models/emailVerification');
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

    await EmailVerification.updateOne(
        { email },
        { $set: { code, created_at: new Date(), expires_at: expiresAt } },
        { upsert: true } // Create a new document if one doesn't exist
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
            <p style="color: #777; font-size: 14px;">The Team Soumen Bhunia</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationEmail
};
