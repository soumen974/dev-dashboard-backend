require('dotenv').config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const bcrypt = require('bcrypt');
const Dev = require('../models/devs');
const jwt = require('jsonwebtoken');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_API}/auth/google/callback`,
            scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
            accessType: 'offline',
            prompt: 'consent',
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const email = profile.emails[0].value;
                let user = await Dev.findOne({ email });

                if (user) {
                    // Store refresh token in the database
                    user.googleRefreshToken = refreshToken || user.googleRefreshToken; // Update if available
                    await user.save();

                    // Access token will be set in cookies later
                    return done(null, user);
                } else {
                    const username = profile.displayName.replace(/\s+/g, '') + Math.random().toString(36).substring(2, 5);
                    const password = Math.random().toString(36).substring(2, 15);
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const name = profile.displayName;

                    user = new Dev({
                        username: username,
                        email: email,
                        name: name,
                        password: hashedPassword,
                        googleRefreshToken: refreshToken || null, // Store refresh token if available
                    });

                    await user.save();
                    return done(null, user);
                }
            } catch (err) {
                console.error("Error during Google OAuth:", err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Dev.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Success callback after Google authentication
const success = async (req, res) => {
    try {
        if (req.user) {
            const token = jwt.sign(
                {
                    id: req.user.id,
                    email: req.user.email,
                    username: req.user.username
                },
                process.env.SECRET_KEY,
                {
                    expiresIn: '5d'
                }
            );

            // Set JWT token in cookies
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
            });

            // Set Access Token in cookies
            res.cookie('googleAccessToken', req.user.googleAccessToken, { // Make sure to retrieve the token from the user
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 5 * 60 * 1000, // For example, 5 minutes, adjust as needed
            });

            res.redirect(`${process.env.FRONTEND}/dashboard`);
        } else {
            res.status(403).json({ error: true, message: "Not Authorized" });
        }
    } catch (error) {
        console.error("Error in success callback:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Failure callback for Google authentication
const failed = (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
};

// Logout controller for Google OAuth
const logout = (req, res) => {
    // Clear the cookies related to authentication
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.clearCookie('googleAccessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.clearCookie('googleRefreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });

    res.status(200).json({ message: 'Logout successful' });
};

module.exports = { success, failed, logout };

