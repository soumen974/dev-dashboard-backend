const express = require('express');
const {
  createWorkListing,
  getAllWorkListings,
  getWorkListingById,
  updateWorkListing,
  deleteWorkListing,
} = require('../controllers/WorkListingController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

// Create a new work listing
router.post('/createWorkListing', authenticateToken, createWorkListing);

// Get all work listings for the authenticated user
router.get('/workListings', authenticateToken, getAllWorkListings);

// Get a specific work listing by ID
router.get('/workListings/:id', authenticateToken, getWorkListingById);

// Update a specific work listing by ID
router.put('/workListings/:id', authenticateToken, updateWorkListing);

// Delete a specific work listing by ID
router.delete('/workListings/:id', authenticateToken, deleteWorkListing);

module.exports = router;
