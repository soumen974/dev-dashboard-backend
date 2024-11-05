const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const PersonalData = require('../models/personalData');


const generatePDF = (req, res) => {
  const { latexCode } = req.body;
  const username = req.devs.username;

  const sanitize = (input) => input
    ? input.replace(/([#%&{}~_^\\$])/g, '\\$1').replace(/([\"`])/g, '\\$1')
    : '';

  // LaTeX Template with dynamic data


  // Define paths
  const texDir = path.join(__dirname, 'generated');
  const texFilePath = path.join(texDir, 'resume.tex');
  const pdfFilePath = path.join(texDir, 'resume.pdf');
  const logFilePath = path.join(texDir, 'resume.log');
  const auxFilePath = path.join(texDir, 'resume.aux');

  // Ensure the directory exists
  fs.mkdirSync(texDir, { recursive: true });

  // Write LaTeX template to .tex file
  fs.writeFile(texFilePath, latexCode, (err) => {
    if (err) {
      console.error(`Error writing LaTeX file: ${err.message}`);
      return res.status(500).send('Failed to write LaTeX file');
    }

    // Compile LaTeX to PDF
    exec(`pdflatex -interaction=nonstopmode -output-directory=${texDir} ${texFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating PDF: ${error.message}`);
        console.error(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).send('Failed to generate PDF');
      }

      // Check if the PDF file exists
      fs.stat(pdfFilePath, (err, stats) => {
        if (err) {
          console.error(`Error checking PDF file: ${err.message}`);
          return res.status(500).send('PDF file not generated');
        }

        console.log(`PDF file generated: ${pdfFilePath} (${stats.size} bytes)`);

        // Upload PDF to Cloudinary
        cloudinary.uploader.upload(pdfFilePath, { resource_type: 'auto' }, (uploadErr, uploadResult) => {
          if (uploadErr) {
            console.error(`Error uploading to Cloudinary: ${uploadErr.message}`);
            return res.status(500).send('Failed to upload PDF to Cloudinary');
          }

          // const resumeUrl =uploadResult.secure_url;
          // const personalData =  PersonalData.findOneAndUpdate(
          //   { username },
          //   resumeUrl,
          //   { new: true, upsert: true, runValidators: true }
          // );

          console.log(`PDF successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);

          // Send the Cloudinary URL as the response
          res.json({ pdf_url: uploadResult.secure_url });

          fs.unlink(texFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .tex file: ${unlinkErr.message}`);
          });
          fs.unlink(pdfFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .pdf file: ${unlinkErr.message}`);
          });
          fs.unlink(logFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .log file: ${unlinkErr.message}`);
          });
          fs.unlink(auxFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .aux file: ${unlinkErr.message}`);
          });
        });
      });
    });
  });
};

module.exports = {
  generatePDF
};
