const express = require('express');
const { imageUpload  } = require('../controllers/chatController');

const router = express.Router();

router.get('/upload', imageUpload);

module.exports = router;
