const express = require('express');
const {
    createPersonalData,
    getPersonalData,
    updatePersonalData,
    deletePersonalData
} = require('../controllers/personalDataController');
const authenticateToken = require('../middlewares/authenticateToken');

const multer = require('multer');
const { storage } = require('../services/cloudinary');

const router = express.Router();

const upload = multer({ storage });

// Create personal data
router.post('/personal_data',authenticateToken,upload.single('image'), createPersonalData);

// Get personal data by username
router.get('/personal_data',authenticateToken, getPersonalData);

// Update personal data by username
router.put('/personal_data',authenticateToken,upload.single('image'), updatePersonalData);

// Delete personal data by username
router.delete('/personal_data',authenticateToken, deletePersonalData);

module.exports = router;
