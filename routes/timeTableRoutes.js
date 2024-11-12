const express = require("express");
const multer = require("multer");
const { convertExcelToCsv } = require("../controllers/timeTableController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to upload and convert the Excel file to CSV
router.post("/upload", upload.single("file"), convertExcelToCsv);

module.exports = router;
