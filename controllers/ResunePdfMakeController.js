const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const PersonalData = require('../models/personalData');

const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';

const generatePDF = async (req, res) => {
  const { latexCode } = req.body;
  const username = req.devs.username;

  // Validation rules for LaTeX syntax
  const validationRules = [
    {
      check: code => code.includes('\\documentclass'),
      message: 'Missing document class declaration'
    },
    {
      check: code => code.includes('\\begin{document}') && code.includes('\\end{document}'),
      message: 'Missing document environment'
    }
  ];

  try {
    // Validate all rules
    for (const rule of validationRules) {
      if (!rule.check(latexCode)) {
        return res.status(400).json({ 
          success: false,
          error: rule.message,
          validationFailed: true
        });
      }
    }

    // Generate PDF
    const latexResponse = await axios.post(LATEX_API_URL, {
      compiler: 'pdflatex',
      resources: [{
        content: latexCode,
        main: true
      }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer'
    });

    // Convert response to buffer
    const pdfBuffer = Buffer.from(latexResponse.data);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(pdfBuffer);
    });

    // Update personal data
    const personalData = await PersonalData.findOneAndUpdate(
      { username },
      { resumeUrl: uploadResponse.secure_url },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      pdf_url: uploadResponse.secure_url,
      data: personalData
    });

  } catch (error) {
    const errorResponse = {
      success: false,
      error: 'Failed to generate PDF',
      details: error.message
    };

    if (error.response?.status === 401) {
      errorResponse.error = 'LaTeX API authentication failed';
      return res.status(401).json(errorResponse);
    }

    if (error.response?.status === 400) {
      errorResponse.error = 'Invalid LaTeX code provided';
      return res.status(400).json(errorResponse);
    }

    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  generatePDF
};
