const express = require('express');
const {
    createOrUpdatePersonalData,
    getPersonalData,
    deletePersonalData
} = require('../controllers/personalDataController');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { storage } = require('../services/cloudinary');
const upload = multer({ storage });


const router = express.Router();



router.post('/personal_data',authenticateToken,upload.fields([{ name: 'imageUrl' }, { name: 'resumeUrl' }]), createOrUpdatePersonalData);

router.get('/personal_data',authenticateToken, getPersonalData);


router.delete('/personal_data',authenticateToken, deletePersonalData);

module.exports = router;
