// const jwt = require('jsonwebtoken');

// exports.generateAccessToken = (user) => {
//   const payload = {
//     userId: user._id,
//     email: user.email,
//     name: user.name
//   };

//   const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
//     expiresIn: '1h'
//   });

//   return accessToken;
// };

// exports.generateRefreshToken = (user) => {
//   const payload = {
//     userId: user._id,
//     email: user.email,
//     name: user.name
//   };

//   const refreshToken = jwt.sign(payload, process.env.SECRET_KEY, {
//     expiresIn: '7d'
//   });

//   return refreshToken;
// };