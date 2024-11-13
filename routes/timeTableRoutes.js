const express = require('express');
const router = express.Router();
const multer = require('multer');
const timetableController = require('../controllers/timeTableController');
const authenticateToken = require('../middlewares/authenticateToken');

// Configure multer storage for Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Excel file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/upload-timetable', authenticateToken, upload.single('file'), timetableController.uploadTimetable);
router.get('/timetable-data', authenticateToken, timetableController.getTimetableData);
router.post('/sync-calendar', authenticateToken, timetableController.syncWithGoogleCalendar);

module.exports = router;
