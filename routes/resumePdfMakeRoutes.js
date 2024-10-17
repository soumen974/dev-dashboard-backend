const express = require('express');
const { generatePDF } = require('../controllers/ResunePdfMakeController');

const router = express.Router();

// POST request to generate PDF
router.post('/generate-pdf', generatePDF);

module.exports = router;
