const xlsx = require("xlsx");
const fs = require("fs");

const convertExcelToCsv = (req, res) => {
  try {
    // Read the uploaded Excel file
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);

    // Convert the first sheet to CSV format
    const sheetName = workbook.SheetNames[0];
    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);

    // Clean up temporary file
    fs.unlinkSync(filePath);

    // Send the CSV data as plain text response
    res.send(csvData);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
};

module.exports = { convertExcelToCsv };
