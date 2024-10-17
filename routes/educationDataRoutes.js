const express = require('express');
const {
  createEducationData,
  getEducationDataByUsername,
  updateEducationData,
  deleteEducationData
} = require('../controllers/educationDataController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

// Create a new education entry
router.post('/education',authenticateToken, createEducationData);

// Get all education data for a specific user
router.get('/education',authenticateToken, getEducationDataByUsername);

// Update an education entry by ID
router.put('/education/:id', authenticateToken,updateEducationData);

// Delete an education entry by ID
router.delete('/education/:id', authenticateToken,deleteEducationData);

module.exports = router;
