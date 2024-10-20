const jwt = require('jsonwebtoken');
require('dotenv').config();


function authenticateToken(req, res, next) {
  const token = req.cookies.token; 
  // const accessToken = req.cookies.accessToken;
  // const refreshToken = req.cookies.refreshToken;
 

  if (!token) {
    return res.status(403).json({ error: 'Token required' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Attach user information to request object
    req.devs = {
      username: decoded.username,
      id: decoded.id,
      email: decoded.email,
    };

    next(); // Pass control to the next middleware or route handler
  });
}

module.exports = authenticateToken;