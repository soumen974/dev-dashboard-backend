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

router.post('/createWorkListing', authenticateToken, createWorkListing);

router.get('/workListings', authenticateToken, getAllWorkListings);

router.get('/workListings/:id', authenticateToken, getWorkListingById);

router.put('/workListings/:id', authenticateToken, updateWorkListing);

router.delete('/workListings/:id', authenticateToken, deleteWorkListing);

module.exports = router;
