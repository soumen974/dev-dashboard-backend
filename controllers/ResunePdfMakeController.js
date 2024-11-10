const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const PersonalData = require('../models/personalData');

const generatePDF = async (req, res) => {
  const { latexCode } = req.body;
  const username = req.devs.username;

  const sanitize = (input) =>
    input ? input.replace(/([#%&{}~_^\\$])/g, '\\$1').replace(/([\"`])/g, '\\$1') : '';

  // Define paths
  const texDir = path.join(__dirname, 'generated');
  const texFilePath = path.join(texDir, 'resume.tex');
  const pdfFilePath = path.join(texDir, 'resume.pdf');
  const logFilePath = path.join(texDir, 'resume.log');
  const auxFilePath = path.join(texDir, 'resume.aux');

  // Ensure the directory exists
  fs.mkdirSync(texDir, { recursive: true });

  // Cleanup function to delete temporary files
  const cleanupFiles = () => {
    [texFilePath, pdfFilePath, logFilePath, auxFilePath].forEach((filePath) => {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.error(`Error deleting file ${filePath}: ${unlinkErr.message}`);
        }
      });
    });
  };

  // Write LaTeX template to .tex file
  fs.writeFile(texFilePath, latexCode, (err) => {
    if (err) {
      console.error(`Error writing LaTeX file: ${err.message}`);
      cleanupFiles();
      return res.status(500).send('Failed to write LaTeX file');
    }

    
    exec(`pdflatex -interaction=nonstopmode -output-directory=${texDir} ${texFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating PDF: ${error.message}`);
        console.error(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        cleanupFiles();
        return res.status(500).send('Failed to generate PDF');
      }

     
      fs.stat(pdfFilePath, async (err, stats) => {
        if (err) {
          console.error(`Error checking PDF file: ${err.message}`);
          cleanupFiles();
          return res.status(500).send('PDF file not generated');
        }

        console.log(`PDF file generated: ${pdfFilePath} (${stats.size} bytes)`);

       
        cloudinary.uploader.upload(pdfFilePath, { resource_type: 'auto' }, async (uploadErr, uploadResult) => {
          if (uploadErr) {
            console.error(`Error uploading to Cloudinary: ${uploadErr.message}`);
            cleanupFiles();
            return res.status(500).send('Failed to upload PDF to Cloudinary');
          }

          const resumeUrl = uploadResult.secure_url;

          try {
            
            const personalData = await PersonalData.findOneAndUpdate(
              { username },
              { resumeUrl },
              { new: true, upsert: true, runValidators: true }
            );

            console.log(`PDF successfully uploaded to Cloudinary: ${resumeUrl}`);
            res.json({ pdf_url: resumeUrl, data: personalData });
          } catch (dbError) {
            console.error(`Error updating PersonalData: ${dbError.message}`);
            res.status(500).send('Failed to update resume URL in PersonalData');
          } finally {
            cleanupFiles(); // Clean up files after database update or error
          }
        });
      });
    });
  });
};

module.exports = {
  generatePDF
};
