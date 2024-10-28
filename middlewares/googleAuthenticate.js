// middlewares/googleAuthenticate.js
const Dev = require('../models/devs');

const googleAuthenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const user = await Dev.findOne({ googleAccessToken: token });

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error during authentication:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = googleAuthenticate;
