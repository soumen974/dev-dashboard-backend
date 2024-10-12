const multer = require('multer');
const { storage } = require('./cloudinary');

// Use .single('file') for single file upload, adjust as needed
const upload = multer({ storage }).single('file');

// Middleware function to handle file uploads
const uploadFile = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }
    // If file is uploaded successfully, call next middleware
    next();
  });
};

module.exports = { uploadFile };
