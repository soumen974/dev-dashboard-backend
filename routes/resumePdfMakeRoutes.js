const express = require('express');
const { generatePDF } = require('../controllers/ResunePdfMakeController');
const authenticateToken = require('../middlewares/authenticateToken'); 

const router = express.Router();

// POST request to generate PDF
router.post('/generate-pdf',authenticateToken, generatePDF);

module.exports = router;
