const express = require('express');
const router = express.Router();
const multer = require('multer');
const timetableController = require('../controllers/timeTableController');
const authenticateToken = require('../middlewares/authenticateToken');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop();
    cb(null, `${timestamp}-${randomString}-${file.originalname}`);
  }
});

// Improved file filter with detailed validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload only Excel files (.xls or .xlsx)'), false);
  }
};

// Enhanced multer configuration
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
}).single('file');

// Enhanced error handling middleware
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Routes
router.post(
  '/upload-timetable', 
  authenticateToken, 
  handleUpload,
  timetableController.uploadTimetable
);

router.get(
  '/timetable-data', 
  authenticateToken, 
  timetableController.getTimetableData
);



module.exports = router;
