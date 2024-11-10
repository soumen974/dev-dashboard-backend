// const TimeTable = require('../models/timeTable');
// const XLSX = require('xlsx');
// const Dev = require('../models/devs');

// const uploadExcel = async (req, res) => {
//     try {
        
//         const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         const data = XLSX.utils.sheet_to_json(sheet);
//         console.log("Xlsx data in json",data);
        
        
//         const tables = data.map(row => ({
//             username: user.username,
//             eventname: row["Event Name"] || "",
//             day: row["Day"] || "",
//             starttime: row["Start Time"] || "",
//             endtime: row["End Time"] || ""
//         }));

//         await TimeTable.insertMany(tables);

//         res.status(200).json({ message: 'Events added to database successfully!' });
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         res.status(500).json({ message: 'Failed to upload and save events' });
//     }
// };

// module.exports = { uploadExcel };
